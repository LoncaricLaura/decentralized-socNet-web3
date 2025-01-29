'use client';
import Menu from "../components/Menu";
import Post from "../components/Post";
import Image from "next/image";
import { getFile, getIPFSUrl, getIPFSUrls } from '../ipfs';
import { useEffect, useState, useContext } from "react";
import AddPost from "../components/AddPost";
import { useRouter } from "next/navigation";
import { AppContext } from "../context/AppContext";


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
                const gun = Gun();
                const postsNode = gun.get('posts');
                const allPosts: any[] = [];
                
                await new Promise((resolve, reject) => {
                    postsNode.map().once((postData, postId) => {
                        if (postData) {
                            allPosts.push({ ...postData, postId });
                        }
                    });
                    setTimeout(resolve, 2000);
                });
                console.log(allPosts)

                const allUsersProfiles = await Promise.all(
                    allPosts.map(async (post) => {
                        const userId = post.userId;
                        console.log('userid', userId)
                        const userProfile = await fetchUserProfile(userId as '');
                        if (userProfile) {
                            return {
                                address: userId.toLowerCase(),
                                avatarUrl: getIPFSUrl(userProfile.profileImageCid),
                                name: userProfile.name,
                            }
                        }
                    })
                );
        
                const profileMap = new Map(
                    allUsersProfiles.map((profile: any) => [profile.address, profile])
                );
        
                const posts = await Promise.all(
                    allPosts.map(async (post) => {
                        const postJson = await getFile(post.cid);
                        const parsedPost = JSON.parse(new TextDecoder().decode(postJson));
        
                        const authorProfile = profileMap.get(post.userId.toLowerCase());
        
                        return {
                            postId: post.postId,
                            postCid: post.cid,
                            address: post.userId.toLowerCase(),
                            username: authorProfile.name,
                            handle: authorProfile.name,
                            timestamp: new Date(Number(post.timestamp)),
                            content: parsedPost.content,
                            mediaUrl: getIPFSUrls(parsedPost.media),
                            likes: post.likes || 0,
                            avatarUrl: authorProfile?.avatarUrl || '',
                            hidden: post.hidden || false,
                        };
                    })
                );
        
                const filteredPosts = posts.filter((post: any) => !post.hidden);
                filteredPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
                setAllPosts(filteredPosts);
            } catch (error) {
                console.error('Error fetching posts from Gun.js:', error);
            }
        };
        
        // const postId = 'm6b6lg9eWQhg36xPX4ZU'; // Replace with the specific post's ID
        // gun.get('posts').get(postId).put(null); // Deletes the specific post
        
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
