const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("It should deploy the contract", async function () {
    const NeverExtinct = await ethers.getContractFactory("NeverExtinct");
    const neverextinct = await NeverExtinct.deploy("Hello World");
    await neverextinct.deployed();
  });
});
