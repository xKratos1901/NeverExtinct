// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import chalk from "chalk";

const gasLimit = 5000000; // 5 million
const gasPrice = 100000000000; // 5 gwei

const constants = {
  name: "Never Extinct League",
  symbol: "NXT",
  supply: ethers.utils.parseUnits("5000", "ether"),
  privateSupply: ethers.utils.parseUnits("500", "ether"),
  minterAddress: process.env.MINTER_ADDRESS,
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
  // We get the contract to deploy
  const args: any[] = [];
  const overrides = {
    gasLimit,
    gasPrice,
    nonce:0,
  };
  const NeverExtinct = await deploy("NeverExtinct", args, overrides);
  // eslint-disable-next-line
  const [_, addr1] = await ethers.getSigners();
  contracts.push(NeverExtinct);

  if (process.env.HARDHAT_NETWORK === "hardhat") {
    const addressToTest = constants.minterAddress ?? addr1.address;

    // deployer adds user as minter
    await NeverExtinct.contract.addUser(addressToTest);
    // check if user is minter
    const isUserMinter = await NeverExtinct.contract.itsWhitelisted(
      addressToTest
    );

    if (isUserMinter === true) {
      console.log(
        chalk.bgGreen(`SUCCESS!\n${addressToTest} has been set as a minter`)
      );
    } else {
      console.log(chalk.bgRed("Oh no, something went wrong"));
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
