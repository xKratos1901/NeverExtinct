// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("Deployer", function () {
//   it("It should deploy the contract", async function () {
//     const NeverExtinct = await ethers.getContractFactory("NeverExtinct");
//     const neverextinct = await NeverExtinct.deploy();
//     await neverextinct.deployed();
//   });
//   it("It should test if he can mint without whitelist",async function(){
//     const NeverExtinct = await ethers.getContractFactory("NeverExtinct");
//     const neverextinct = await NeverExtinct.deploy();
//     await neverextinct.deployed();
//     const Mint = await neverextinct.privateMint();
//     await Mint();
//   })
//   it("Should Mint", async function() {
//     const [owner,account1,account2,account3] = await ethers.getSigners();
//     const NeverExtinct = await ethers.getContractFactory("NeverExtinct");
//     const neverextinct = await NeverExtinct.deploy();
//     await neverextinct.deployed();
//     const publicOn = await neverextinct.PublicSale();
//     const mint = await neverextinct.publicMint();
//     console.log("Minted to:", mint.address);
//     console.log(neverextinct.tokenId())
//   })
//   it("Should Stop the contract and stop the minting proccess", async function() {
//     const NeverExtinct = await ethers.getContractFactory("NeverExtinct");
//     const neverextinct = await NeverExtinct.deploy();
//     await neverextinct.deployed();
//     const pause = await neverextinct.Pause(true);
//     console.log("Pause State:", neverextinct.itsPaused());
//     const publicOn = await neverextinct.PublicSale();
//     const mint = await neverextinct.publicMint();
//   })
// });
