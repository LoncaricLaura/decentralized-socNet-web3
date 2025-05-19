'use client'

import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import Post from "../../components/Post";
import EditProfile from "../../components/EditProfile";
import AddPost from "../../components/AddPost";
import { getFile, getIPFSUrl, getIPFSUrls } from '../../ipfs';
import { useParams } from "next/navigation";
import { PostType, AppContext } from "@/app/context/AppContext";
import Link from "next/link";
import FriendsModal from "@/app/components/FriendsModal";
import FriendsList from "@/app/components/FriendsList";

export default function Profile() {
  const { slug } = useParams();
  const { accountData, profileData, fetchUserProfile, deletePost } = useContext(AppContext);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalPost, setShowModalPost] = useState(false);
  const [userProfileData, setUserProfileData] = useState({
    name: "",
    description: "",
    profileImageCid: "",
  });
  const [userPosts, setUserPosts] = useState<PostType[]>();
  const [friendRequestStatus, setFriendRequestStatus] = useState<'none' | 'pending' | 'sent' | 'friends'>('none');
  const [showModalFriends, setShowModalFriends] = useState(false);
  const [showModalFriendsList, setShowModalFriendsList] = useState(false);

  const toggleModalFriendsList = () => {
    setShowModalFriendsList(!showModalFriendsList);
  };
  const fetchProfileData = useCallback(() => {
    if (!slug) return;

    const gun = Gun();
    const postNode = gun.get('posts');

    const postsMap = new Map<string, any>();

    postNode.map().on(async (postData, postId) => {
      if (!postData || postData.userId !== slug) return;

      const existing = postsMap.get(postId);
      const updatedHidden = postData.hidden ?? false;

      if (existing && existing.hidden === updatedHidden) return; // prevent unnecessary updates

      try {
        if (slug) {
          const profile = await fetchUserProfile(slug as '');
          if (profile) {
            setUserProfileData(profile);
          }

          if (profile?.name === '') {
            setShowModalEdit(true);
          }
        const postJson = await getFile(postData.cid);
        const parsedPost = JSON.parse(new TextDecoder().decode(postJson));
        const updatedPost = {
          postId,
          postCid: postData.cid,
          timestamp: new Date(Number(postData.timestamp)),
          content: parsedPost.content,
          mediaUrl: getIPFSUrls(parsedPost.media),
          likes: postData.likes,
          hidden: updatedHidden,
        };

        postsMap.set(postId, updatedPost);

        const allPosts = Array.from(postsMap.values());

        const sorted = allPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (accountData?.address === slug) {
          setUserPosts(sorted);
        } else {
          setUserPosts(sorted.filter(p => !p.hidden));
        }
        }
      } catch (err) {
        console.error("Error processing post update:", err);
      }
    });

  }, [slug, accountData?.address]);

  useEffect(() => {
    fetchProfileData();
    return () => {
      const gun = Gun();
      gun.get('posts').off(); // stops all map listeners
    };
  }, [slug, fetchUserProfile]); 

  const profileImageUrl = getIPFSUrl(userProfileData.profileImageCid);

  const toggleModalEdit = () => {
    setShowModalEdit(!showModalEdit);
  };

  const toggleModalPost = () => {
    setShowModalPost(!showModalPost);
  };

  const toggleModalFriends = () => {
    setShowModalFriends(!showModalFriends);
  };

  useEffect(() => {
    const fetchFriendRequestStatus = async () => {
      const gun = Gun();
      const requestNode = gun.get('friendRequests');
  
      requestNode.map().once((requestData) => {
        if (requestData && requestData.from && requestData.to) {
          if (requestData.from === accountData?.address && requestData.to === slug) {
            setFriendRequestStatus('sent');
          } else if (requestData.to === accountData?.address && requestData.from === slug && requestData.status === 'pending') {
            setFriendRequestStatus('pending');
          }
        }
      });

      const senderNode = gun.get('users').get(accountData?.address as any).get('friends');
      const receiverNode = gun.get('users').get(slug as string).get('friends');

      senderNode.map().once((friendAddress: string) => {
        if (friendAddress === slug) {
          setFriendRequestStatus('friends');
        }
      });

      receiverNode.map().once((friendAddress: string) => {
        if (friendAddress === accountData?.address) {
          setFriendRequestStatus('friends');
        }
      });
    };

    fetchFriendRequestStatus();
  }, [accountData?.address, slug]);

  const handleSendFriendRequest = async () => {
    if (friendRequestStatus === 'none') {
      const gun = Gun();
      const requestNode = gun.get('friendRequests');
      const request = {
        from: accountData?.address,
        from_name: profileData?.name,
        from_img: profileData?.profileImageCid,
        to: slug,
        to_name: userProfileData.name,
        to_img: userProfileData.profileImageCid,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      requestNode.set(request);
      
      setFriendRequestStatus('sent');
      console.log(`Friend request sent to ${slug}`);
    } else if (friendRequestStatus === 'sent') {
      const gun = Gun();
      const requestNode = gun.get('friendRequests');
      requestNode.map().once((requestData, requestId) => {
        if (requestData && requestData.from === accountData?.address && requestData.to === slug) {
          requestNode.get(requestId).put(null);
        }
      });

      setFriendRequestStatus('none');
      console.log(`Friend request canceled for ${slug}`);
    }
  };

  // deletePost("mass79qpjHN5d9VVd7KD");

  return (
    <main className="min-h-screen w-full">
      <div className="relative px-4 sm:px-16 2xl:px-24 py-16 w-full">
        <div className="relative bg-none md:bg-black/60 h-[250px] w-full rounded-lg shadow-md">
            <div className="absolute bottom-0 md:bottom-[-50px] left-0 md:left-16 flex flex-row items-center gap-8">
                {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={`User's avatar`}
                      width={200}
                      height={200}
                      className="rounded-[50%] border-2 border-white shadow-lg"
                      // priority
                    />
                  ) : (
                  <div className="rounded-full border-4 border-white shadow-lg w-50 h-50 bg-gray-300 flex items-center justify-center">
                    <span>Loading...</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold text-white">{userProfileData.name}</h1>
                    <p className="text-md text-gray-300">@{userProfileData.name.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
            </div>
        </div>
        {
          accountData?.address === slug ? (
            <div className="pt-5 flex justify-end items-center gap-x-6">
              <button
                  className="w-fit flex gap-1"
                  onClick={toggleModalEdit}
                >
                  <Image
                    src="/icons/icon-edit.png"
                    alt="Icon Edit"
                    width={15}
                    height={15}
                    priority
                    style={{ width: "auto", height: "auto" }}
                  />
                  <p className="text-sm">Edit profile</p>
                </button>
              <button
                  className="w-fit flex items-center gap-1"
                  onClick={toggleModalPost}
                >
                  <Image
                    src="/icons/icon-add.svg"
                    alt="Icon Add"
                    width={12}
                    height={12}
                    priority
                  />
                  <p className="text-sm">Add post</p>
                </button>
            </div>
          ) : (
            <div className="pt-5 flex justify-end items-center gap-x-6">
              <button
                className={`font-bold p-1.5 text-white text-sm md:text-md bg-gradient-to-r from-[#7ca3f0]/60 to-[#4a90e2]/60 text-[#121212] rounded-md min-w-20 md:min-w-32 w-fit ${friendRequestStatus === 'sent' ? 'bg-gray-400' : ''}`}
                onClick={friendRequestStatus === 'friends' ? toggleModalFriends : handleSendFriendRequest}
              >
                {friendRequestStatus === 'friends' ? 'Friends' : (friendRequestStatus === 'sent' ? 'Request Sent' : 'Add friend')}
              </button>
            <Link
              href={`/messages/${slug}`}
              className="w-fit flex items-center gap-1"
            >
              <Image
                src="/icons/icon-send.png"
                alt="Icon Add"
                width={15}
                height={15}
                priority
              />
              <p className="text-sm">Send message</p>
            </Link>
          </div>
          )
        }
        <div className="pt-16 flex flex-col md:flex-row justify-center gap-10 w-full max-w-full md:max-w-[80%] 3xl:max-w-[70%]">
                <div className="relative md:sticky top-0 md:top-32 flex flex-col items-start justify-center h-full text-center pb-12 md:pb-16 w-full md:w-[20%] border-b md:border-b-0 md:border-r border-[#d1e3fa] mt-0 md:mt-0">
                  {
                    accountData?.address === slug && (
                    <div className="flex flex-row items-center justify-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white pb-6">
                      <Image
                        src="/images/icon-friends.png"
                        alt="Icon Home"
                        width={25}
                        height={25}
                        priority
                      />
                      <div className="" onClick={toggleModalFriendsList}>My friends</div>
                    </div>
                    )
                  }
                    <p className="mt-2 mr-4 lg:mr-0 text-sm text-gray-400 text-start text-wrap">{userProfileData.description}</p>
                </div>
            <div className="flex flex-col w-full md:w-[65%] py-b md:pb-16">
                {(userPosts ?? []).length > 0 ? (
                  userPosts?.map((post, index) => (
                    <Post
                        postId={post.postId}
                        postCid={post.postCid}
                        key={index}
                        avatarUrl={profileImageUrl}
                        username={userProfileData.name}
                        address={slug as ''}
                        handle={userProfileData.name.toLowerCase()}
                        timestamp={post.timestamp}
                        content={post.content}
                        mediaUrls={post.mediaUrl}
                        likes={post.likes}
                        hidden={post.hidden}
                        fetchData={fetchProfileData}
                    />
                ))
              ) : (
                <p className="text-center text-gray-400">No posts yet.</p>
              )}
            </div>
        </div>
      </div>
      {showModalEdit && <EditProfile setShowModal={setShowModalEdit} profileData={userProfileData} />}
      {showModalPost && <AddPost setShowModal={setShowModalPost} profileData={userProfileData} />}
      {showModalFriends && <FriendsModal setShowModal={setShowModalFriends} slug={slug} setFriendRequestStatus={setFriendRequestStatus} />}
      {showModalFriendsList && <FriendsList setShowModal={setShowModalFriendsList} />}
    </main>
  );
}
