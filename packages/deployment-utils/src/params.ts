export enum DeploymentNetwork {
    Mainnet = 1,
    Ropsten = 3,
    Kovan = 42,
    TestRPC = 50,
}

export enum DeploymentEnvironment {
    Production = 'production',
    Staging = 'staging',
    Development = 'development'
}

export interface DeploymentParams {
    private_key: string;
    rpc_url: string;
    network_id: DeploymentNetwork;
    environment: DeploymentEnvironment;
}