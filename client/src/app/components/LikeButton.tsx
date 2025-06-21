import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { AppContext } from '../context/AppContext';
import gun from '../../../gun';
import LikesModal from './LikesModal';

interface LikePostProps {
  postId: number,
  currentLikes: number,
  postAuthorAddress: string; 
  onLikersChange?: (likers: string[]) => void;
}


export default function LikeButton({ postId, currentLikes, postAuthorAddress, onLikersChange }: LikePostProps) {
    const { profileData } = useContext(AppContext);
    const [likes, setLikes] = useState(currentLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [likers, setLikers] = useState<string[]>([]); 
    const [showModalLikers, setShowModalLikers] = useState(false);

    const username = profileData?.name || "Anonymous";

    const toggleModalLikers = () => {
      setShowModalLikers(!showModalLikers);
    };

    const postLikes = gun.get(`post/${postId}/likes`);

    useEffect(() => {
      postLikes.map().once((data, key) => {
        if (data) {
          setLikers((prev) => [...prev.filter((x) => x !== key), key]);
          if (key === username) setIsLiked(true);
        }
      });
    }, [postId, username, onLikersChange]);

    async function handleLike() {
      if (isLiked) {
        postLikes.get(username).put(null);
        setLikes(likes - 1);
        setIsLiked(false);
        setLikers((prev) => prev.filter((x) => x !== username));
      } else {
        postLikes.get(username).put(true);
        setLikes(likes + 1);
        setIsLiked(true);
        setLikers((prev) => [...prev, username]);
      }
    }

    return (
      <main className="">
        {likers.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 cursor-pointer" onClick={toggleModalLikers}>
            {likers.length === 1 ? (
              <p>Liked by: {likers[0]}</p>
            ) : (
              <p>Liked by: {likers[0]} and others</p>
            )}
          </div>
        )}
        <button
            onClick={handleLike}
            className="flex items-center justify-center space-x-1 pt-2"
        >
            <Image
                src={isLiked ? "/icons/icon-heart-full.svg" : "/icons/icon-heart.svg"}
                alt={isLiked ? "Icon Heart Full" : "Icon Heart Empty"}
                width={20}
                height={20}
                priority
            />
            {
                likers.length > 0 && (
                    <p className='text-[#7ca3f0] text-sm'>{likers.length}</p>
                )
            }
        </button>

        {showModalLikers && (
          <LikesModal likers={likers} onClose={toggleModalLikers} />
        )}
      </main>
    );
  }