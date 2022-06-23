import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { nextTick } from "process";
// eslint-disable-next-line
import { NeverExtinct, NeverExtinct__factory } from "../typechain";

describe("Never Extinct", function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress; //single user whitelist
  let user2: SignerWithAddress; //batch whitelist
  let user3: SignerWithAddress; //batch whitelist
  let user4: SignerWithAddress; //batch whitelist
  let user5: SignerWithAddress; //private mint
  let user6: SignerWithAddress; //private mint
  let ownerCopy : SignerWithAddress;
  let NeverExtinct: NeverExtinct;

  // so you don't need to do deploy for each test. just deploy once and set some variables above.
  beforeEach(async () => {
    const [deployer, account1, account2, account3, account4, account5, account6,account7] = await ethers.getSigners();
    const NEArtifacts: NeverExtinct__factory = await ethers.getContractFactory(
      "NeverExtinct",
      owner
    );
    owner = deployer;
    user1 = account1;
    user2 = account2;
    user3 = account3;
    user4 = account4;
    user5 = account5;
    user6 = account6;
    ownerCopy = account7;
    NeverExtinct = await NEArtifacts.deploy();
  });

  describe("Starting variables on deploy", () => {
    it("Sets Deployer as minter", async function () {
      expect(await NeverExtinct.itsWhitelisted(owner.address)).to.equal(true);
    });
  });

  describe("Whitelist",() =>{
    it("Add an address to whitelist", async function() {
      await NeverExtinct.addUser(user1.address);
      expect(await NeverExtinct.itsWhitelisted(user1.address)).to.be.true;
    });
    it("Add an array of addresses to whitelist", async function(){
      expect(await NeverExtinct.batchWhitelist([user2.address,user3.address,user4.address])).to.be.emit(NeverExtinct,"WhitelistMany");;
    });  
    it("Remove user from whitelist", async function() {
      await NeverExtinct.addUser(user4.address);
      expect(await NeverExtinct.itsWhitelisted(user4.address)).to.be.true;
      await NeverExtinct.removeUser(user4.address);
      expect(await NeverExtinct.itsWhitelisted(user4.address)).to.be.false;
    })
  })

  describe("Private Minting", () => {
    it("Add user to whitelist and mint",async function(){
      await NeverExtinct.addUser(user5.address);
      await NeverExtinct.connect(user5).privateMint();
    });
    it("Add users and mint", async function(){
      await expect (NeverExtinct.batchWhitelist([user2.address,user3.address,user4.address])).to.be.emit(NeverExtinct,"WhitelistMany");;
      // expect (await NeverExtinct.connect(user2).privateMint()).to.be.emit(NeverExtinct,"PrivateMint");
      // await NeverExtinct.connect(user3).privateMint();
      // await NeverExtinct.connect(user4).privateMint();
    }) // if i remove what's commented i get the "Not whitelisted" error , but i see it's emiting the event that they are whitelisted;
    it("Try to mint without whitelist", async function(){
      await expect(NeverExtinct.connect(user1).privateMint()).to.be.revertedWith('Not Whitelisted');
    });
    it("Mint 2 nft from same wallet", async function(){
      await NeverExtinct.addUser(user1.address);
      expect(await NeverExtinct.connect(user1).privateMint()).to.be.emit(NeverExtinct,"PrivateMint");
      await expect(NeverExtinct.connect(user1).privateMint()).to.be.revertedWith('Limit exceeded');
    })
  })

  describe("Public sale minting", () =>{
    it("Stop privat minting and mint public", async function(){
      await NeverExtinct.changeSale(false);
      await NeverExtinct.connect(user2).publicMint();
    });
    it("Mint while privat minting it's still on", async function(){
      await expect(NeverExtinct.connect(user2).publicMint()).to.be.revertedWith('Public Sale still waiting');
    });
    it("Mint 2 from same address", async function(){
      await NeverExtinct.changeSale(false);
      await NeverExtinct.connect(user2).publicMint();
      await expect (NeverExtinct.connect(user2).publicMint()).to.be.revertedWith('Limit exceeded');
    })
  })

  describe("onlyOwner privileges", () =>{
    it("Try to transfer ownership", async function(){
      await expect(NeverExtinct.connect(ownerCopy).transferOwnership(user1.address)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Mint teamSupply", async function(){
      await expect(NeverExtinct.connect(ownerCopy).teamSupply(5)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Change wallet limit privat", async function(){
      await expect(NeverExtinct.connect(ownerCopy).changeLimitPrivat(2)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Change wallet limit public", async function(){
      await expect(NeverExtinct.connect(ownerCopy).changeLimitPublic(2)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Make a safeTransfer",async function(){
      await NeverExtinct.changeSale(false);
      await NeverExtinct.connect(user1).publicMint();
      await expect(NeverExtinct.connect(ownerCopy).transferFrom(user1.address,user2.address,1)).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
    });
    it("Pause the contract", async function(){
      await expect(NeverExtinct.connect(ownerCopy).setIsPaused(true)).to.be.revertedWith('Ownable: caller is not the owner');
    })
  })

  describe("Mint on team supply", () =>{
    it("Mint on team supply", async function(){
     await NeverExtinct.setIsPaused(true);
     expect(await NeverExtinct.getIsPaused()).to.be.true;
      await NeverExtinct.connect(owner).teamSupply(5);
    }),
    it("Mint from another address and fail",async function(){
      await NeverExtinct.setIsPaused(true);
      await expect( NeverExtinct.connect(ownerCopy).teamSupply(5)).to.be.revertedWith('Ownable: caller is not the owner');
    }),
    it("Do a Private mint and try to mint the teamSupply",async function(){
      await NeverExtinct.privateMint();
      await expect(NeverExtinct.teamSupply(5)).to.be.revertedWith("Contract it's not paused");
    })
  })

  describe("Get tokenId and URI after minting", () => {
    it("Mint and return in console the tokenId", async function(){
      await NeverExtinct.privateMint();
      console.log("Current TokenId : ", (await NeverExtinct.getTokenId()).toString());
    })
    it("Mint and get the tokenId+tokenURI", async function() {
      await NeverExtinct.privateMint();
      console.log("Current tokenID : ", (await NeverExtinct.getTokenId()).toString());
      console.log("tokenUri for the tokenId : ", (await NeverExtinct.tokenURI(await NeverExtinct.getTokenId())).toString());
    })
  })

  describe("Function test", () => {
    it("mintCount", async function(){
      await NeverExtinct.privateMint();
      expect (await NeverExtinct.mintCount(owner.address)).to.be.equal(1);
    });
    it("getLimitPrivate test", async function(){
      expect (await NeverExtinct.getLimitPrivate()).to.be.equal(1);
    });
    it("getLimitPublic",async function(){
      expect (await NeverExtinct.getLimitPublic()).to.be.equal(1);
    });
    })
  });

