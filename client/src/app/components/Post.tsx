'use client'
import Image from "next/image";
import React, { useContext, useState } from 'react'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import PostSwiper from "./PostSwiper";
import LikeButton from "./LikeButton";
import { usePathname, useRouter } from "next/navigation";
import { AppContext } from "../context/AppContext";
import en from 'javascript-time-ago/locale/en'
import DeletePostModal from "./HidePostModal";
import { ethers } from "ethers";
import { POST_ADDRESS, POST_ABI } from "../../../../context/Constants";
import { removePinnedData } from "../ipfs";

TimeAgo.addDefaultLocale(en)
declare var window: any

interface PostProps {
  postId: number;
  postCid?: string;
  avatarUrl: string;
  username: string;
  address: string,
  handle: string;
  timestamp: Date;
  content: string;
  mediaUrls?: string[];
  likes: number;
  hidden: boolean;
}

export default function Post({
  postId,
  postCid,
  avatarUrl,
  username,
  address,
  handle,
  timestamp,
  content,
  mediaUrls,
  likes,
  hidden = false,
}: PostProps) {

  const { accountData } = useContext(AppContext);
  const router = useRouter();
  const pathName = usePathname();
  const slug = address.toLowerCase();
  const [showModalHide, setShowModalHide] = useState(false);

  const changeRoute = () => {
    router.push(`profile/${slug}`);
  }
  
  const toggleModalHide = () => {
    setShowModalHide(!showModalHide);
  };

  const showPost = async () => {
    try {
      await removePinnedData(postCid || '');

      const ethereum = window.ethereum;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);

        const hidePost = await postContract.showPost(postId);
        await hidePost.wait();
        console.log("Post has been shown on the profile");
      }
    } catch (error) {
      console.error("Error showing post: ", error);
    }
  }

  return (
    <div className="relative bg-[#E8EAF7]/10 rounded-md shadow-md mb-4 hover:shadow-lg h-auto">
          {
        hidden === true && (
          <div className="absolute flex items-center justify-center z-20 h-full w-full m-auto bg-[#121212]/85">
            <button onClick={showPost} className="flex gap-2 items-center bg-gradient-to-r from-[#7ca3f0] to-[#4a90e2] hover:from-[#5c8ded] hover:to-[#5c8ded] rounded-md min-w-20 w-fit text-white font-bold text-lg px-4 py-2.5">
                <Image
                    src='/icons/icon-show.png'
                    alt="Icon show"
                    width={20}
                    height={20}
                    className=""
                />
                <p className="text-sm md:text-md">Show the post on your profile</p>
            </button>
          </div>
        )
      }
      <div className="flex items-start space-x-4 p-4">
        <Image
          src={avatarUrl}
          alt={`${username}'s avatar`}
          width={50}
          height={50}
          className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
          onClick={changeRoute}
        />
        <div className="relative w-full max-w-[80%]">
          <div className="flex justify-between text-[#e8f0fa]">
            <div className="flex flex-col items-start max-w-fit cursor-pointer truncate" onClick={changeRoute}>
              <p className="font-bold">{username}</p>
              <p className="text-sm ml-1">@{handle.toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-end max-w-fit cursor-pointer gap-y-2">
              <ReactTimeAgo date={timestamp} locale="en-US" className="text-sm"/>
              {pathName === `/profile/${accountData?.address}` && (
                <Image
                    src='/icons/icon-hide.png'
                    alt="Icon hide"
                    width={20}
                    height={20}
                    className=""
                    onClick={toggleModalHide} />
              )}
            </div>
          </div>
          <p className="mt-2 text-[#e8f0fa]">{content}</p>
          {mediaUrls && mediaUrls.length > 0 && (
            <div className="relative mt-2 z-0">
                <PostSwiper mediaUrls={mediaUrls} />
            </div>
          )}
          <div className="flex space-x-4 mt-4 text-gray-500">
            <LikeButton postId={postId} currentLikes={likes} />
          </div>
        </div>
      </div>
      
      {showModalHide && <DeletePostModal setShowModal={setShowModalHide} postCid={postCid} postId={postId} />}
    </div>
  );
}
