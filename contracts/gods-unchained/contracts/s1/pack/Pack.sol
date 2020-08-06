pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;

import "@imtbl/platform/contracts/randomness/Beacon.sol";
import "./RarityProvider.sol";
import "./IPack.sol";
import "../S1Vendor.sol";

contract Pack is IPack, S1Vendor, RarityProvider {

    // Emitted when a card commitment is recorded (either purchase or opening a chest)
    event CommitmentRecorded(uint256 indexed commitmentID, Commitment commitment);

    // A commitment to generating a certain number of packs for a certain user
    // Prefer commitment to purchase (includes cards opened from chests)
    struct Commitment {
        uint256 escrowFor;
        uint256 paymentID;
        address recipient;
        uint64 commitBlock;
        uint16 quantity;
        bool grantsTickets;
    }

    // All commitments recorded by this pack
    mapping(uint256 => Commitment) public commitments;
    // The randomness beacon used by this pack
    Beacon public beacon;
    // The address of the chest linked to this pack
    address public chest;
    // The number of commitments
    uint256 public commitmentCount;

    function _getCardDetails(uint _index, uint _random)
        internal
        view
        returns (uint16 proto, uint8 quality);

    function _getTicketsInPack(uint _index, uint _random)
        internal
        pure
        returns (uint16);

    constructor(
        Beacon _beacon,
        S1Cap _cap,
        IReferral _referral,
        bytes32 _sku,
        uint256 _price,
        CreditCardEscrow _escrow,
        PurchaseProcessor _pay
    ) public S1Vendor(_cap, _referral, _sku, _price, _escrow, _pay) {
        beacon = _beacon;
    }

    /** @dev Set the chest address for this contract
     *
     * @param _chest the chest contract for this pack
     */
    function setChest(address _chest) external onlyOwner {
        require(
            chest == address(0),
            "S1Pack: must not have already set chest"
        );
        chest = _chest;
    }

    /** @dev Purchase packs for a user
     *
     * @param _recipient the user who will receive the packs
     * @param _quantity the number of packs to purchase
     * @param _payment the details of the method by which payment will be made
     * @param _referrer the address of the user who made this referral
     */
    function purchaseFor(
        address payable _recipient,
        uint256 _quantity,
        PurchaseProcessor.PaymentParams memory _payment,
        address payable _referrer
    )
        public
        payable
        returns (PurchaseProcessor.Receipt memory)
    {
        PurchaseProcessor.Receipt memory receipt = super.purchaseFor(
            _recipient,
            _quantity,
            _payment,
            _referrer
        );
        if (_payment.currency == PurchaseProcessor.Currency.ETH) {
            _createCommitment(receipt.id, _recipient, _quantity, 0, true);
        } else {
            _createCommitment(receipt.id, _recipient, _quantity, _payment.escrowFor, true);
        }
        return receipt;
    }

    function predictCards(
        uint256 _commitmentID
    ) external view returns (
        uint16[] memory protos,
        uint8[] memory qualities
    ) {
        Commitment memory commitment = commitments[_commitmentID];
        require(commitment.quantity != 0, "must have packs");
        bytes32 base = beacon.randomness(commitment.commitBlock);
        uint256 randomness = uint256(keccak256(abi.encodePacked(base, address(this), _commitmentID)));
        uint256 numCards = uint(commitment.quantity).mul(5);
        protos = new uint16[](numCards);
        qualities = new uint8[](numCards);
        for (uint i = 0; i < numCards; i++) {
            (protos[i], qualities[i]) = _getCardDetails(i, randomness);
        }
        return (protos, qualities);
    }

    function predictTickets(uint256 _commitmentID) external view returns (uint16[] memory tickets) {
        Commitment memory commitment = commitments[_commitmentID];
        require(commitment.quantity != 0, "must have packs");
        require(commitment.grantsTickets, "must grant tickets");
        bytes32 base = beacon.randomness(commitment.commitBlock);
        uint256 randomness = uint256(keccak256(abi.encodePacked(base, address(this), _commitmentID)));
        tickets = new uint16[](commitment.quantity);
        for (uint i = 0; i < commitment.quantity; i++) {
            tickets[i] = _getTicketsInPack(i, randomness);
        }
        return tickets;
    }

    function openChests(address _recipient, uint256 _quantity) external {
        require(
            msg.sender == chest,
            "S1Pack: must be the chest contract"
        );
        _createCommitment(0, _recipient, _quantity.mul(6), 0, !paused);
    }

    function _createCommitment(
        uint256 _paymentID,
        address _recipient,
        uint256 _quantity,
        uint256 _escrowFor,
        bool _grantsTickets
    ) internal returns (uint256) {
        require(_quantity == uint16(_quantity), "must not overflow");
        uint256 commitBlock = beacon.commit(0);
        uint256 commitmentID = commitmentCount++;
        Commitment memory commitment = Commitment({
            commitBlock: uint64(commitBlock),
            quantity: uint16(_quantity),
            recipient: _recipient,
            escrowFor: _escrowFor,
            paymentID: _paymentID,
            grantsTickets: _grantsTickets
        });

        commitments[commitmentID] = commitment;
        emit CommitmentRecorded(commitmentID, commitment);
    }

}