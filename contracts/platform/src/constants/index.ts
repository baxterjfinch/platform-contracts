
export const IM_ESCROW_CAPACITY = 250;

import { ethers } from 'ethers';

export const IM_ESCROW_DESTRUCTION_DELAY = {
    1: '',
    3: '60',
    50: '60',
};

export const IM_ESCROW_DESTROYER = {
    1: '',
    3: '0x198e10b883B5A64F4ad46038B7Fb0691D20929eF',
    50: '0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb',
};
  
export const IM_ESCROW_CUSTODIAN = {
    1: '',
    3: '0x198e10b883B5A64F4ad46038B7Fb0691D20929eF',
    50: '0xE36Ea790bc9d7AB70C55260C66D52b1eca985f84',
};

export const INTENDED_OWNER = {
    1: '0xed824e513aff2545af0b6bb11ec2c503560e7672',
    3: '',
    50: '',
};
  
export const IM_ESCROW_RELEASE_DELAY = {
    1: '',
    3: '60',
    50: '60',
};
export const IM_PROCESSOR_FIRST_SIGNER = {
    1: '',
    3: '0x198e10b883B5A64F4ad46038B7Fb0691D20929eF',
    50: '0x5409ED021D9299bf6814279A6A1411A7e866A631',
};
export const MEDIANIZER_ADDRESS = {
    1: '0x729d19f657bd0614b4985cf1d82531c67569197b',
    3: '',
    50: '',
};
export const PROCESSOR_REVENUE_WALLET = {
    1: ethers.constants.AddressZero,
    3: '0x5409ED021D9299bf6814279A6A1411A7e866A631',
    50: '0x5409ED021D9299bf6814279A6A1411A7e866A631',
};