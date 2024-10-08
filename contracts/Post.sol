// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Post {
    struct PostData {
        address author;
        string postCid;
        uint256 timestamp;
        uint256 likes;
        bool hidden;
    }

    mapping(uint256 => PostData) private posts;
    mapping(address => uint256[]) private userPosts;
    mapping(uint256 => mapping(address => bool)) private postLikes;

    uint256 private nextPostId;

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string postCid,
        uint256 timestamp
    );

    event PostLiked(uint256 indexed postId, address indexed liker);

    event PostHidden(uint256 indexed postId, address indexed author);
    event PostShown(uint256 indexed postId, address indexed author);

    constructor() {
        nextPostId = 1;
    }

    function createPost(string memory _postCid) public {
        uint256 postId = nextPostId++;
        posts[postId] = PostData({
            author: msg.sender,
            postCid: _postCid,
            timestamp: block.timestamp,
            likes: 0,
            hidden: false
        });

        userPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, _postCid, block.timestamp);
    }

    function likePost(uint256 _postId) public {
        require(_postId < nextPostId, "Post doesn't exist!");
        require(!postLikes[_postId][msg.sender], "You already like this post!");

        postLikes[_postId][msg.sender] = true;
        posts[_postId].likes++;

        emit PostLiked(_postId, msg.sender);
    }

    function hidePost(uint256 _postId) public {
        require(_postId < nextPostId, "Post doesn't exist");
        require(posts[_postId].author == msg.sender, "Only author can hide this post!");

        posts[_postId].hidden = true;

        emit PostHidden(_postId, msg.sender);
    }

    function showPost(uint256 _postId) public {
        require(_postId < nextPostId, "Post doesn't exist");
        require(posts[_postId].author == msg.sender, "Only author can show this post!");

        posts[_postId].hidden = false;

        emit PostShown(_postId, msg.sender);
    }

    function getPost(uint256 _postId)
        public
        view
        returns (
            address author,
            string memory postCid,
            uint256 timestamp,
            uint256 likes,
            bool hidden
        )
    {
        require(_postId < nextPostId, "Post does not exist");

        PostData storage post = posts[_postId];
        return (post.author, post.postCid, post.timestamp, post.likes, post.hidden);
    }

    function getUserPosts(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return userPosts[_user];
    }

    function getAllPosts()
        public
        view
        returns (
            uint256[] memory postIds,
            address[] memory authors,
            string[] memory postCids,
            uint256[] memory timestamps,
            uint256[] memory likes,
            bool[] memory hidden
        )
    {
        uint256 totalPosts = nextPostId - 1;
        postIds = new uint256[](totalPosts);
        authors = new address[](totalPosts);
        postCids = new string[](totalPosts);
        timestamps = new uint256[](totalPosts);
        likes = new uint256[](totalPosts);
        hidden = new bool[](totalPosts);

        for (uint256 i = 1; i <= totalPosts; i++) {
            PostData storage post = posts[i];
            postIds[i - 1] = i;
            authors[i - 1] = post.author;
            postCids[i - 1] = post.postCid;
            timestamps[i - 1] = post.timestamp;
            likes[i - 1] = post.likes;
            hidden[i - 1] = post.hidden;
        }
    }

    function userLikes(uint256 _postId) public view returns (bool) {
        return postLikes[_postId][msg.sender];
    }
}
