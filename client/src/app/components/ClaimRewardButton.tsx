'use client'

import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

export default function ClaimRewardButton() {
  const { canClaimReward, claimFirstPostReward } = useContext(AppContext);
  const [isVisible, setIsVisible] = useState(true);

  if (!canClaimReward || !isVisible) return null;

  const handleClick = async () => {
    try {
      await claimFirstPostReward();
      setIsVisible(false);
    } catch (err) {
      console.error("Reward claim failed:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform animate-bounce"
    >
      🎁 Claim First Post Reward
    </button>
  );
}
