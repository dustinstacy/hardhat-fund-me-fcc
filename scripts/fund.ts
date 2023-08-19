import { deployments, ethers } from "hardhat"

async function main() {
    await deployments.fixture(["all"])
    const fundMeAddress = (await deployments.get("FundMe")).address
    const fundMe = await ethers.getContractAt("FundMe", fundMeAddress)
    console.log("Funding Contract...")
    const transcationResponse = await fundMe.fund({
        value: ethers.parseEther(".00001"),
    })
    console.log("Funded")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
