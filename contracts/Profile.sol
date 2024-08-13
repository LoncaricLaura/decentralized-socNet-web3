// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Profile {
    struct User {
        string name;
        string description;
        string profileImageCid;
        // bytes32 encryptedData;
        uint256 lastUpdated;
    }

    mapping (address => User) private users;
    mapping (address => bool) private owners;

    event UserRegistered(address userAddress, string name, string description, string profileImageCid);
    event UserUpdated(address userAddress, string name, string description, string profileImageCid);
    event UserDeleted(address userAddress);
    
    constructor() {
        owners[msg.sender] = true;
    }
    
    modifier onlyOwner() {
        require(owners[msg.sender] == true, "Only owner can call this function");
        _;
    }
    
    function registerUser(string memory _name, string memory _description, string memory _profileImageCid) public {
        // require(users[msg.sender].encryptedData == 0, "User already registered");
        users[msg.sender] = User({
            name: _name,
            description: _description,
            profileImageCid: _profileImageCid,
            // encryptedData: _encryptedData,
            lastUpdated: block.timestamp
        });
        emit UserRegistered(msg.sender, _name, _description, _profileImageCid);
    }
    
    function updateUser(string memory _name, string memory _description, string memory _profileImageCid) public {
        // require(users[msg.sender].encryptedData != 0, "User not registered");
        users[msg.sender].name = _name;
        users[msg.sender].description = _description;
        users[msg.sender].profileImageCid = _profileImageCid;
        // users[msg.sender].encryptedData = _encryptedData;
        users[msg.sender].lastUpdated = block.timestamp;
        emit UserUpdated(msg.sender, _name, _description, _profileImageCid);
    }
    
    function getUser(address userAddress) public view returns (string memory name, string memory description, string memory profileImageCid) {
        // require(users[userAddress].encryptedData != 0, "User not found");
        return (users[userAddress].name, users[userAddress].description, users[userAddress].profileImageCid);
    }
    
    function promoteOwner(address ownerAddress) public onlyOwner {
        owners[ownerAddress] = true;
    }
    
    function demoteOwner(address ownerAddress) public onlyOwner {
        require(msg.sender != ownerAddress, "Cannot demote self");
        owners[ownerAddress] = false;
    }

    function deleteUser() public {
        // require(users[msg.sender].encryptedData != 0, "User not registered");
        delete users[msg.sender];
        emit UserDeleted(msg.sender);
    }
}
