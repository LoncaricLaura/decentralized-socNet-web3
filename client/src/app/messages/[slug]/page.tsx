'use client';
import { useContext, useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox";
import Menu from "../../components/Menu";
import { useParams } from "next/navigation";
import { AppContext } from "@/app/context/AppContext";
import { getIPFSUrl } from "@/app/ipfs";

export default function Messages() {
  const { slug } = useParams();
  const { fetchUserProfile } = useContext(AppContext);

    const [userProfileData, setUserProfileData] = useState({
        name: "",
        profileImageCid: "",
      });

    useEffect(() => {
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
          fetchProfileData();
    }, [slug, fetchUserProfile]); 

    const profileImageUrl = getIPFSUrl(userProfileData.profileImageCid);
    
    return (
        <main className="relative flex flex-row h-screen">
            <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
                <Menu />
                <div className="relative w-full md:w-[50%] pt-16">
                    <ChatBox name={userProfileData.name} image={profileImageUrl} targetUserId={slug} />
                </div>
            </div>
        </main>
    );
}
