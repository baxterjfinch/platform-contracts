import { Currency, getETHPayment, getSignedPayment, Order } from '@imtbl/platform';
import { Blockchain, Ganache, generatedWallets } from '@imtbl/test-utils';
import { ethers } from 'ethers';
import 'jest';
import { GU_S1_RARE_PACK_PRICE, GU_S1_RARE_PACK_SKU } from '../../../deployment/constants';
import { RarePack, S1Sale } from '../../../src/contracts';
import { deployRarePack, deployStandards, StandardContracts } from './utils';

jest.setTimeout(600000);
const provider = new Ganache(Ganache.DefaultOptions);
const blockchain = new Blockchain(provider);
ethers.errors.setLogLevel('error');

describe('Sale', () => {
  const [owner, other] = generatedWallets(provider);

  beforeEach(async () => {
    await blockchain.resetAsync();
    await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertAsync();
  });

  describe('purchaseFor with USD', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let sale: S1Sale;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
      sale = await S1Sale.deploy(owner);
    });

    async function purchasePacks(products: string[], quantities: number[], prices: number[]) {
      const payments = await Promise.all(
        quantities.map(async (quantity, i) => {
          const cost = prices[i];
          const order: Order = {
            quantity,
            sku: GU_S1_RARE_PACK_SKU,
            assetRecipient: owner.address,
            changeRecipient: sale.address,
            totalPrice: cost * quantity,
            currency: Currency.USDCents,
            alreadyPaid: 0
          };
          const params = { escrowFor: 0, nonce: i, value: cost * quantity };
          return {
            quantity,
            payment: await getSignedPayment(owner, shared.processor.address, rare.address, order, params),
            vendor: products[i],
          };
        }),
      );
      await sale.purchaseFor(owner.address, payments, ethers.constants.AddressZero);
    }

    it('should purchase one item', async () => {
      await purchasePacks([rare.address], [1], [GU_S1_RARE_PACK_PRICE]);
    });

    it('should purchase two items', async () => {
      await purchasePacks([rare.address, rare.address], [1, 1], [GU_S1_RARE_PACK_PRICE, GU_S1_RARE_PACK_PRICE]);
    });
  });

  describe('referred purchaseFor with USD', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let sale: S1Sale;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
      sale = await S1Sale.deploy(owner);
    });

    async function purchasePacks(products: string[], quantities: number[], prices: number[]) {
      const payments = await Promise.all(
        quantities.map(async (quantity, i) => {
          const cost = prices[i];
          const order: Order = {
            quantity,
            sku: GU_S1_RARE_PACK_SKU,
            assetRecipient: owner.address,
            changeRecipient: sale.address,
            totalPrice: cost * quantity,
            currency: Currency.USDCents,
            alreadyPaid: 0
          };
          const params = { escrowFor: 0, nonce: i, value: cost * quantity };
          return {
            quantity,
            payment: await getSignedPayment(owner, shared.processor.address, rare.address, order, params),
            vendor: products[i],
          };
        }),
      );
      await sale.purchaseFor(owner.address, payments, other.address);
    }

    it('should purchase one item', async () => {
      await purchasePacks([rare.address], [1], [GU_S1_RARE_PACK_PRICE]);
    });

    it('should purchase two items', async () => {
      await purchasePacks([rare.address, rare.address], [1, 1], [GU_S1_RARE_PACK_PRICE, GU_S1_RARE_PACK_PRICE]);
    });
  });

  describe('should do the whole purchase lifecycle', () => {

    let shared: StandardContracts;
    let rare: RarePack;
    let sale: S1Sale;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
      sale = await S1Sale.deploy(owner);
    });

    async function purchasePacks(user: string, escrowFor: number, products: string[], quantities: number[], prices: number[]) {
      const payments = await Promise.all(
        quantities.map(async (quantity, i) => {
          const cost = prices[i];
          const order: Order = {
            quantity,
            sku: GU_S1_RARE_PACK_SKU,
            assetRecipient: user,
            changeRecipient: sale.address,
            totalPrice: cost * quantity,
            currency: Currency.USDCents,
            alreadyPaid: 0
          };
          const params = { escrowFor: escrowFor, nonce: i, value: cost * quantity };
          return {
            quantity,
            payment: await getSignedPayment(owner, shared.processor.address, rare.address, order, params),
            vendor: products[i],
          };
        }),
      );
      await sale.purchaseFor(user, payments, other.address);
    }

    it('should do the whole lifecycle on one pack', async () => {
      await purchasePacks(ethers.constants.AddressZero, 100, [rare.address], [1], [GU_S1_RARE_PACK_PRICE]);
      await rare.mint(0);
      await blockchain.increaseTimeAsync(101);
      await shared.cc.requestRelease(0, owner.address);
      await blockchain.increaseTimeAsync(101);
      await shared.cards.unlockTrading(1);
      await shared.cc.release(0);
      expect(await shared.cards.ownerOf(0)).toBe(owner.address);
    });

  });

  describe('purchaseFor with ETH', () => {
    
    let shared: StandardContracts;
    let rare: RarePack;
    let sale: S1Sale;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
      sale = await S1Sale.deploy(owner);
    });

    async function purchasePacks(products: string[], quantities: number[], prices: number[]) {
      let totalCost = 0;
      const payments = quantities.map((quantity, i) => {
        totalCost += quantity * prices[i];
        return {
          quantity,
          payment: getETHPayment(),
          vendor: products[i],
        };
      });
      const ethRequired = await shared.oracle.convert(1, 0, totalCost);
      await sale.purchaseFor(owner.address, payments, ethers.constants.AddressZero, { value: ethRequired.mul(10) });
    }

    it('should purchase one item', async () => {
      await purchasePacks([rare.address], [1], [GU_S1_RARE_PACK_PRICE]);
    });

    it('should purchase two items', async () => {
      await purchasePacks([rare.address, rare.address], [1, 1], [GU_S1_RARE_PACK_PRICE, GU_S1_RARE_PACK_PRICE]);
    });
  });

  describe('referred purchaseFor with ETH', () => {
    
    let shared: StandardContracts;
    let rare: RarePack;
    let sale: S1Sale;

    beforeAll(async() => {
      shared = await deployStandards(owner);
    });

    beforeEach(async() => {
      rare = await deployRarePack(owner, shared);
      sale = await S1Sale.deploy(owner);
    });

    async function purchasePacks(products: string[], quantities: number[], prices: number[]) {
      let totalCost = 0;
      const payments = quantities.map((quantity, i) => {
        totalCost += quantity * prices[i];
        return {
          quantity,
          payment: getETHPayment(),
          vendor: products[i],
        };
      });
      const ethRequired = await shared.oracle.convert(1, 0, totalCost);
      await sale.purchaseFor(owner.address, payments, other.address, { value: ethRequired });
    }

    it('should purchase one item', async () => {
      await purchasePacks([rare.address], [1], [GU_S1_RARE_PACK_PRICE]);
    });

    it('should purchase two items', async () => {
      await purchasePacks([rare.address, rare.address], [1, 1], [GU_S1_RARE_PACK_PRICE, GU_S1_RARE_PACK_PRICE]);
    });
  });
});
