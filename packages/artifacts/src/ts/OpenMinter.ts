export const OpenMinter = [
  {
    "constant": true,
    "inputs": [],
    "name": "cards",
    "outputs": [
      {
        "internalType": "contract ICards",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract ICards",
        "name": "_cards",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint16[]",
        "name": "_protos",
        "type": "uint16[]"
      },
      {
        "internalType": "uint8[]",
        "name": "_qualities",
        "type": "uint8[]"
      }
    ],
    "name": "mintCards",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]