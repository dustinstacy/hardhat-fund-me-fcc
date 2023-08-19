import { DeploymentsExtension } from "hardhat-deploy/dist/types"
import { Network } from "hardhat/types"

export interface ExportInterface {
    getNamedAccounts: () => Promise<{
        [name: string]: string
    }>
    deployments: DeploymentsExtension
    network: Network
}
