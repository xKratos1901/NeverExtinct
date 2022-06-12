
const hre = require("hardhat");

async function main() {

  const NeverExtinct = await hre.ethers.getContractFactory("NeverExtinct");
  const neverextinct = await NeverExtinct.deploy("Hi There!");

  await neverextinct.deployed();

  console.log("NeverExtinct Contract:", neverextinct.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
