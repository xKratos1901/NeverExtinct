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
    uint256 public privateSupply = 500;
    //? Visibility of these variables?
    bool isPrivateSale = false;
    bool isPublicSale = true; // Can we ahve both at the same time? if not, we can have 1 or the other.
    bool isPaused = false;
    bool isWhitelisted = false;

    mapping(address => bool) public whitelistedAddresses;
    mapping(address => uint256) public mintedPerWallet;

    event WhitelistSingle(address user);
    event WhitelistMany(address[] users);
    event PublicMint(address[] users);

    constructor() ERC721("Never Extinct League", "NXT") {
        mintedPerWallet[msg.sender] = 0;
        whitelistedAddresses[msg.sender] = true;
    }

    function privateMint() public {
        require(!isPaused, "Contract it's paused");
        require(isPrivateSale, "Private Sale Ended");
        isWhitelisted = whitelistedAddresses[msg.sender];
        require(isWhitelisted, "Not Whitelisted");
        require(
            mintedPerWallet[msg.sender] < limitPrivateSale,
            "Limit exceeded"
        );
        mintedPerWallet[msg.sender]++;
        _tokenId.increment();
        tokenId = _tokenId.current();
        tokenId;
        _safeMint(msg.sender, tokenId);
    }

    function publicMint() public {
        require(!isPaused, "Contract it's paused");
        require(tokenId < supply, "Supply exceeded");
        require(isPublicSale, "Public Sale still waiting");
        require(
            mintedPerWallet[msg.sender] < limitPublicSale,
            "Limit exceeded"
        );
        mintedPerWallet[msg.sender]++;
        _tokenId.increment();
        tokenId = _tokenId.current();
        tokenId;
        _safeMint(msg.sender, tokenId);
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
        emit WhitelistMany(_users);
    }

    function addUser(address _userWhitelist) public onlyOwner {
        whitelistedAddresses[_userWhitelist] = true;
        emit WhitelistSingle(_userWhitelist);
    }

    function setIsPaused(bool _state) public onlyOwner {
        isPaused = _state;
    }

    function getIsPaused() public view returns (bool) {
        return isPaused;
    }

    function publicSale() public onlyOwner {
        isPrivateSale = false;
        isPublicSale = true;
    }

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
