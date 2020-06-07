import { Currency, getETHPayment, getSignedPayment, Order } from '@imtbl/platform';
import { Blockchain, expectRevert, Ganache, generatedWallets } from '@imtbl/test-utils';
import { ethers } from 'ethers';
import 'jest';
import { constants } from '../../../../src/constants';
import { EpicPack } from '../../../../src/contracts';
import { deployEpicPack, deployStandards, StandardContracts } from '../utils';

jest.setTimeout(600000);
ethers.errors.setLogLevel('error');
const provider = new Ganache(Ganache.DefaultOptions);
const blockchain = new Blockchain(provider);
const MAX_MINT = 5;

describe('Multi-Mint Pack', () => {

  const [owner] = generatedWallets(provider);

  beforeEach(async () => {
    await blockchain.resetAsync();
    await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertAsync();
  });

  describe('purchase USD', () => {

    let shared: StandardContracts;
    let epic: EpicPack;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      epic = await deployEpicPack(owner, shared);
    })

    async function purchasePacks(quantity: number) {
      const order: Order = {
        quantity, sku: constants.Development.S1.Pack.Epic.SKU,
        assetRecipient: owner.address,
        changeRecipient: owner.address,
        alreadyPaid: 0,
        totalPrice: constants.Development.S1.Pack.Epic.Price * quantity,
        currency: Currency.USDCents
      };
      const params = { escrowFor: 0, nonce: 0, value: constants.Development.S1.Pack.Epic.Price * quantity };
      const payment = await getSignedPayment(
         owner, shared.processor.address, epic.address, order, params
      );
      await epic.purchase(quantity, payment, ethers.constants.AddressZero);
      for (let i = 0; i < quantity; i += MAX_MINT) {
        await epic.mint(0);
      }
    }

    it('should purchase max + 1 packs with USD', async () => {
      await purchasePacks(MAX_MINT + 1);
      // should have minted everything
      await expectRevert(epic.mint(0));
    });

    it('should purchase 2 * max + 1 packs with USD', async () => {
      await purchasePacks(2 * MAX_MINT + 1);
      // should have minted everything
      await expectRevert(epic.mint(0));
    });

  });

  describe('purchase ETH', () => {

    let shared: StandardContracts;
    let epic: EpicPack;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      epic = await deployEpicPack(owner, shared);
    });

    async function purchasePacks(quantity: number) {
      const payment = getETHPayment();
      const ethRequired = await shared.oracle.convert(1, 0, constants.Development.S1.Pack.Epic.Price * quantity);
      await epic.purchase(quantity, payment, ethers.constants.AddressZero, { value: ethRequired });
      for (let i = 0; i < quantity; i += MAX_MINT) {
        await epic.mint(0);
      }
    }

    it('should purchase 6 with ETH', async () => {
      await purchasePacks(MAX_MINT + 1);
      // should have minted everything
      await expectRevert(epic.mint(0));
    });

    it('should purchase 11 with ETH', async () => {
      await purchasePacks(2 * MAX_MINT + 1);
      // should have minted everything
      await expectRevert(epic.mint(0));
    });

  });

});
