import { devChains } from "../helper-hardhat-config"
import { ExportInterface } from "../global.interfaces"
import { DeployFunction } from "hardhat-deploy/dist/types"

export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000

const deployMocks: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    network,
}: ExportInterface) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (devChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `yarn hardhat console` to interact with the deployed smart contracts!"
        )
        log("-----------------------------")
    }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]
