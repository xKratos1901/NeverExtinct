// SPDX-License-Identifier: MIT

//##::: ##:'########:'##::::'##:'########:'########:::::'########:'##::::'##:'########:'####:'##::: ##::'######::'########:
//###:: ##: ##.....:: ##:::: ##: ##.....:: ##.... ##:::: ##.....::. ##::'##::... ##..::. ##:: ###:: ##:'##... ##:... ##..::
//####: ##: ##::::::: ##:::: ##: ##::::::: ##:::: ##:::: ##::::::::. ##'##:::::: ##::::: ##:: ####: ##: ##:::..::::: ##::::
//## ## ##: ######::: ##:::: ##: ######::: ########::::: ######:::::. ###::::::: ##::::: ##:: ## ## ##: ##:::::::::: ##::::
//##. ####: ##...::::. ##:: ##:: ##...:::: ##.. ##:::::: ##...:::::: ## ##:::::: ##::::: ##:: ##. ####: ##:::::::::: ##::::
//##:. ###: ##::::::::. ## ##::: ##::::::: ##::. ##::::: ##:::::::: ##:. ##::::: ##::::: ##:: ##:. ###: ##::: ##:::: ##::::
//##::. ##: ########:::. ###:::: ########: ##:::. ##:::: ########: ##:::. ##:::: ##::::'####: ##::. ##:. ######::::: ##::::
//..::::..::........:::::...:::::........::..:::::..:::::........::..:::::..:::::..:::::....::..::::..:::......::::::..:::::

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NeverExtinct is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    uint256 public tokenId = 0;
    uint256 public limitPrivateSale = 1;
    uint256 public limitPublicSale = 1;
    uint256 public supply = 5000;
    uint256 public privateSupply= 5500;
    bool privateSale = true;
    bool publicSale = false;
    bool pause = false;
    bool itswhitelisted = false;

    mapping(address => bool) public whitelistedAddresses;
    mapping(address => uint256) public mintedPerWallet;

    event whitelisted(address[] User);
    event mint(
        address User,
        uint256 tokenId,
        uint256 time
        ); //new event; emited on every mint

    constructor() ERC721("Never Extinct League", "NXT") {
        mintedPerWallet[msg.sender] = 0;
    }
   
     function privateMint() public {
        require(!pause, "Contract it's paused");
        require(privateSale, "Private Sale Ended");
        itswhitelisted = whitelistedAddresses[msg.sender];
        require(itswhitelisted, "Not Whitelisted");
        require(
            mintedPerWallet[msg.sender] < limitPrivateSale,
            "Limit exceeded"
        );
        mintedPerWallet[msg.sender]++;
        _tokenId.increment();
        tokenId = _tokenId.current();
        tokenId;
        _safeMint(msg.sender, tokenId);
        emit mint(msg.sender,tokenId,block.timestamp);
    }

     function publicMint() public {
        require(!pause, "Contract it's paused");
        require(tokenId < supply, "Supply exceeded");
        require(publicSale, "Public Sale still waiting");
        require(
            mintedPerWallet[msg.sender] < limitPublicSale,
            "Limit exceeded"
        );
        mintedPerWallet[msg.sender]++;
        _tokenId.increment();
        tokenId = _tokenId.current();
        tokenId;
        _safeMint(msg.sender, tokenId);
        emit mint(msg.sender,tokenId,block.timestamp);
    }

    function teamSupply(uint256 _amount) public onlyOwner {
        require(tokenId >= supply, "Minting not ended");
        require(tokenId <= privateSupply, "Supply ended");
        require(_amount <= privateSupply - tokenId, "Supply exceeded");
        for (uint256 i = 1; i <= _amount; i++) {
            _tokenId.increment();
            tokenId = _tokenId.current();
            tokenId;
            _safeMint(msg.sender, tokenId);
            emit mint(msg.sender,tokenId,block.timestamp);
        }
    }

    function itsWhitelisted(address _user) public view returns (bool) {
        bool userWhitelisted = whitelistedAddresses[_user];
        return userWhitelisted;
    }

    function batchWhitelist(address[] memory _users) external onlyOwner {
        uint256 size = _users.length;

        for (uint256 i = 1; i < size; i++) {
            address user = _users[i];
            whitelistedAddresses[user] = true;
        }
        emit whitelisted(_users);
    }

    function addUser(address _userWhitelist) public onlyOwner {
        whitelistedAddresses[_userWhitelist] = true;
    }

    function Pause(bool _state) public onlyOwner {
        pause = _state;
    }

    function PublicSale() public onlyOwner {
        privateSale = false;
        publicSale = true;
    }

    function itsPaused() public view returns (bool) {
        return pause;
    }

    function setLimitPrivat(uint256 _limit) public onlyOwner{
        limitPrivateSale = _limit;
    }  //new function

    function setLimitPublic(uint256 _limits) public onlyOwner{
        limitPublicSale = _limits;
    } //new function

    function getTokenId() public view returns(uint256) {
        return tokenId;
    }  //function to retrieve tokenId

    function tokenURI(uint256 _tokenIds)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(_tokenIds), "URI query for nonexistent token");
        return
            string(
                abi.encodePacked(
                    "https://bafybeibnzvcogpfxvcxqiz4gt2xakihcyyspvsz5vrieonca25i53zpv7y.ipfs.nftstorage.link/",
                    Strings.toString(_tokenIds),
                    ".json"
                )
            );
    }
}
