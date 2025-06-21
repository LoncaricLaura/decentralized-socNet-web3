'use client';
import { useContext, useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox";
import { useParams } from "next/navigation";
import { AppContext } from "@/app/context/AppContext";
import { getIPFSUrl } from "@/app/ipfs";
import InboxList from "@/app/components/InboxList";
import FriendsList from "@/app/components/FriendsList";

export default function Messages() {
  const { slug } = useParams();
  const { fetchUserProfile } = useContext(AppContext);
  const [showModalFriendsList, setShowModalFriendsList] = useState(false);

  const toggleModalFriendsList = () => {
    setShowModalFriendsList(!showModalFriendsList);
  };

  const [userProfileData, setUserProfileData] = useState({
    name: "",
    profileImageCid: "",
  });

  const fetchProfileData = async () => {
    try {
      if (slug) {
        const profile = await fetchUserProfile(slug as '');
        if (profile) {
          setUserProfileData(profile);
        }
      }
    } catch (error) {
      console.error("Error fetching profile data: ", error);
    }
  };

  useEffect(() => {
      fetchProfileData();
    }, [slug, fetchUserProfile]); 

  const profileImageUrl = getIPFSUrl(userProfileData.profileImageCid);
    
  return (
      <main className="relative flex flex-row h-screen pt-20">
        <aside className="relative hidden sm:block w-[150px] md:w-[300px] border-r overflow-y-auto">
          <InboxList />
            <button
              className="absolute bottom-8 left-4"
              onClick={toggleModalFriendsList}
            >
              Friends
            </button>
          {showModalFriendsList && <FriendsList setShowModal={setShowModalFriendsList} customChangeRoute="/messages" title="Send a message to:" />}
        </aside>

        <section className="flex-1 overflow-hidden">
          {slug ? (
            <ChatBox name={userProfileData.name} image={profileImageUrl} targetUserId={slug} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation to begin chatting.
            </div>
          )}
        </section>
      </main>
  );
}
