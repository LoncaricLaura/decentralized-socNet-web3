'use client';
import Menu from "../components/Menu";
import Post from "../components/Post";
import Image from "next/image";
import { getFile, getIPFSUrl, getIPFSUrls } from '../ipfs';
import { POST_ABI, POST_ADDRESS, PROFILE_ABI, PROFILE_ADDRESS } from '../../../../context/Constants';
import { useEffect, useState, useContext } from "react";
import AddPost from "../components/AddPost";
import { useRouter } from "next/navigation";
import { AppContext } from "../context/AppContext";
import { ethers } from "ethers";

declare var window: any

export default function Home() {
    const router = useRouter();
    const { profileData, accountData, fetchUserProfile } = useContext(AppContext);
    const [showModalPost, setShowModalPost] = useState(false);
    const [allPosts, setAllPosts] = useState<any[]>([]);

    const toggleModalPost = () => {
        setShowModalPost(!showModalPost);
    };

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);
    
                const [postIds, authors, postCids, timestamps, likes, hidden] = await postContract.getAllPosts();
    
                const allUsersProfiles = await Promise.all(authors.map(async (author: string) => {
                    const userProfile = await fetchUserProfile(author);
                    if (userProfile) {
                        return {
                            address: author.toLowerCase(),
                            avatarUrl: getIPFSUrl(userProfile.profileImageCid),
                            name: userProfile?.name,
                        };
                    }
                }));
    
                const profileMap = new Map(allUsersProfiles.map((profile: any) => [profile.address, profile]));
                
                const posts = await Promise.all(postIds.map(async (postId: any, index: number) => {
                    const postJson = await getFile(postCids[index]);
                    const parsedPost = JSON.parse(new TextDecoder().decode(postJson));
    
                    const authorProfile = profileMap.get(authors[index].toLowerCase());
    
                    return {
                        postId: postId.toString(),
                        postCid: postCids[index],
                        address: authors[index].toLowerCase(),
                        username: authorProfile?.name || authors[index],
                        handle: authorProfile?.name || authors[index],
                        timestamp: new Date(Number(timestamps[index]) * 1000),
                        content: parsedPost.content,
                        mediaUrl: getIPFSUrls(parsedPost.media),
                        likes: likes[index],
                        avatarUrl: authorProfile?.avatarUrl || '',
                        hidden: hidden[index]
                    };
                }));
                const filteredPosts = posts.filter((post: any) => !post.hidden);
                filteredPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                setAllPosts(filteredPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };
        
        fetchAllPosts();
    }, []);
    
    if (!profileData) {
         return 'Loading...'
    }
    
    const profileImageUrl = getIPFSUrl(profileData.profileImageCid);

    return (
        <main className="relative flex flex-row min-h-screen">
            <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
                <Menu />
                <div className="w-full md:w-[50%] pt-16">
                    <div className="flex items-start gap-3 w-full h-fit px-0 md:px-4 rounded-md mb-10">
                        <Image
                            src={profileImageUrl}
                            alt={`${profileData.name}'s avatar`}
                            width={50}
                            height={50}
                            className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
                            onClick={() => router.push(`/profile/${accountData?.address}`)}
                        />
                        <textarea
                            name="content"
                            rows={2}
                            cols={50}
                            placeholder={`Share your thoughts, ${profileData.name}`}
                            className="cursor-pointer bg-[#e1e4f5]/50 rounded-full w-full placeholder:pl-2 placeholder:text-gray-800"
                            onClick={toggleModalPost}
                        ></textarea>
                    </div>
                    {allPosts.length > 0 ? (
                        allPosts.map((post, index) => (
                            <Post
                                postId={post.postId}
                                key={index}
                                avatarUrl={post.avatarUrl}
                                username={post.username}
                                address={post.address}
                                handle={post.handle}
                                timestamp={post.timestamp}
                                content={post.content}
                                mediaUrls={post.mediaUrl}
                                likes={post.likes} 
                                hidden={post.hidden}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-400">No posts yet.</p>
                    )}
                </div>
            </div>
            {showModalPost && <AddPost setShowModal={setShowModalPost} profileData={profileData} />}
        </main>
    );
}
