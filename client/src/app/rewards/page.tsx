'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import gun from '../../../gun';
import Menu from '../components/Menu';

interface TipEntry {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
}

export default function RewardsPage() {
  const { accountData, checkLikeRewardStatus, spkBalance } = useContext(AppContext);
  const [rewardablePosts, setRewardablePosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivedTips, setReceivedTips] = useState<TipEntry[]>([]);
  const [sentTips, setSentTips] = useState<TipEntry[]>([]);

  const fetchRewardablePosts = async () => {
    if (!accountData?.address) return;

    const postsNode = gun.get('posts');
    const posts: any[] = [];

    postsNode.map().once(async (postData, postId) => {
      if (!postData || postData.userId !== accountData.address) return;

      const likesNode = gun.get(`post/${postId}/likes`);
      const likesSet = new Set<string>();

      likesNode.map().once((val, key) => {
        if (val) likesSet.add(key);
      });

      setTimeout(async () => {
        if (likesSet.size >= 5) {
          const notClaimed = await checkLikeRewardStatus(postId);
          if (notClaimed) {
            posts.push({ postId, likes: likesSet.size });
            setRewardablePosts([...posts]);
          }
        }
      }, 500);
    });

    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    if (!accountData?.address) return;

    const received: TipEntry[] = [];
    const sent: TipEntry[] = [];

    gun.get('tips').map().once((tip: TipEntry) => {
      if (!tip) return;
      if (tip.to === accountData.address) received.push(tip);
      if (tip.from === accountData.address) sent.push(tip);

      setReceivedTips([...received]);
      setSentTips([...sent]);
    });
    fetchRewardablePosts();
  }, [accountData?.address]);

  return (
    <main className="flex flex-col items-center min-h-screen max-w-screen overflow-hidden">
      <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
        <Menu />
        <div className="pt-16 w-full md:max-w-[75%] flex flex-col items-center justify-center p-8 bg-[#121212] text-white">
          <h1 className="text-3xl font-bold mb-6">Rewards Dashboard</h1>

          <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg w-full max-w-md text-center mb-10">
            <h2 className="text-xl mb-2">Your SPK Balance</h2>
            <p className="text-2xl font-semibold text-yellow-300">
              {spkBalance ?? '0'} SPK
            </p>
          </div>

          <div className="w-full max-w-2xl text-left">
            <h2 className="text-xl mb-4">📝 Rewardable Posts</h2>
            {loading ? (
              <p className="text-gray-400">Checking your posts...</p>
            ) : rewardablePosts.length > 0 ? (
              <ul className="list-disc pl-6 space-y-2">
                {rewardablePosts.map((post) => (
                  <li key={post.postId}>
                    Post ID: <span className="text-yellow-300">{post.postId}</span> — {post.likes} likes
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No posts are currently rewardable.</p>
            )}
          </div>

          <div className="w-full max-w-2xl text-left mt-10">
            <h2 className="text-xl mb-4">💸 Tip History</h2>
            {receivedTips.length === 0 ? (
              <p className="text-gray-400">No tips received yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {receivedTips.map((tip, idx) => (
                  <li key={idx}>
                    {tip.amount} SPK from <span className="text-blue-300">{tip.from.slice(0, 8)}</span> on {new Date(tip.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}

            <h2 className="text-xl mt-12 mb-2">📤 Tips Sent</h2>
            {sentTips.length === 0 ? (
              <p className="text-gray-400">No tips sent yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {sentTips.map((tip, idx) => (
                  <li key={idx}>
                    {tip.amount} SPK to <span className="text-green-300">{tip.to.slice(0, 8)}</span> on {new Date(tip.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
