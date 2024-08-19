'use client'
import Menu from "../components/Menu";
import Post from "../components/Post";
import Image from "next/image";
import { getFile, getIPFSUrl, getIPFSUrls } from '../ipfs';
import { PROFILE_ABI, PROFILE_ADDRESS, POST_ABI, POST_ADDRESS } from '../../../../context/Constants';
import { ethers } from 'ethers';
import { Key, useEffect, useState } from "react";
import AddPost from "../components/AddPost";
import { useRouter } from "next/navigation";

declare var window: any

export default function Home() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "",
    description: "",
    profileImageCid: "",
  });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [showModalPost, setShowModalPost] = useState(false);

  const toggleModalPost = () => {
    setShowModalPost(!showModalPost);
  };

// TODO: change function -> all posts will be displayed here
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const ethereum = window.ethereum;
        if (ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, signer);
          const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);

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

          const postIds = await postContract.getUserPosts(userAddress);

          const posts = await Promise.all(
            postIds.map(async (postId: any) => {
              const postData = await postContract.getPost(postId);

              const postJson = await getFile(postData.postCid);
              const parsedPost = JSON.parse(new TextDecoder().decode(postJson));

              return {
                username: profileData.name,
                handle: profileData.name.toLowerCase().replace(/\s+/g, ''),
                timestamp: new Date(Number(postData.timestamp) * 1000),
                content: parsedPost.content,
                mediaUrl: getIPFSUrls(parsedPost.media)
              };
            })
          )
          posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setUserPosts(posts);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [profileData.name]);

  const profileImageUrl = getIPFSUrl(profileData.profileImageCid);

  return (
    <main className="relative flex flex-row min-h-screen">
      <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
        <Menu />
        <div className="w-full md:w-[80%] xl:w-[50%] pt-16">
          <div className="flex items-start gap-3 w-full h-fit px-4 rounded-md mb-10">
            <Image
              src={profileImageUrl}
              alt={`${profileData.name}'s avatar`}
              width={50}
              height={50}
              className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
              onClick={() => router.push('/profile')}
            />
            <textarea name="content" rows={2} cols={50} placeholder={`Share your thoughts, ${profileData.name}`} className="cursor-pointer bg-[#e1e4f5]/50 rounded-full w-full placeholder:pl-2 placeholder:text-gray-800" onClick={toggleModalPost}></textarea>
          </div>
        {userPosts.length > 0 ? (
                  userPosts.map((post, index) => (
                    <Post
                        key={index}
                        avatarUrl={profileImageUrl}
                        username={post.username}
                        handle={post.handle}
                        timestamp={post.timestamp}
                        content={post.content}
                        mediaUrls={post.mediaUrl}
                        likes={post.likes}
                        retweets={post.retweets}
                        replies={post.replies}
                    />
                ))
              ) : (
                <p className="text-center text-gray-400">No posts yet.</p>
              )}
        </div>
      </div>
      {showModalPost && <AddPost setShowModal={setShowModalPost} profileData={profileData} />}
    </main>
  );
}
