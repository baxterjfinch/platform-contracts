import { Currency, getETHPayment, getSignedPayment, PurchaseProcessor } from '@imtbl/platform';
import { Blockchain, expectRevert, Ganache, generatedWallets } from '@imtbl/test-utils';
import { ethers } from 'ethers';
import 'jest';
import { GU_S1_RARE_CHEST_PRICE, GU_S1_RARE_CHEST_SKU } from '../../../deployment/constants';
import { Chest, RarePack } from '../../../src';
import { deployRareChest, deployRarePack, deployStandards, StandardContracts } from './utils';
import { BigNumber, BigNumberish } from 'ethers/utils';

const provider = new Ganache(Ganache.DefaultOptions);
const blockchain = new Blockchain(provider);
const multiplier = new BigNumber(10).pow(18);

ethers.errors.setLogLevel('error');
jest.setTimeout(60000);

describe('Chest', () => {
  const [owner, other] = generatedWallets(provider);

  beforeEach(async () => {
    await blockchain.resetAsync();
    await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertAsync();
  });

  describe('#purchase ETH', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let chest: Chest;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async () => {
      rare = await deployRarePack(owner, shared);
      chest = await deployRareChest(owner, rare, shared);
    });

    async function purchaseChests(quantity: number) {
      let balance = await chest.balanceOf(owner.address);
      expect(balance.eq(0)).toBe(true);
      const ethRequired = await shared.oracle.convert(1, 0, GU_S1_RARE_CHEST_PRICE * quantity);
      await chest.purchase(quantity, getETHPayment(), ethers.constants.AddressZero, { value: ethRequired });
      balance = await chest.balanceOf(owner.address);
      expect(balance.eq(multiplier.mul(quantity))).toBe(true);
    }

    it('should purchase 1 chest using ETH', async() => {
      await purchaseChests(1);
    });

    it('should purchase 5 chests using ETH', async() => {
      await purchaseChests(5);
    });
  });

  describe('#purchase USD', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let chest: Chest;
    let nonce = 0;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async () => {
      rare = await deployRarePack(owner, shared);
      chest = await deployRareChest(owner, rare, shared);
    });

    async function purchaseChests(quantity: number, escrowFor: number) {
      const value = GU_S1_RARE_CHEST_PRICE * quantity;
      const order = {
        quantity,
        sku: GU_S1_RARE_CHEST_SKU,
        assetRecipient: owner.address,
        changeRecipient: chest.address,
        currency: Currency.USDCents,
        totalPrice: value,
        alreadyPaid: 0
      };
      const params = { value, escrowFor, nonce: nonce++ };
      const payment = await getSignedPayment(
        owner,
        shared.processor.address,
        chest.address,
        order,
        params,
      );
      await chest.purchase(quantity, payment, ethers.constants.AddressZero);
      let expectedUserBalance: BigNumberish;
      let expectedEscrowBalance: BigNumberish;
      if (escrowFor > 0) {
        expectedUserBalance = 0;
        expectedEscrowBalance = multiplier.mul(quantity);
      } else {
        expectedUserBalance = multiplier.mul(quantity);
        expectedEscrowBalance = 0;
      }
      const escrowBalance = await chest.balanceOf(shared.escrow.address);
      const userBalance = await chest.balanceOf(owner.address);
      expect(userBalance.eq(expectedUserBalance)).toBe(true);
      expect(escrowBalance.eq(expectedEscrowBalance)).toBe(true);
    }

    it('should purchase 1 chest using USD with no escrow', async () => {
      await purchaseChests(1, 0);
    });

    it('should purchase 5 chests using USD with no escrow', async () => {
      await purchaseChests(5, 0);
    });

    it('should purchase 1 chest using USD with escrow', async () => {
      await purchaseChests(1, 10000);
    });

    it('should purchase 5 chests using USD with escrow', async () => {
      await purchaseChests(5, 10000);
    });
  });

  describe('#open', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let chest: Chest;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async () => {
      rare = await deployRarePack(owner, shared);
      chest = await deployRareChest(owner, rare, shared);
    });

    async function openChests(quantity: number) {
      const preBalance = await chest.balanceOf(owner.address);
      await chest.open(quantity);
      const postBalance = await chest.balanceOf(owner.address);
      const diff = preBalance.sub(postBalance);
      expect(diff.eq(multiplier.mul(quantity))).toBe(true);
    }

    it('should not be able to open chests with insufficient balance', async () => {
      await expectRevert(chest.open(1));
    });

    it('should be able to open 1 chest', async () => {
      const ethRequired = await shared.oracle.convert(1, 0, GU_S1_RARE_CHEST_PRICE);
      const payment = getETHPayment();
      await chest.purchase(1, payment, ethers.constants.AddressZero, { value: ethRequired });
      await openChests(1);
    });

    it('should be able to open 5 chests', async () => {
      const ethRequired = await shared.oracle.convert(1, 0, GU_S1_RARE_CHEST_PRICE * 5);
      const payment = getETHPayment();
      await chest.purchase(5, payment, ethers.constants.AddressZero, { value: ethRequired });
      await openChests(5);
    });
  });
});
