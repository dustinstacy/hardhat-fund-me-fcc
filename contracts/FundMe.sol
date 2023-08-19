//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

/// @title A contract for crowdfunding
/// @author Dustin Stacy
/// @notice This contract is to demo a sample funding contract
/// @dev this implements price feeds as our library
contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private addressToAmountFunded;
    address[] private funders;
    address private immutable i_owner;
    AggregatorV3Interface private priceFeed;

    event FundedAmount(uint256 amount, uint256 convertedAmount);

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /// @notice This function funds this contract
    /// @dev this implements price feeds as our library
    function fund() public payable {
        uint256 minimumUSD = 20;
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUSD,
            "Didn't send enough"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
        // console.log(msg.value, msg.value.getConversionRate(priceFeed));
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex = funderIndex + 1
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory fundersArray = funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < fundersArray.length;
            funderIndex++
        ) {
            address funder = fundersArray[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
