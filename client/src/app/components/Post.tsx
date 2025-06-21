'use client'
import React, { useContext, useEffect, useState } from 'react'
import ReactTimeAgo from 'react-time-ago'
import '../utils/timeAgoInit';
import PostSwiper from "./PostSwiper";
import LikeButton from "./LikeButton";
import { usePathname, useRouter } from "next/navigation";
import { AppContext } from "../context/AppContext";
import HidePostModal from "./HidePostModal";
import Comments from "./Comments";
import SavePostButton from "./SavePostButton";
import gun from "../../../gun";
import ClaimLikeRewardButton from './ClaimLikeRewardButton';

declare var window: any

interface PostProps {
  postId: any;
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
  fetchData?: () => void;
  onUnsave?: (postId: string, user: string) => void
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
  onUnsave
}: PostProps) {

  const { accountData, profileData } = useContext(AppContext);
  const router = useRouter();
  const pathName = usePathname();
  const slug = address.toLowerCase();
  const [showModalHide, setShowModalHide] = useState(false);
  const [showModalComments, setShowModalComments] = useState(false);
  const [imageSize, setImageSize] = useState(50);
  const pathname = usePathname();
  const [likers, setLikers] = useState<string[]>([]);
  const [localHidden, setLocalHidden] = useState(hidden);
  const { checkLikeRewardStatus } = useContext(AppContext);

  const changeRoute = () => {
    router.push(`profile/${slug}`);
  }
  
  const toggleModalHide = () => {
    setShowModalHide(!showModalHide);
  };

  const toggleModalComments = () => {
    setShowModalComments(!showModalComments);
  }

  const updateSize = () => {
    if (pathname === '/saved-posts') {
      setImageSize(30);
    } else {
      setImageSize(window.innerWidth < 1024 ? 30 : 50);
    }
  }
  
  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize)
  }, [pathname]);

  const showPost = async () => {
    try {
      if (postId) {
        gun.get('posts').get(postId.toString()).put({ hidden: false });
        setLocalHidden(false);
      }
    } catch (error) {
      console.error("Error showing post:", error);
    }
  };

  useEffect(() => {
    setLocalHidden(hidden);
  }, [hidden]);

  useEffect(() => {
      if (accountData?.address) {
        checkLikeRewardStatus(postId);
      }
    }, [accountData?.address]);

  return (
    <div className="relative bg-[#E8EAF7]/10 rounded-md shadow-md mb-4 hover:shadow-lg h-auto">
      {
        localHidden === true && (
          <div className="absolute flex items-center justify-center z-20 h-full w-full m-auto bg-[#121212]/85">
            <button onClick={showPost} className="flex gap-2 items-center bg-gradient-to-r from-[#7ca3f0] to-[#4a90e2] hover:from-[#5c8ded] hover:to-[#5c8ded] rounded-md min-w-20 w-fit text-white font-bold text-lg px-4 py-2.5">
                <img
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
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          width={imageSize}
          height={imageSize}
          className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
          onClick={changeRoute}
          style={{ width: "80px", height: "80px" }}
        />
        <div className="relative w-full max-w-[80%]">
          <div className="flex justify-between text-[#e8f0fa]">
            <div className="flex flex-col items-start max-w-fit cursor-pointer truncate" onClick={changeRoute}>
              <p className="font-bold">{username}</p>
              <p className="text-sm ml-1">@{handle?.toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-end max-w-fit cursor-pointer gap-y-2">
              <ReactTimeAgo date={timestamp} locale="en-US" className="text-sm"/>
              {pathName === `/profile/${accountData?.address}` && (
                <img
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

          <div className="relative flex items-start space-x-3 pt-4 text-gray-500">
            <LikeButton postId={postId} currentLikes={likes} postAuthorAddress={address} onLikersChange={(updatedLikers) => setLikers(updatedLikers)} />
            <img
              src="/icons/icon-comment.svg"
              alt="Icon Comment"
              width={26}
              height={26}
              className="cursor-pointer absolute left-8 -bottom-0.5"
              onClick={toggleModalComments}
            />
            <SavePostButton postId={postId} user={address} onUnsave={onUnsave} />
          </div>

          {showModalComments && <Comments setShowModal={setShowModalComments} postId={postId} currentUser={{
            avatarUrl: profileData?.profileImageCid || "/images/icon-profile.png",
            username: profileData?.name || "Anonymous",
          }} />}
          </div>
        </div>
      
      {accountData?.address && (
        <ClaimLikeRewardButton postId={postId} />
      )}
      {showModalHide && <HidePostModal setShowModal={setShowModalHide} postCid={postCid} postId={postId} onHide={() => setLocalHidden(true)}  />}
    </div>
  );
}
