
const hre = require("hardhat");

async function main() {

  const NeverExtinct = await hre.ethers.getContractFactory("NeverExtinct");
  const neverextinct = await NeverExtinct.deploy();
  await neverextinct.deployed();
  const mint = await neverextinct.publicMint();
  console.log("NeverExtinct Contract:", neverextinct.address);
  console.log("Minted to:", mint.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
