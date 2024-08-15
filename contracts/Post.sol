// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Post {
    struct PostData {
        address author;
        string postCid;
        uint256 timestamp;
    }

    mapping(uint256 => PostData) private posts;
    mapping(address => uint256[]) private userPosts;

    uint256 private nextPostId;

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string postCid,
        uint256 timestamp
    );

    constructor() {
        nextPostId = 1;
    }

    function createPost(string memory _postCid) public {
        uint256 postId = nextPostId++;
        posts[postId] = PostData({
            author: msg.sender,
            postCid: _postCid,
            timestamp: block.timestamp
        });

        userPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, _postCid, block.timestamp);
    }

    function getPost(uint256 _postId)
        public
        view
        returns (
            address author,
            string memory postCid,
            uint256 timestamp
        )
    {
        PostData storage post = posts[_postId];
        return (post.author, post.postCid, post.timestamp);
    }

    function getUserPosts(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return userPosts[_user];
    }
}
