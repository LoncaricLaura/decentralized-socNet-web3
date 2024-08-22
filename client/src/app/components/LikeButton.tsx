// TODO: Add new logic for saving likes
import Image from 'next/image';
import { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { POST_ABI, POST_ADDRESS } from '../../../../context/Constants';

interface LikePostProps {
  postId: number,
  currentLikes: number;
}

declare var window: any

export default function LikeButton({ postId, currentLikes }: LikePostProps) {
    const [likes, setLikes] = useState(currentLikes);
    const [isLiked, setIsLiked] = useState(false);

    const numOfLikes = Number(likes);

    async function handleLike() {
        try {
            const ethereum = window.ethereum;
            if (ethereum) {
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);

                const like = await postContract.likePost(postId);
                await like.wait();

                setLikes(isLiked ? likes - 1 : likes + 1);
                setIsLiked(true);
                console.log("Post liked successfully!");
            } else {
                console.error("Ethereum object not found, install Metamask!");
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    }

    async function checkIfLiked() {
        const ethereum = window.ethereum;
        try {
          if (ethereum) {   
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);
                 
            const userHasLiked = await postContract.userLikes(postId);
            setIsLiked(userHasLiked);
          }
        } catch (error) {
          console.error("Error checking if post is liked:", error);
        }
    }

    useEffect(() => {
        checkIfLiked();
      }, []);

    return (
      <main className="">
        <button
            onClick={handleLike}
            className="flex items-center space-x-1"
        >
            <Image
                src={isLiked ? "/icons/icon-heart-full.svg" : "/icons/icon-heart.svg"}
                alt={isLiked ? "Icon Heart Full" : "Icon Heart Empty"}
                width={20}
                height={20}
                priority
            />
            <span>{likes}</span>
            {
                numOfLikes > 0 && (
                    <p className='text-[#7ca3f0] text-sm'>{numOfLikes}</p>
                )
            }
        </button>
      </main>
    );
  }