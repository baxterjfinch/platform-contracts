
import { Wallet } from 'ethers';

import { 
    Referral, EpicPack, RarePack, LegendaryPack, ShinyPack, Cards, Raffle, Chest, S1Cap
} from '../../../src/contracts';
import { PurchaseProcessor, CreditCardEscrow, Escrow, Beacon, ETHUSDMockOracle } from '@imtbl/platform';
import { constants } from '../../../src/constants';

const MAX_MINT = 5;

export interface StandardContracts {
    cap: S1Cap;
    escrow: Escrow;
    cc: CreditCardEscrow;
    referral: Referral;
    raffle: Raffle;
    oracle: ETHUSDMockOracle;
    processor: PurchaseProcessor;
    cards: Cards;
    beacon: Beacon;
}

export async function deployStandards(owner: Wallet): Promise<StandardContracts>  {
    const cap = await S1Cap.deploy(owner, constants.Development.S1.Cap);
    const escrow = await Escrow.deploy(owner, 250);
    const cc = await CreditCardEscrow.deploy(owner, escrow.address, owner.address, 100, owner.address, 100);
    const beacon = await Beacon.deploy(owner);
    const referral = await Referral.deploy(owner, 90, 10);
    const processor = await PurchaseProcessor.deploy(owner, owner.address);
    const raffle = await Raffle.deploy(owner, constants.Development.S1.Raffle.TokenName, constants.Development.S1.Raffle.TokenSymbol);
    const oracle = await ETHUSDMockOracle.deploy(owner);
    const cards = await Cards.deploy(owner, 1250, 'Cards', 'CARD');
    await processor.setOracle(oracle.address);
    await processor.setSignerLimit(owner.address, 1000000000000000);
    await cards.startSeason('S1', 800, 1000);
    return {
        cap: cap,
        escrow: escrow,
        cc: cc,
        beacon: beacon,
        referral: referral,
        processor: processor,
        raffle: raffle,
        oracle: oracle,
        cards: cards
    };
}

export async function deployEpicPack(owner: Wallet, params: StandardContracts) {
    const pack = await EpicPack.deploy(
        owner,
        params.cap.address,
        MAX_MINT,
        params.raffle.address,
        params.beacon.address,
        params.cards.address,
        params.referral.address,
        constants.Development.S1.Pack.Epic.SKU,
        constants.Development.S1.Pack.Epic.Price,
        params.cc.address,
        params.processor.address
    );
    await approvePack(pack.address, constants.Development.S1.Pack.Epic.SKU, params);
    return pack;
}

export async function deployRarePack(owner: Wallet, params: StandardContracts) {
    const pack = await RarePack.deploy(
        owner,
        params.cap.address,
        MAX_MINT,
        params.raffle.address,
        params.beacon.address,
        params.cards.address,
        params.referral.address,
        constants.Development.S1.Pack.Rare.SKU,
        constants.Development.S1.Pack.Rare.Price,
        params.cc.address,
        params.processor.address
    );
    await approvePack(pack.address, constants.Development.S1.Pack.Rare.SKU, params);
    return pack;
}

export async function deployLegendaryPack(owner: Wallet, params: any) {
    const pack = await LegendaryPack.deploy(
        owner,
        params.cap.address,
        MAX_MINT,
        params.raffle.address,
        params.beacon.address,
        params.cards.address,
        params.referral.address,
        constants.Development.S1.Pack.Legendary.SKU,
        constants.Development.S1.Pack.Legendary.Price,
        params.cc.address,
        params.processor.address
    );
    await approvePack(pack.address, constants.Development.S1.Pack.Legendary.SKU, params);
    return pack;
}

export async function deployShinyPack(owner: Wallet, params: StandardContracts) {
    const pack = await ShinyPack.deploy(
        owner,
        params.cap.address,
        MAX_MINT,
        params.raffle.address,
        params.beacon.address,
        params.cards.address,
        params.referral.address,
        constants.Development.S1.Pack.Shiny.SKU,
        constants.Development.S1.Pack.Shiny.Price,
        params.cc.address,
        params.processor.address
    );
    await approvePack(pack.address, constants.Development.S1.Pack.Shiny.SKU, params);
    return pack;
}

export async function deployRareChest(owner: Wallet, rare: RarePack, params: StandardContracts): Promise<Chest> {
    const chest = await Chest.deploy(
        owner,
        constants.Development.S1.Chest.Rare.TokenName,
        constants.Development.S1.Chest.Rare.TokenSymbol,
        rare.address,
        constants.Development.S1.Chest.Rare.Cap,
        params.cap.address,
        params.referral.address,
        constants.Development.S1.Chest.Rare.SKU,
        constants.Development.S1.Chest.Rare.Price,
        params.cc.address,
        params.processor.address,
    );
    await rare.setChest(chest.address);
    await params.processor.setSellerApproval(chest.address, [constants.Development.S1.Chest.Rare.SKU], true);
    await params.cap.setCanUpdate([chest.address], true);
    return chest;
}

export async function deployLegendaryChest(owner: Wallet, legendary: LegendaryPack, params: StandardContracts): Promise<Chest> {
    const chest = await Chest.deploy(
        owner,
        constants.Development.S1.Chest.Legendary.TokenName,
        constants.Development.S1.Chest.Legendary.TokenSymbol,
        legendary.address,
        constants.Development.S1.Chest.Legendary.Cap,
        params.cap.address,
        params.referral.address,
        constants.Development.S1.Chest.Legendary.SKU,
        constants.Development.S1.Chest.Legendary.Price,
        params.cc.address,
        params.processor.address,
    );
    await legendary.setChest(chest.address);
    await params.processor.setSellerApproval(chest.address, [constants.Development.S1.Chest.Legendary.SKU], true);
    await params.cap.setCanUpdate([chest.address], true);
    return chest;
}

async function approvePack(packAddress: string, sku: string, params: any) {
    await params.processor.setSellerApproval(packAddress, [sku], true);
    await params.cards.addFactory(packAddress, 1);
    await params.raffle.setMinterApproval(packAddress, true);
    await params.cap.setCanUpdate([packAddress], true);
}