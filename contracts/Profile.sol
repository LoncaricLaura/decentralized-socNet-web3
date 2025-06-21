// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Profile {
    struct User {
        string name;
        string description;
        string profileImageCid;
        uint256 lastUpdated;
    }

    mapping (address => User) private users;

    mapping(address => bool) public hasPosted;
    mapping(address => bool) public hasClaimedFirstPostReward;

    mapping(bytes32 => bool) public postRewarded;

    mapping(bytes32 => address) public postAuthor;

    IERC20 public sparkToken;
    uint256 public firstPostReward = 10 * 1e18;
    uint256 public likeMilestoneReward = 5 * 1e18;

    event UserRegistered(address userAddress, string name, string description, string profileImageCid);
    event UserUpdated(address userAddress, string name, string description, string profileImageCid);
    event FirstPostMarked(address indexed user);
    event FirstPostRewardClaimed(address indexed user);
    event PostLiked(bytes32 indexed postId, address indexed liker, uint256 totalLikes);
    event PostRewarded(bytes32 indexed postId, address indexed author);
    event Tipped(address indexed from, address indexed to, uint256 amount);

    constructor(address _sparkTokenAddress) {
        sparkToken = IERC20(_sparkTokenAddress);
    }
    
    function registerUser(string memory _name, string memory _description, string memory _profileImageCid) public {
        users[msg.sender] = User({
            name: _name,
            description: _description,
            profileImageCid: _profileImageCid,
            lastUpdated: block.timestamp
        });
        emit UserRegistered(msg.sender, _name, _description, _profileImageCid);
    }

    function isUserRegistered(address userAddress) public view returns (bool) {
        return bytes(users[userAddress].name).length > 0;
    }
    
    function updateUser(string memory _name, string memory _description, string memory _profileImageCid) public {
        users[msg.sender].name = _name;
        users[msg.sender].description = _description;
        users[msg.sender].profileImageCid = _profileImageCid;
        users[msg.sender].lastUpdated = block.timestamp;
        emit UserUpdated(msg.sender, _name, _description, _profileImageCid);
    }
    
    function getUser(address userAddress) public view returns (string memory name, string memory description, string memory profileImageCid) {
        return (users[userAddress].name, users[userAddress].description, users[userAddress].profileImageCid);
    }

    function markFirstPost() public {
        require(!hasPosted[msg.sender], "Already marked as posted");
        hasPosted[msg.sender] = true;
        emit FirstPostMarked(msg.sender);
    }

    function claimFirstPostReward() public {
        require(hasPosted[msg.sender], "User has not made a post");
        require(!hasClaimedFirstPostReward[msg.sender], "Reward already claimed");
        require(sparkToken.balanceOf(address(this)) >= firstPostReward, "Insufficient reward balance");

        hasClaimedFirstPostReward[msg.sender] = true;
        require(sparkToken.transfer(msg.sender, firstPostReward), "Transfer failed");
        emit FirstPostRewardClaimed(msg.sender);
    }

    function claimLikeReward(bytes32 postId) public {
        require(!postRewarded[postId], "Already rewarded");
        require(sparkToken.balanceOf(address(this)) >= likeMilestoneReward, "Insufficient reward balance");

        postRewarded[postId] = true;
        require(sparkToken.transfer(msg.sender, likeMilestoneReward), "Transfer failed");
        emit PostRewarded(postId, msg.sender);
    }

    function tip(address to, uint256 amount) public {
        require(sparkToken.transferFrom(msg.sender, to, amount), "Tip transfer failed");
        emit Tipped(msg.sender, to, amount);
    }
}
