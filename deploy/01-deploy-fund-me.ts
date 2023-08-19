import { DeployFunction } from "hardhat-deploy/dist/types"
import verify from "../utils/verify"
import { devChains, networkConfig } from "../helper-hardhat-config"
import { ExportInterface } from "../global.interfaces"

const deployFundMe: DeployFunction = async ({
    getNamedAccounts,
    deployments,
    network,
}: ExportInterface) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    let ethUsdPriceFeedAddress: string

    if (devChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations,
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    log("------------------------------------")
}

export default deployFundMe
deployFundMe.tags = ["all", "fund"]
