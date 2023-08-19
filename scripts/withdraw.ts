import { deployments, ethers } from "hardhat"

async function main() {
    await deployments.fixture()
    const fundMeAddress = (await deployments.get("FundMe")).address
    const fundMe = await ethers.getContractAt("FundMe", fundMeAddress)
    console.log("Withdrawing funds...")
    await fundMe.withdraw()
    console.log("Withdrawn")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
