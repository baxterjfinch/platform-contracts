import { Currency, getSignedPayment } from '@imtbl/platform';
import { Blockchain, Ganache, generatedWallets } from '@imtbl/test-utils';
import { ethers } from 'ethers';
import 'jest';
import { constants } from '../../../src/constants';
import { Chest, Raffle, RarePack } from '../../../src/contracts';
import { deployRareChest, deployRarePack, deployStandards, StandardContracts } from './utils';

jest.setTimeout(600000);
ethers.errors.setLogLevel('error');
const provider = new Ganache(Ganache.DefaultOptions);
const blockchain = new Blockchain(provider);

describe('Raffle', () => {
  const [owner] = generatedWallets(provider);

  beforeEach(async () => {
    await blockchain.resetAsync();
    await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertAsync();
  });

  describe('deployment', () => {
    beforeEach(async () => {
      await Raffle.deploy(owner, constants.Development.S1.Raffle.TokenName, constants.Development.S1.Raffle.TokenSymbol);
    });

    it('should deploy raffle contract', async () => {});
  });

  describe('purchase', () => {

    let shared: StandardContracts;
    let rare: RarePack;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
    });

    async function purchasePacks(quantity: number) {
      const order = {
        quantity,
        sku: constants.Development.S1.Pack.Rare.SKU,
        assetRecipient: owner.address,
        changeRecipient: owner.address,
        totalPrice: constants.Development.S1.Pack.Rare.Price * quantity,
        alreadyPaid: 0,
        currency: Currency.USDCents,
      };
      const params = { escrowFor: 0, nonce: 0, value: constants.Development.S1.Pack.Rare.Price * quantity };
      const payment = await getSignedPayment(owner, shared.processor.address, rare.address, order, params);
      await rare.purchase(quantity, payment, ethers.constants.AddressZero);
    }

    it('should purchase one pack with USD', async () => {
      await purchasePacks(1);
      const commitment = await rare.commitments(0);
      const q = commitment.ticketQuantity.toNumber();
      expect(q).toBe(1);
    });

    it('should purchase two packs with USD', async () => {
      await purchasePacks(2);
      const commitment = await rare.commitments(0);
      const q = commitment.ticketQuantity.toNumber();
      expect(q).toBe(2);
    });

  });

  describe('mint', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let raffle: Raffle;

    beforeAll(async() => {
      shared = await deployStandards(owner);
      raffle = shared.raffle;
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
    });

    async function purchase(quantity: number, escrowFor: number) {
      const order = {
        quantity,
        sku: constants.Development.S1.Pack.Rare.SKU,
        assetRecipient: owner.address,
        changeRecipient: owner.address,
        totalPrice: constants.Development.S1.Pack.Rare.Price * quantity,
        currency: Currency.USDCents,
        alreadyPaid: 0
      };
      const params = { escrowFor, nonce: 0, value: constants.Development.S1.Pack.Rare.Price * quantity };
      const payment = await getSignedPayment(owner, shared.processor.address, rare.address, order, params);
      await rare.purchase(quantity, payment, ethers.constants.AddressZero);
    }

    async function mintTrackGas(id: number, description: string) {
      await rare.mint(id);
      // const tx = await rare.mint(id);
      // const receipt = await tx.wait();
      // console.log(description, receipt.gasUsed.toNumber());
    }

    it('should create cards from 1 pack', async () => {
      await purchase(1, 100);
      await rare.mint(0);
      const escrowBalance = await raffle.balanceOf(shared.escrow.address);
      expect(escrowBalance.toNumber()).toBeGreaterThan(0);
      const userBalance = await raffle.balanceOf(owner.address);
      expect(userBalance.toNumber()).toBe(0);
    });

    it('should create cards from 2 packs', async () => {
      await purchase(2, 100);
      await rare.mint(0);
      const escrowBalance = await raffle.balanceOf(shared.escrow.address);
      expect(escrowBalance.toNumber()).toBeGreaterThan(0);
      const userBalance = await raffle.balanceOf(owner.address);
      expect(userBalance.toNumber()).toBe(0);
    });

    it('should create cards from 1 packs with no escrow', async () => {
      await purchase(1, 0);
      await mintTrackGas(0, '1 pack no escrow');
      const escrowBalance = await raffle.balanceOf(shared.escrow.address);
      expect(escrowBalance.toNumber()).toBe(0);
      const userBalance = await raffle.balanceOf(owner.address);
      expect(userBalance.toNumber()).toBeGreaterThan(0);
    });

    it('should create cards from 2 packs with no escrow', async () => {
      await purchase(2, 0);
      await mintTrackGas(0, '2 packs no escrow');
      const escrowBalance = await raffle.balanceOf(shared.escrow.address);
      expect(escrowBalance.toNumber()).toBe(0);
      const userBalance = await raffle.balanceOf(owner.address);
      expect(userBalance.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('openChest', () => {
    
    let shared: StandardContracts;
    let rare: RarePack;
    let chest: Chest;
    let raffle: Raffle;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
      chest = await deployRareChest(owner, rare, shared);
      raffle = shared.raffle;
    });

    async function purchaseAndOpenChests(quantity: number, pause = false) {
      if (pause) {
        await rare.pause();
      }
      const balance = await chest.balanceOf(owner.address);
      expect(balance.toNumber()).toBe(0);
      const value = constants.Development.S1.Chest.Rare.Price * quantity;
      const order = {
        quantity,
        sku: constants.Development.S1.Chest.Rare.SKU,
        assetRecipient: owner.address,
        changeRecipient: owner.address,
        currency: Currency.USDCents,
        totalPrice: value,
        alreadyPaid: 0,
      };
      const params = { value, escrowFor: 0, nonce: 0 };
      const payment = await getSignedPayment(
        owner,
        shared.processor.address,
        chest.address,
        order,
        params,
      );
      await chest.purchase(quantity, payment, ethers.constants.AddressZero);
      await chest.open(quantity);
      const purchase = await rare.commitments(0);
      expect(purchase.packQuantity.toNumber()).toBe(quantity * 6);
    }

    it('should create raffle tickets when contract unpaused', async () => {
      await purchaseAndOpenChests(1, false);
      await rare.mint(0);
      const escrowBalance = await raffle.balanceOf(shared.escrow.address);
      expect(escrowBalance.toNumber()).toBe(0);
      const userBalance = await raffle.balanceOf(owner.address);
      expect(userBalance.toNumber()).toBeGreaterThan(0);
    });

    it('should not create raffle tickets when contract paused', async () => {
      await purchaseAndOpenChests(1, true);
      await rare.mint(0);
      const escrowBalance = await raffle.balanceOf(shared.escrow.address);
      expect(escrowBalance.toNumber()).toBe(0);
      const userBalance = await raffle.balanceOf(owner.address);
      expect(userBalance.toNumber()).toBe(0);
    });
  });
});
