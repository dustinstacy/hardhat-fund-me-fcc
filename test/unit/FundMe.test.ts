import { deployments, ethers, network } from "hardhat"
import { FundMe } from "../../typechain-types"
import { assert, expect } from "chai"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionReceipt } from "ethers"
import { devChains } from "../../helper-hardhat-config"

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let deployer: SignerWithAddress
          let fundMeAddress: string
          let fundMe: FundMe
          let mockV3AggregatorAddress: string
          let sendValue: bigint = ethers.parseEther("20")

          beforeEach(async () => {
              await deployments.fixture(["all"])

              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              fundMeAddress = (await deployments.get("FundMe")).address
              fundMe = await ethers.getContractAt("FundMe", fundMeAddress)
              mockV3AggregatorAddress = (
                  await deployments.get("MockV3Aggregator")
              ).address
          })

          describe("constructor", async () => {
              it("Sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  // const falseResponse = "1"
                  assert.equal(response, mockV3AggregatorAddress)
              })
          })

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough"
                  )
                  // await expect(fundMe.fund()).to.not.be.reverted
                  // await expect(fundMe.fund()).to.be.revertedWith("Didn't send poop")
              })

              it("Updated the amount funded data structure", async () => {
                  // sendValue = BigInt(20 * 10 ** 17)
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  )
                  // sendValue = sendValue * BigInt(2)
                  assert.equal(response, sendValue)
              })

              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer.address)
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("Allows us to withdraw with a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMeAddress)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transcationResponse = await fundMe.withdraw()
                  const transcationReceipt = await transcationResponse.wait(1)
                  const { gasUsed, gasPrice } =
                      transcationReceipt as ContractTransactionReceipt
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMeAddress
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance, BigInt(0))
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })

              it("Allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMeAddress)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transcationResponse = await fundMe.withdraw()
                  const transcationReceipt = await transcationResponse.wait(1)
                  const { gasUsed, gasPrice } =
                      transcationReceipt as ContractTransactionReceipt
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMeAddress
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, BigInt(0))
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )

                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          BigInt(0)
                      )
                  }
              })

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = fundMe.connect(attacker)
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })

          describe("cheaperWithdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("Allows us to withdraw with a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMeAddress)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Act
                  const transcationResponse = await fundMe.withdraw()
                  const transcationReceipt = await transcationResponse.wait(1)
                  const { gasUsed, gasPrice } =
                      transcationReceipt as ContractTransactionReceipt
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMeAddress
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBalance, BigInt(0))
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })

              it("Allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMeAddress)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transcationResponse = await fundMe.cheaperWithdraw()
                  const transcationReceipt = await transcationResponse.wait(1)
                  const { gasUsed, gasPrice } =
                      transcationReceipt as ContractTransactionReceipt
                  const gasCost = gasUsed * gasPrice
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMeAddress
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, BigInt(0))
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )

                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          BigInt(0)
                      )
                  }
              })

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = fundMe.connect(attacker)
                  await expect(
                      attackerConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
