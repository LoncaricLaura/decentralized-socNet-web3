'use client';
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { getFile, getIPFSUrl, getIPFSUrls } from "../ipfs";
import Gun from "gun";
import Post from "../components/Post";
import Menu from "../components/Menu";

export default function SavedPosts() {
  const { accountData, fetchUserProfile } = useContext(AppContext);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  const handleUnsavePost = (postId: string) => {
        setSavedPosts((prevPosts) => prevPosts.filter((post) => post.postId !== postId));
    };

  useEffect(() => {
    const fetchSavedPosts = async () => {
        try {
            if (!accountData?.address) return;

            const gun = Gun();
            const savedPostIds: string[] = [];
            const savedPostsNode = gun.get("users").get(accountData.address).get("savedPosts");

            await new Promise((resolve) => {
                savedPostsNode.map().once((postId) => {
                    if (postId) savedPostIds.push(postId);
                });
                setTimeout(resolve, 1000);
            });

            console.log("Saved Post IDs:", savedPostIds);

            if (savedPostIds.length === 0) {
                setSavedPosts([]);
                return;
            }

            const savedPosts: any[] = [];
            await Promise.all(
                savedPostIds.map(async (postId) => {
                    return new Promise((resolve) => {
                        gun.get("posts").get(postId).once((postData) => {
                            if (postData) {
                                savedPosts.push({ ...postData, postId });
                            }
                            resolve(true);
                        });
                    });
                })
            );

            console.log("Fetched Saved Posts:", savedPosts);

            const userProfilesMap = new Map();
            const fetchProfile = async (userId: string) => {
                if (userProfilesMap.has(userId)) return userProfilesMap.get(userId);
                const userProfile = await fetchUserProfile(userId);
                if (userProfile) {
                    const profile = {
                        address: userId.toLowerCase(),
                        avatarUrl: getIPFSUrl(userProfile.profileImageCid),
                        name: userProfile.name,
                    };
                    userProfilesMap.set(userId, profile);
                    return profile;
                }
            };

            const allUsersProfiles = await Promise.all(
                [...new Set(savedPosts.map((post) => post.userId))].map(fetchProfile)
            );

            const profileMap = new Map(allUsersProfiles.map((profile) => [profile?.address, profile]));

            const postsData = await Promise.all(
                savedPosts.map(async (post) => {
                    const postJson = await getFile(post.cid);
                    const parsedPost = JSON.parse(new TextDecoder().decode(postJson));

                    const authorProfile = profileMap.get(post.userId.toLowerCase());

                    return {
                        postId: post.postId,
                        postCid: post.cid,
                        address: post.userId.toLowerCase(),
                        username: authorProfile?.name || "Unknown",
                        handle: authorProfile?.name || "Unknown",
                        timestamp: new Date(Number(post.timestamp)),
                        content: parsedPost.content,
                        mediaUrl: getIPFSUrls(parsedPost.media),
                        likes: post.likes || 0,
                        avatarUrl: authorProfile?.avatarUrl || '',
                        hidden: post.hidden || false,
                    };
                })
            );

            postsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setSavedPosts(postsData);
        } catch (error) {
            console.error('Error fetching saved posts from Gun.js:', error);
        }
    };

    fetchSavedPosts();
}, [accountData?.address]);


  return (
    <main className="flex flex-col items-center min-h-screen max-w-screen overflow-hidden">
        <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
            <Menu />
            <div className="pt-16 w-full md:max-w-[75%]">
                <h1 className="text-2xl font-bold mb-4">Saved Posts</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 2xl:gap-4 overflow-hidden">
                    {savedPosts.length > 0 ? (
                        savedPosts.map((post) => (
                                <Post
                                postId={post.postId}
                                key={post.postId}
                                avatarUrl={post.avatarUrl}
                                username={post.username}
                                address={post.address}
                                handle={post.handle}
                                timestamp={post.timestamp}
                                content={post.content}
                                mediaUrls={post.mediaUrl}
                                likes={post.likes}
                                hidden={post.hidden}
                                onUnsave={handleUnsavePost}
                                />
                        ))
                    ) : (
                        <p className="text-gray-400">No saved posts yet.</p>
                    )}
                </div>
            </div>
        </div>
    </main>
  );
}
