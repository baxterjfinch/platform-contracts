pragma solidity 0.5.11;
pragma experimental ABIEncoderV2;

import "../RarityProvider.sol";
import "../../S1Vendor.sol";

contract OptimizedPack is S1Vendor, RarityProvider {

    // Emitted when a card commitment is recorded (either purchase or opening a chest)
    event CommitmentRecorded(uint256 indexed commitmentID, Commitment commitment);

    // A commitment to generating a certain number of packs for a certain user
    // Prefer commitment to purchase (includes cards opened from chests)
    struct Commitment {
        uint256 escrowFor;
        uint256 paymentID;
        address recipient;
        uint16 quantity;
        bool grantsTickets;
    }

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
        S1Cap _cap,
        bytes32 _sku,
        uint256 _price,
        PurchaseProcessor _pay
    ) public S1Vendor(_cap, _sku, _price, _pay) {
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
            _createCommitment(receipt.id, _recipient, _quantity, _payment.escrowFor, false);
        }
        return receipt;
    }

    function predictCards(
        uint256 _commitmentID,
        bytes32 _commitmentBlockHash,
        uint16 _quantity
    ) external view returns (
        uint16[] memory protos,
        uint8[] memory qualities
    ) {
        require(_quantity > 0, "must have packs");
        uint256 randomness = uint256(keccak256(abi.encodePacked(_commitmentBlockHash, address(this), _commitmentID)));
        uint256 numCards = uint(_quantity).mul(5);
        protos = new uint16[](numCards);
        qualities = new uint8[](numCards);
        for (uint i = 0; i < numCards; i++) {
            (protos[i], qualities[i]) = _getCardDetails(i, randomness);
        }
        return (protos, qualities);
    }

    function predictTickets(
        uint256 _commitmentID,
        bytes32 _commitmentBlockHash,
        uint16 _quantity
    ) external view returns (uint16[] memory tickets) {
        require(_quantity > 0, "must grant tickets");
        uint256 randomness = uint256(keccak256(abi.encodePacked(_commitmentBlockHash, address(this), _commitmentID)));
        tickets = new uint16[](_quantity);
        for (uint i = 0; i < _quantity; i++) {
            tickets[i] = _getTicketsInPack(i, randomness);
        }
        return tickets;
    }

    function _createCommitment(
        uint256 _paymentID,
        address _recipient,
        uint256 _quantity,
        uint256 _escrowFor,
        bool _grantsTickets
    ) internal {
        require(_quantity == uint16(_quantity), "must not overflow");
        uint256 commitmentID = commitmentCount++;
        Commitment memory commitment = Commitment({
            quantity: uint16(_quantity),
            recipient: _recipient,
            escrowFor: _escrowFor,
            paymentID: _paymentID,
            grantsTickets: _grantsTickets
        });
        emit CommitmentRecorded(commitmentID, commitment);
    }

}