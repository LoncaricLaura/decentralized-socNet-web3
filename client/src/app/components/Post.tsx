'use client'
import Image from "next/image";
import React from 'react'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import PostSwiper from "./PostSwiper";
import LikeButton from "./LikeButton";
import { useRouter } from "next/navigation";

import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)

interface PostProps {
  postId: number;
  avatarUrl: string;
  username: string;
  address: string,
  handle: string;
  timestamp: Date;
  content: string;
  mediaUrls?: string[];
  likes: number;
  retweets: number;
  replies: number;
}

export default function Post({
  postId,
  avatarUrl,
  username,
  address,
  handle,
  timestamp,
  content,
  mediaUrls,
  likes,
}: PostProps) {

  const router = useRouter();
  const slug = address.toLowerCase();
  const changeRoute = () => {
    router.push(`profile/${slug}`);
  }

  return (
    <div className="relative bg-[#E8EAF7]/10 rounded-md shadow-md p-4 mb-4 hover:shadow-lg h-auto">
      <div className="flex items-start space-x-4">
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
            <ReactTimeAgo date={timestamp} locale="en-US" className="text-sm"/>
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
    </div>
  );
}
