"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hardhat_1 = require("hardhat");
const chalk_1 = __importDefault(require("chalk"));
const gasLimit = 5000000; // 5 million
const gasPrice = 5000000000; // 5 gwei
const constants = {
    name: "Never Extinct League",
    symbol: "NXT",
    supply: hardhat_1.ethers.utils.parseUnits("5000", "ether"),
    privateSupply: hardhat_1.ethers.utils.parseUnits("500", "ether"),
    minterAddress: process.env.MINTER_ADDRESS,
};
const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
    console.log("-------------------------------------------\n", `Deploying: ${chalk_1.default.green(contractName)}\n`, `As ${chalk_1.default.green(constants.name)}\n`, `To ${chalk_1.default.green(process.env.HARDHAT_NETWORK)}\n`, "-------------------------------------------\n");
    const contractArgs = _args || [];
    const contractArtifacts = await hardhat_1.ethers.getContractFactory(contractName, {
        libraries: libraries,
    });
    const contract = await contractArtifacts.deploy(...contractArgs, overrides);
    const contractAddress = contract.address;
    console.log("Deploying", chalk_1.default.cyan(contractName), "contract to", chalk_1.default.magenta(contractAddress));
    await contract.deployed();
    const deployed = {
        name: contractName,
        address: contractAddress,
        args: contractArgs,
        contract,
    };
    return deployed;
};
async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    var _a;
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');
    // this array stores the data for contract verification
    const contracts = [];
    // We get the contract to deploy
    const args = [];
    const overrides = {
        gasLimit,
        gasPrice,
    };
    const NeverExtinct = await deploy("NeverExtinct", args, overrides);
    // eslint-disable-next-line
    const [_, addr1] = await hardhat_1.ethers.getSigners();
    contracts.push(NeverExtinct);
    if (process.env.HARDHAT_NETWORK === "hardhat") {
        const addressToTest = (_a = constants.minterAddress) !== null && _a !== void 0 ? _a : addr1.address;
        // deployer adds user as minter
        await NeverExtinct.contract.addUser(addressToTest);
        // check if user is minter
        const isUserMinter = await NeverExtinct.contract.itsWhitelisted(addressToTest);
        if (isUserMinter === true) {
            console.log(chalk_1.default.bgGreen(`SUCCESS!\n${addressToTest} has been set as a minter`));
        }
        else {
            console.log(chalk_1.default.bgRed("Oh no, something went wrong"));
        }
    }
    const contractDetails = {
        "Contract Address:": NeverExtinct.contract.address,
        Name: constants.name,
        Symbol: constants.symbol,
    };
    // eslint-disable-next-line
    console.table(contractDetails);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
