import { Ganache, generatedWallets } from '@imtbl/test-utils';
import { parseLogs } from '@imtbl/utils';
import { ethers } from 'ethers';
import 'jest';
import { Cards } from '../../src/contracts';

jest.setTimeout(60000);
ethers.errors.setLogLevel('error');
const provider = new Ganache(Ganache.DefaultOptions);

describe('ERC721', () => {
  const [ownerWallet, userWallet] = generatedWallets(provider);
  const BATCH_SIZE = 101;

  let cards: Cards;
  let mythicThreshold: number;

  let start: number;

  /**
   * These tests are meant to be simple as only the cards need to be minted and the rest
   * are simply checking if logs are emitted and correct values are returned
   */

  beforeAll(async () => {
    cards = await Cards.deploy(ownerWallet, BATCH_SIZE, 'Test', 'TEST');

    mythicThreshold = await cards.MYTHIC_THRESHOLD();

    await cards.startSeason('Genesis', 1, 377);
    await cards.startSeason('Etherbots', 380, 396);
    await cards.startSeason('Promo', 400, 500);
    await cards.addFactory(ownerWallet.address, 1);
    await cards.approveForMythic(ownerWallet.address, mythicThreshold);
    await cards.approveForMythic(ownerWallet.address, mythicThreshold + 1);
    await cards.unlockTrading(1);
    await cards.unlockTrading(2);
    await cards.unlockTrading(3);
  });

  it('should mint cards and return the correct ids', async () => {
    const tx = await cards.mintCards(
      ownerWallet.address,
      Array(5).fill(1),
      Array(5).fill(1),
    );

    const receipt = await tx.wait();
    const parsed = parseLogs(receipt.logs, Cards.ABI);

    start = parsed[5].values.start;

    expect(parsed.length).toBe(6);
    expect(parsed[0].name).toBe('Transfer');
    expect(parsed[0].values.to).toBe(ownerWallet.address);

    expect(parsed[5].name).toBe('CardsMinted');
    expect(parsed[5].values.protos).toStrictEqual([1, 1, 1, 1, 1]);

    const supply = await cards.totalSupply();
    expect(supply.toNumber()).toBe(5);
  });

  it('should be able to transfer tokens', async () => {
    const transferTx = await cards.transferFrom(
      ownerWallet.address,
      userWallet.address,
      0,
    );

    const receipt = await transferTx.wait();
    const parsed = parseLogs(receipt.logs, Cards.ABI);

    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Transfer');
    expect(parsed[0].values.from).toBe(ownerWallet.address);
    expect(parsed[0].values.to).toBe(userWallet.address);
  });

  it('should be able to give approval', async () => {
    const approvalTx = await cards.approve(userWallet.address, 1);
    const receipt = await approvalTx.wait();
    const parsed = parseLogs(receipt.logs, Cards.ABI);

    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Approval');
    expect(parsed[0].values.owner).toBe(ownerWallet.address);
    expect(parsed[0].values.approved).toBe(userWallet.address);

    const approvalOwner = await cards.getApproved(1);
    expect(approvalOwner).toBe(userWallet.address);
  });

  it('should be able to spend approval', async () => {
    const core = Cards.at(userWallet, cards.address);
    const transferTx = await core.transferFrom(ownerWallet.address, userWallet.address, 1);

    const receipt = await transferTx.wait();
    const parsed = parseLogs(receipt.logs, Cards.ABI);

    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Transfer');
    expect(parsed[0].values.from).toBe(ownerWallet.address);
    expect(parsed[0].values.to).toBe(userWallet.address);
  });

  it('should be able to burn cards', async () => {
    const burnTx = await cards.burn(2);
    const receipt = await burnTx.wait();
    const parsed = parseLogs(receipt.logs, Cards.ABI);

    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Transfer');
    expect(parsed[0].values.from).toBe(ownerWallet.address);
    expect(parsed[0].values.to).toBe(ethers.constants.AddressZero);
  });
});
