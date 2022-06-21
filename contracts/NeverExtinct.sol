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

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NeverExtinct is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    uint256 public tokenId = 0;
    uint256 public limitPrivateSale = 1;
    uint256 public limitPublicSale = 1;
    uint256 public supply = 5000;
    uint256 public privateSupply = 5500;
    //? Visibility of these variables? Solved
    bool public isPrivateSale = true;  //true == privateSale ; false == publicSale
    // bool public isPublicSale = true; // Can we ahve both at the same time? if not, we can have 1 or the other. Solved
    bool public isPaused = false;
    bool public isWhitelisted = false;

    mapping(address => bool) public whitelistedAddresses;
    mapping(address => uint256) public mintedPerWallet;

    event WhitelistSingle(address user);
    event WhitelistMany(address[] users);
    event PrivateMint(address users); 
    event PublicMint(address users); //We don't need an array for publicMint because it's just a single user/mint -Tavi
    event WhitelistRemove(address user);

    constructor() ERC721("Never Extinct League", "NXT") {
        mintedPerWallet[msg.sender] = 0;
        whitelistedAddresses[msg.sender] = true;
    }

    function privateMint() public {
        require(!isPaused, "Contract it's paused");
        require(isPrivateSale, "Private sale ended");
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
        if(tokenId >= supply){
            isPaused = true;
        }
        emit PrivateMint(msg.sender);
    }

    function publicMint() public {
        require(!isPaused, "Contract it's paused");
        require(tokenId < supply, "Supply exceeded");
        require(!isPrivateSale, "Public Sale still waiting");
        require(
            mintedPerWallet[msg.sender] < limitPublicSale,
            "Limit exceeded"
        );
        mintedPerWallet[msg.sender]++;
        _tokenId.increment();
        tokenId = _tokenId.current();
        tokenId;
        _safeMint(msg.sender, tokenId);
        if(tokenId >= supply){
            isPaused = true;
        }
        emit PublicMint(msg.sender);
    }

    function teamSupply(uint256 _amount) public onlyOwner {
        // require(tokenId >= supply, "Minting not ended"); //
        // require(tokenId <= privateSupply, "Supply ended");
        // require(_amount <= privateSupply - tokenId, "Supply exceeded");
        require(isPaused, "Contract it's not paused");
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

    function removeUser(address _userRemoved) public onlyOwner {
        whitelistedAddresses[_userRemoved] = false;
        emit WhitelistRemove(_userRemoved);
    } // function to remove user from whitelist

    function setIsPaused(bool _state) public onlyOwner {
        isPaused = _state;
    }

    function getIsPaused() public view returns (bool) {
        return isPaused;
    }

    function changeSale(bool _state) public onlyOwner {
        isPrivateSale = _state; //function changed to set true or false for private/publi sale
    }

    function changeLimitPrivat(uint256 _limit) public onlyOwner{
        limitPrivateSale = _limit;
    } //function for changing limit/wallet

    function changeLimitPublic(uint256 _limits) public onlyOwner{
        limitPublicSale = _limits;
    } //function for changing limit/wallet

    function getTokenId() public view returns(uint256) {
        return tokenId;
    }

    function mintCount(address user) public view returns (uint256) {
        return mintedPerWallet[user];
    }

    function getLimitPrivate() public view returns (uint256) {
        return limitPrivateSale;
    }
    
    function getLimitPublic() public view returns (uint256) {
        return limitPublicSale;
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
                    "https://nftstorage.link/ipfs/bafybeicg633nzknd5ghdscoffahtyjwe4knjhugrudzggqn3een7eplcu4/",
                    Strings.toString(_tokenIds),
                    ".json"
                )
            );
    }
}
