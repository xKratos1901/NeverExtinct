// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import chalk from "chalk";

const gasLimit = 5000000; // 5 million
const gasPrice = 5000000000; // 5 gwei

const constants = {
  name: "Onramper Test Token",
  symbol: "OTT",
  totalSupply: ethers.utils.parseUnits("100000000", "ether"), // 100 million with 18 decimals
};

const deploy = async (
  contractName: string,
  _args: any[] = [],
  overrides = {},
  libraries = {}
) => {
  console.log(
    "-------------------------------------------\n",
    `Deploying: ${chalk.green(contractName)}\n`,
    `As ${chalk.green(constants.name)}\n`,
    `To ${chalk.green(process.env.HARDHAT_NETWORK)}\n`,
    "-------------------------------------------\n"
  );

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, {
    libraries: libraries,
  });
  const contract = await contractArtifacts.deploy(...contractArgs, overrides);
  const contractAddress = contract.address;

  console.log(
    "Deploying",
    chalk.cyan(contractName),
    "contract to",
    chalk.magenta(contractAddress)
  );

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

  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // this array stores the data for contract verification
  const contracts = [];
  const [deployer] = await ethers.getSigners();
  // We get the contract to deploy
  const args = [constants.name, constants.symbol, constants.totalSupply];
  const overrides = {
    gasLimit,
    gasPrice,
  };
  const MockERC20 = await deploy("MockERC20", args, overrides);

  contracts.push(MockERC20);

  const bigNumberBalance = await MockERC20.contract.balanceOf(deployer.address);
  const deployerBalance = ethers.utils.formatEther(bigNumberBalance);

  const tokenDetails = {
    "Token Address:": MockERC20.contract.address,
    Name: constants.name,
    Symbol: constants.symbol,
    "Deployer Balance": deployerBalance,
  };

  // eslint-disable-next-line
  console.table(tokenDetails);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
