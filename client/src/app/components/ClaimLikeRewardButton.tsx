'use client';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import gun from "../../../gun";

interface ClaimLikeRewardProps {
  postId: string;
}

export default function ClaimLikeRewardButton({ postId }: ClaimLikeRewardProps) {
  const { accountData, checkLikeRewardStatus, claimLikeReward } = useContext(AppContext);
  const [canShow, setCanShow] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const getLikeCount = async (): Promise<number> => {
    return new Promise((resolve) => {
      const likesSet = new Set<string>();
      const likesNode = gun.get(`post/${postId}/likes`);

      likesNode.map().once((val, key) => {
        if (val) likesSet.add(key);
        else likesSet.delete(key);
      });

      setTimeout(() => resolve(likesSet.size), 1000);
    });
  };

  const canClaimCheck = async () => {
    try {
      if (!accountData?.address) return;

      const userAddress = accountData.address.toLowerCase();

      const postAuthor: string | null = await new Promise((resolve) => {
        gun.get(`posts/${postId}`).get('userId').once((data) => {
          resolve(data?.toLowerCase() || null);
        });
      });

      if (postAuthor !== userAddress) return;

      const likeCount = await getLikeCount();

      if (likeCount >= 5) {
        const notRewarded = await checkLikeRewardStatus(postId);

        if (notRewarded) {
          setCanShow(true);
        }
      }
    } catch (err) {
      console.error("Error during check:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    setCanShow(false);
    setIsChecking(true);
    canClaimCheck();
  }, [postId, accountData?.address]);

  const handleClick = async () => {
    try {
      await claimLikeReward(postId);
      setCanShow(false);
    } catch (err) {
      console.error("Reward claim failed:", err);
    }
  };

  if (!canShow || isChecking) return null;

  return (
    <button
      onClick={handleClick}
      className="absolute z-30 left-[45%] top-[45%] bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      🎁 Claim Likes Reward
    </button>
  );
}
