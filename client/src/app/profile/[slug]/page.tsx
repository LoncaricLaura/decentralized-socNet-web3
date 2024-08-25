'use client'

import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import Post from "../../components/Post";
import EditProfile from "../../components/EditProfile";
import AddPost from "../../components/AddPost";
import { getIPFSUrl } from '../../ipfs';
import { useParams } from "next/navigation";
import { AccountType, AppContext } from "@/app/context/AppContext";


export default function Profile() {
  const { slug } = useParams();
  const { accountData, fetchUserProfile, getUserPosts } = useContext(AppContext);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalPost, setShowModalPost] = useState(false);
  const [userProfileData, setUserProfileData] = useState({
    name: "",
    description: "",
    profileImageCid: "",
  });
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (slug) {
          const profile = await fetchUserProfile(slug as '');
          if (profile) {
            setUserProfileData(profile);
          }

          const posts = await getUserPosts(slug as '');
          posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setUserPosts(posts);
        }
      } catch (error) {
        console.error("Error fetching profile data: ", error);
      }
    };
    fetchProfileData();
  }, [slug, fetchUserProfile, getUserPosts]); 

  const profileImageUrl = getIPFSUrl(userProfileData.profileImageCid);

  const toggleModalEdit = () => {
    setShowModalEdit(!showModalEdit);
  };

  const toggleModalPost = () => {
    setShowModalPost(!showModalPost);
  };

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
                    <h1 className="text-xl font-bold text-white">{userProfileData.name}</h1>
                    <p className="text-md text-gray-300">@{userProfileData.name.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
            </div>
        </div>
        {
          accountData?.address === slug && (
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
          )
        }
        <div className="pt-16 flex flex-col md:flex-row justify-center gap-10 w-full max-w-full md:max-w-[80%] 3xl:max-w-[70%]">
                <div className="relative md:sticky top-0 md:top-32 flex flex-col items-start justify-center h-full text-center pb-12 md:pb-16 w-full md:w-[20%] border-b md:border-b-0 md:border-r border-[#d1e3fa] mt-0 md:mt-0">
                    <p className="mt-2 mr-4 lg:mr-0 text-sm text-gray-400 text-start text-wrap">{userProfileData.description}</p>
                </div>
            <div className="flex flex-col w-full md:w-[65%] py-b md:pb-16">
                {userPosts.length > 0 ? (
                  userPosts.map((post, index) => (
                    <Post
                        postId={post.postId}
                        key={index}
                        avatarUrl={profileImageUrl}
                        username={userProfileData.name}
                        handle={userProfileData.name.toLowerCase()}
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
      </div>
      {showModalEdit && <EditProfile setShowModal={setShowModalEdit} profileData={userProfileData} />}
      {showModalPost && <AddPost setShowModal={setShowModalPost} profileData={userProfileData} />}
    </main>
  );
}
