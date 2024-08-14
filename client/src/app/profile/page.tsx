'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import Post from "../components/Post";
import EditProfile from "../components/EditProfile";
import AddPost from "../components/AddPost";
import { getIPFSUrl } from '../ipfs';
import { PROFILE_ABI, PROFILE_ADDRESS } from '../../../../context/Constants';
import { ethers } from 'ethers';

declare var window: any

export default function Profile() {
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalPost, setShowModalPost] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    description: "",
    profileImageCid: "",
  });

  useEffect(() => {
    
    const fetchProfileData = async () => {
      try {
        const ethereum = window.ethereum;
        if (ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, signer);
          
          const userAddress = await signer.getAddress();
          const userData = await profileContract.getUser(userAddress);

          if (userData) {
            setProfileData({
              name: userData.name,
              description: userData.description,
              profileImageCid: userData.profileImageCid,
            });
          } else {
            console.log("User not registered or no data found.");
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const profileImageUrl = getIPFSUrl(profileData.profileImageCid);

  const toggleModalEdit = () => {
    setShowModalEdit(!showModalEdit);
  };

  const toggleModalPost = () => {
    setShowModalPost(!showModalPost);
  };

//  {fake data}
  const posts = [
    {
      avatarUrl: "/images/icon-profile.png",
      username: "John Doe",
      handle: "johndoe",
      timestamp: "2h ago",
      content: "This is an example of a Twitter-like post.",
      mediaUrl: "/images/icon-chat.png",
      likes: 123,
      retweets: 45,
      replies: 67,
    },
    {
      avatarUrl: "/images/icon-profile.png",
      username: "John Doe",
      handle: "johndoe",
      timestamp: "3h ago",
      content: "Another example post.",
      mediaUrl: "/images/icon-chat.png",
      likes: 234,
      retweets: 56,
      replies: 78,
    },
  ];

  return (
    <main className="min-h-screen w-full">
      <div className="relative px-4 sm:px-16 2xl:px-24 py-16 w-full">
        <div className="relative bg-none md:bg-black/60 h-[250px] w-full rounded-lg shadow-md">
            <div className="absolute bottom-0 md:bottom-[-50px] left-0 md:left-16 flex flex-row items-center gap-8">
                {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt={`User's avatar`}
                      width={200}
                      height={200}
                      className="rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                  <div className="rounded-full border-4 border-white shadow-lg w-50 h-50 bg-gray-300 flex items-center justify-center">
                    <span>Loading...</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold text-white">{profileData.name}</h1>
                    <p className="text-md text-gray-300">@{profileData.name.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
            </div>
        </div>
        <div className="pt-5 flex justify-end items-center gap-x-6">
          <button
              className="w-fit flex gap-1"
              onClick={toggleModalEdit}
            >
              <Image
                src="/icons/icon-edit.png"
                alt="Icon Edit"
                width={15}
                height={15}
                priority
              />
              <p className="text-sm">Edit profile</p>
            </button>
          <button
              className="w-fit flex items-center gap-1"
              onClick={toggleModalPost}
            >
              <Image
                src="/icons/icon-add.svg"
                alt="Icon Add"
                width={12}
                height={12}
                priority
              />
              <p className="text-sm">Add post</p>
            </button>
        </div>
        <div className="pt-16 flex flex-col md:flex-row justify-center gap-10 w-full">
                <div className="relative md:sticky top-0 md:top-32 flex flex-col items-start justify-center h-full text-center pb-12  md:pb-16 w-full md:w-[20%] border-b md:border-b-0 md:border-r border-[#d1e3fa] mt-0 md:mt-0">
                    <p className="mt-2 mr-4 lg:mr-0 text-sm text-gray-400 text-start text-wrap">{profileData.description}</p>
                </div>
            <div className="flex flex-col w-full md:w-[65%] py-b md:pb-16">
                {posts.map((post, index) => (
                    <Post
                        key={index}
                        avatarUrl={post.avatarUrl}
                        username={post.username}
                        handle={post.handle}
                        timestamp={post.timestamp}
                        content={post.content}
                        mediaUrl={post.mediaUrl}
                        likes={post.likes}
                        retweets={post.retweets}
                        replies={post.replies}
                    />
                ))}
            </div>
        </div>
      </div>
      {showModalEdit && <EditProfile setShowModal={setShowModalEdit} profileData={profileData} />}
      {showModalPost && <AddPost setShowModal={setShowModalPost} profileData={profileData} />}
    </main>
  );
}
