/* tslint:disable */

export const outputs = {
  "1-production": {
    "human_friendly_name": "main-net-production",
    "addresses": {
      "LegacyCards": "0x6EbeAf8e8E946F0716E6533A6f2cefc83f60e8Ab",
      "Cards": "0x0e3a2a1f2146d86a604adc220b4967a898d7fe07",
      "Forwarder": "0xb04239b53806ab31141e6cd47c63fb3480cac908",
      "Fusing": "0x7c633611d9199Faff68bCE5c5Ad97d3514319B77",
      "S3PromoFactory": "0x28A54b2b798Bb8b8751D1Cd423A435472a009272",
      "S5PromoFactory": "0x8eB207F54846614Aebe3335DF2BD351823a04316",
      "Forge": "0x604b7a4a8ad3c4bc876c660a74b1a6e147b156c0",
      "BLACKLIST_Fusing": "0x833EA312aC6Ef27d2ca40BF247B0c5edbe991314",
      "EtherbotsMigration": "0xa777967d22043BE43f8fAd3552AD486f3765FD29",
      "ChimeraMigration": "0xc0f1eE9884Be19c4bB2e31F505f7a18FdB9c8025",
      "GU_GENESIS_BOARD": "0xdad917D2FdF8DB6f43DDfE8B97D3658de3f8d0D0",
      "GU_HYDRA_TRINKET": "0xD18D8bd9ab44Bfc245F1A7Cf93f60CF5b4541cDE",
      "GU_HYPERION_WHITE_STAR": "0x69e92C16B66020e6c22bB6e478C6dcebB72F8b70",
      "GU_HYPERION_BLACK_STAR": "0xc639246eB3758349846E1FBBd2EEb77FBcc13c77",
      "GU_ATLAS_BELT": "0x92E1121149AC6c71a00555D62e41054910495616",
      "GU_PROMETHEAN_CHAIN": "0x9839499c38aCbd6e11b4Af0E50CC2259bFFeAc51",
      "GU_ROYAL_CARD_BACK": "0xfE707AbAEAd863313d926F7B369977c3B626678F"
    },
    "dependencies": {
      "WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "ZERO_EX_EXCHANGE": "0x080bf510fcbf18b91105470639e9561022937712",
      "ZERO_EX_ERC20_PROXY": "0x95e6f48254609a6ee006f7d493c8e5fb97094cef",
      "ZERO_EX_ERC721_PROXY": "0xefc70a1b18c432bdc64b596838b4d138f6bc6cad"
    },
    "state": {
      "network_id": 1,
      "last_deployment_stage": null
    }
  },
  "3-development": {
    "human_friendly_name": "ropsten-development",
    "addresses": {},
    "dependencies": {
      "ZERO_EX_EXCHANGE": "0xbff9493f92a3df4b0429b6d00743b3cfb4c85831",
      "ZERO_EX_ERC20_PROXY": "0xb1408f4c245a23c31b98d2c626777d4c0d766caa",
      "ZERO_EX_ERC721_PROXY": "0xe654aac058bfbf9f83fcaee7793311dd82f6ddb4",
      "WETH": "0xc778417e063141139fce010982780140aa0cd5ab"
    },
    "state": {
      "network_id": 3
    }
  },
  "3-staging": {
    "human_friendly_name": "ropsten-staging",
    "addresses": {
      "Cards": "0xADC559D1afbCBBf427728577F40E7358D96F1209",
      "OpenMinter": "0x36F26280B80e609e347c843E2AE5351Ee4b5f7eD",
      "Forwarder": "0xc79C9c624ea8A3dEdfae0dbf9295Bfb159eE5F3b",
      "Fusing": "0xFfFB48F70Dd10a468957cDD099047e046AdE8670"
    },
    "dependencies": {
      "WETH": "0xc778417e063141139fce010982780140aa0cd5ab",
      "ZERO_EX_EXCHANGE": "0xbff9493f92a3df4b0429b6d00743b3cfb4c85831",
      "ZERO_EX_ERC20_PROXY": "0xb1408f4c245a23c31b98d2c626777d4c0d766caa",
      "ZERO_EX_ERC721_PROXY": "0xe654aac058bfbf9f83fcaee7793311dd82f6ddb4"
    }
  },
  "50-development": {
    "human_friendly_name": "test-rpc-development",
    "addresses": {
      "Cards": "0x4F355ab7426120caf9Df0e23Aa9b7174afF82ff3",
      "OpenMinter": "0xf26861e5Ad499e04744Cca24fE0e280aBDF2DeBC",
      "Fusing": "0xffCe3807aC47060e900cE3FB9CDAd3597c25425d",
      "Forwarder": "0xc0ca612F2f1056f7fF1182d3aa8ca829e0F3446f"
    },
    "dependencies": {
      "ZERO_EX_EXCHANGE": "0x48bacb9266a570d521063ef5dd96e61686dbe788",
      "ZERO_EX_ERC20_PROXY": "0x1dc4c1cefef38a777b15aa20260a54e584b16c48",
      "ZERO_EX_ERC721_PROXY": "0x1d7022f5b17d2f8b695918fb48fa1089c9f85401",
      "WETH": "0x0b1ba0af832d7c05fd64161e0db78e85978e8082"
    },
    "state": {
      "network_id": 50,
      "last_deployment_stage": null
    }
  },
  "50-staging": {
    "human_friendly_name": "test-rpc-staging",
    "addresses": {
      "Cards": "0xDDb2B738682AD218eD87CF6f3a466798644e5d8D",
      "OpenMinter": "0x965D352283a3C8A016b9BBbC9bf6306665d495E7",
      "Fusing": "0x9a1df498af690a7EB43E10A28AB51345a3A33F75",
      "WalletImplementation": "0x39c3Fc9F4D8430af2713306CE80C584752d9e1C7",
      "Registry": "0xb8C463A237631ba541Db8151c1eC176bC15231a9",
      "Forwarder": "0x58787E5441be9548440086495EA8583394e3427f",
      "PurchaseModule": "0x0606A51d56578C6f3836F3e43Ed825bAA24B1ee9",
      "LimitedModules": "0x54a582397Ace3F9a6F5A28cE6Dc50473E4A9d375",
      "SimpleDelegate": "0xc650825Ca03EeB83d0d075c2737022cBb01F5799",
      "MultiLimiter": "0xDDAA6b9d12D7345872bB7F449eD3A671d5286fF5",
      "WalletFactory": "0x5a6Cf784fcaBBdD9250Ca912E3E0c3dA4fd3EcD1",
      "TestWallet": "0x5940a4982392C605462B76FAf5107ac68e6CE056"
    },
    "dependencies": {
      "ZERO_EX_EXCHANGE": "0x48bacb9266a570d521063ef5dd96e61686dbe788",
      "ZERO_EX_ERC20_PROXY": "0x1dc4c1cefef38a777b15aa20260a54e584b16c48",
      "ZERO_EX_ERC721_PROXY": "0x1d7022f5b17d2f8b695918fb48fa1089c9f85401",
      "WETH": "0x0b1ba0af832d7c05fd64161e0db78e85978e8082"
    },
    "state": {
      "network_id": 50
    }
  }
}