import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line
import { NeverExtinct, NeverExtinct__factory } from "../typechain";

describe("Never Extinct", function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let NeverExtinct: NeverExtinct;

  // so you don't need to do deploy for each test. just deploy once and set some variables above.
  beforeEach(async () => {
    const [deployer, account1, account2] = await ethers.getSigners();
    const NEArtifacts: NeverExtinct__factory = await ethers.getContractFactory(
      "NeverExtinct",
      owner
    );
    owner = deployer;
    user1 = account1;
    user2 = account2;
    NeverExtinct = await NEArtifacts.deploy();
  });

  describe("Starting variables on deploy", () => {
    it("Sets Deployer as minter", async function () {
      expect(await NeverExtinct.itsWhitelisted(owner.address)).to.equal(true);
    });
  });

  // describe("View functions", () => {

  // }

  // describe("Write functions", () => {

  // }
});
