import { deployments, ethers, network } from "hardhat"
import { FundMe } from "../../typechain-types"
import { devChains } from "../../helper-hardhat-config"
import { assert } from "chai"

devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMeAddress: string
          let fundMe: FundMe
          let sendValue = ethers.parseEther("1")

          beforeEach(async () => {
              await deployments.fixture(["all"])

              fundMeAddress = (await deployments.get("FundMe")).address
              fundMe = await ethers.getContractAt("FundMe", fundMeAddress)
          })

          it("Allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMeAddress
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
