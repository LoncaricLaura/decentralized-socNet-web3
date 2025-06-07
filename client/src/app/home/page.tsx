'use client';
import Menu from "../components/Menu";
import Post from "../components/Post";
import { getFile, getIPFSUrl, getIPFSUrls } from '../ipfs';
import { useEffect, useState, useContext } from "react";
import AddPost from "../components/AddPost";
import { useRouter } from "next/navigation";
import { AppContext } from "../context/AppContext";
import FriendRequestNotification from "../components/FriendRequestNotification";
import ReactTimeAgo from "react-time-ago";
import gun from "../../../gun";

export default function Home() {
    const router = useRouter();
    const { profileData, accountData, fetchUserProfile } = useContext(AppContext);
    const [showModalPost, setShowModalPost] = useState(false);
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]); 
    const [notifications, setNotifications] = useState<any[]>([]);

    const toggleModalPost = () => {
        setShowModalPost(!showModalPost);
    };

    const fetchAllPosts = async () => {
        try {
            const postsNode = gun.get('posts');
            const allPosts: any[] = [];
            
            await new Promise((resolve) => {
                postsNode.map().once((postData, postId) => {
                    if (postData) {
                        allPosts.push({ ...postData, postId });
                    }
                });
                setTimeout(resolve, 1000);
            });

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
                [...new Set(allPosts.map((post) => post.userId))].map(fetchProfile)
            );

            const profileMap = new Map(allUsersProfiles.map((profile) => [profile?.address, profile]));
    
            const postsData = await Promise.all(
                allPosts.map(async (post) => {
                    const postJson = await getFile(post.cid);
                    const parsedPost = JSON.parse(new TextDecoder().decode(postJson));

                    const authorProfile = profileMap.get(post.userId.toLowerCase());

                    return {
                        postId: post.postId,
                        postCid: post.cid,
                        address: post.userId.toLowerCase(),
                        username: authorProfile?.name,
                        handle: authorProfile?.name,
                        timestamp: new Date(Number(post.timestamp)),
                        content: parsedPost.content,
                        mediaUrl: getIPFSUrls(parsedPost.media),
                        likes: post.likes || 0,
                        avatarUrl: authorProfile?.avatarUrl || '',
                        hidden: post.hidden || false,
                    };
                })
            );
    
            const filteredPosts = postsData.filter((post) => !post.hidden);
            filteredPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
            setAllPosts(filteredPosts);
        } catch (error) {
            console.error('Error fetching posts from Gun.js:', error);
        }
    };
    
    const fetchFriendRequests = async () => {
        try {
            const friendRequestsNode = gun.get('friendRequests');
    
            const incomingRequests: any[] = [];
    
            await new Promise((resolve) => {
                friendRequestsNode.map().once((requestData, requestId) => {
                    if (requestData && requestData.to && requestData.from) {
                        if (requestData.to === accountData?.address && requestData.status === 'pending') {
                            incomingRequests.push({
                                from: requestData.from,
                                from_name: requestData.from_name,
                                from_img: getIPFSUrl(requestData.from_img),
                                to: requestData.to,
                                requestId: requestId,
                                timestamp: requestData.timestamp,
                            });
                        }
                    }
                });
    
                setTimeout(resolve, 1000);
            });
    
            setFriendRequests(incomingRequests);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };


    const fetchNotifications = async () => {
        try {
            const notificationsNode = gun.get("notifications");
    
            const userNotifications: any[] = [];
    
            await new Promise((resolve) => {
                notificationsNode.map().once((notification, notificationId) => {
                    if (notification.user === accountData?.address) {
                        userNotifications.push({ ...notification, id: notificationId, timestamp: new Date(notification.timestamp) });
                    }
                });
    
                setTimeout(resolve, 1000);
            });
    
            const sortedNotifications = userNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setNotifications(sortedNotifications);

        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {        
        fetchAllPosts();
        fetchFriendRequests();
        fetchNotifications();
    }, [accountData?.address]);
    
    if (!profileData) {
         return 'Loading...'
    }
    
    const profileImageUrl = getIPFSUrl(profileData.profileImageCid);

    const handleAcceptRequest = async (requestId: string, senderAddress: string) => {
        if (!senderAddress || !accountData?.address) {
            console.error("Invalid data: sender or account address is undefined.");
            return;
        }
    
        gun.get('friendRequests').get(requestId).put(null);

        const senderNode = gun.get('users').get(senderAddress).get('friends');
        senderNode.set(accountData.address as any);
    
        const receiverNode = gun.get('users').get(accountData.address).get('friends');
        receiverNode.set(senderAddress as any);
    
        console.log(`Friend request accepted: ${senderAddress} is now friends with ${accountData.address}`);
    
        setFriendRequests(friendRequests.filter(request => request.requestId !== requestId));

        const senderProfile = await fetchUserProfile(senderAddress);
        const receiverProfile = await fetchUserProfile(accountData.address);

        const notifications = gun.get("notifications");
        const timestamp = Date.now();
        
        notifications.set({
            user: accountData.address,
            message: `You and ${senderProfile?.name} are now friends! 🎉`,
            type: "friendship",
            timestamp,
        });
        
        notifications.set({
            user: senderAddress,
            message: `${receiverProfile?.name} accepted your friend request! 🎉`,
            type: "friendship",
            timestamp,
        });
    };
    
    const handleDeclineRequest = async (requestId: string) => {
        const requestNode = gun.get('friendRequests').get(requestId);
        
        requestNode.put(null);

        setFriendRequests(friendRequests.filter(request => request.requestId !== requestId));
        console.log(`Friend request declined from ${accountData?.address}`);
    };

    return (
        <main className="relative flex flex-row min-h-screen">
            <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
                <Menu />
                <div className="w-full md:w-[50%] pt-16">
                    <div className="flex items-start gap-3 w-full h-fit px-0 md:px-4 rounded-md mb-10">
                        <img
                            src={profileImageUrl}
                            alt={`${profileData.name}'s avatar`}
                            width={50}
                            height={50}
                            className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
                            onClick={() => router.push(`/profile/${accountData?.address}`)}
                            style={{ width: '80px', height: '80px' }}
                        />
                        <textarea
                            name="content"
                            rows={2}
                            cols={50}
                            placeholder={`Share your thoughts, ${profileData.name}`}
                            className="cursor-pointer bg-[#e1e4f5]/80 rounded-full w-full placeholder:pl-2 placeholder:text-gray-800"
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
                <div className="flex-col gap-2 w-1/4 pt-16 hidden md:flex">
                    {notifications.length > 0 ? (
                        <div className="mt-6 w-full">
                            <h2 className="font-bold text-lg">Notifications</h2>
                            {notifications.map((notif, index) => (
                                <div key={index} className="flex justify-between items-center gap-4 p-3 bg-gray-100 rounded-md shadow-sm mt-2">
                                    <p className="text-xs text-black">{notif.message}</p>
                                    <ReactTimeAgo date={notif.timestamp} locale="en-US" className="text-[10px] text-gray-500"/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <h2 className="font-bold text-lg">No notifications.</h2>
                    )}
                    {friendRequests.length > 0 && (
                        <div className="">
                            {friendRequests.map((request, index) => (
                                <FriendRequestNotification
                                    key={index}
                                    requestId={request.requestId}
                                    from={request.from}
                                    from_name={request.from_name}
                                    from_img={request.from_img}
                                    to={request.to}
                                    handleAccept={() => handleAcceptRequest(request.requestId, request.from)}
                                    handleDecline={handleDeclineRequest}
                                />
                            ))}

                        </div>
                    )}
                </div>
            </div>
            {showModalPost && <AddPost setShowModal={setShowModalPost} profileData={profileData} />}
        </main>
    );
}
