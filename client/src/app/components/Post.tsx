'use client'
import Image from "next/image";
import React from 'react'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)

interface PostProps {
  avatarUrl: string;
  username: string;
  handle: string;
  timestamp: Date;
  content: string;
  mediaUrl?: string;
  likes: number;
  retweets: number;
  replies: number;
}

export default function Post({
  avatarUrl,
  username,
  handle,
  timestamp,
  content,
  mediaUrl,
  likes,
  retweets,
  replies,
}: PostProps) {
  return (
    <div className="bg-[#E8EAF7]/10 rounded-md shadow-md p-4 mb-4 transition-transform transform hover:scale-[1.02] duration-500 hover:shadow-lg">
      <div className="flex items-start space-x-4">
        <Image
          src={avatarUrl}
          alt={`${username}'s avatar`}
          width={50}
          height={50}
          className="rounded-full shadow-md shadow-gray-800"
        />
        <div className="flex-1">
          <div className="flex justify-between text-[#e8f0fa]">
            <div className="flex flex-col items-center">
              <span className="font-bold">{username}</span>
              <span className="text-sm ml-1">@{handle}</span>
            </div>
            <ReactTimeAgo date={timestamp} locale="en-US" className="text-sm"/>
          </div>
          <p className="mt-2 text-[#e8f0fa]">{content}</p>
          {mediaUrl && (
            <div className="mt-2">
              <Image
                src={mediaUrl}
                alt="Post media"
                width={200}
                height={200}
                style={{ width: '100%', height: 'auto' }}
                className="rounded-lg"
              />
            </div>
          )}
          <div className="flex space-x-4 mt-4 text-gray-500">
            <button className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v10m5-5l-5 5 5-5z"></path>
              </svg>
              <span>{replies}</span>
            </button>
            <button className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"></path>
              </svg>
              <span>{retweets}</span>
            </button>
            <button className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2z"></path>
              </svg>
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
