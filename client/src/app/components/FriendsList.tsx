'use client'
import Image from 'next/image';
import { useContext, useEffect, useState } from "react";
import { getIPFSUrl } from '../ipfs'
import { AppContext } from "../context/AppContext";
import { useRouter } from "next/navigation";
import gun from "../../../gun";

interface FriendsListProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  customChangeRoute?: string;
  title?: string;
}

interface Friend {
  address: string;
  name: string;
  profileImage: string;
}

const FriendsList: React.FC<FriendsListProps> = ({ setShowModal, customChangeRoute, title}) => {
    const router = useRouter();
    const [friends, setFriends] = useState<Friend[]>([]);
    const { accountData, fetchUserProfile } = useContext(AppContext);

    const closeModal = () => {
        setShowModal(false);
    };

    const handleRouteChange = (slug: string) => {
        if (customChangeRoute) {
            router.push(`${customChangeRoute}/${slug}`);
        } else {
            router.push(`/profile/${slug}`);
        }
    };

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const userNode = gun.get("users").get(accountData?.address as any).get("friends");

                const friendsList: Friend[] = [];
    
                userNode.map().once(async (friendAddress: string) => {
                    if (friendAddress && friendAddress !== accountData?.address) {
                        try {
                            const profile = await fetchUserProfile(friendAddress);
                            if (profile) {
                                friendsList.push({
                                    address: friendAddress,
                                    name: profile.name,
                                    profileImage: getIPFSUrl(profile.profileImageCid),
                                });
                            }
                        } catch (err) {
                            console.error(`Error fetching profile for ${friendAddress}:`, err);
                        }
                    }
                    setFriends([...friendsList]);

                });
            } catch (error) {
                console.error("Error fetching friends list:", error);
            }
        };
    
        fetchFriends();
    }, [accountData?.address]);
    

    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-50 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[85%] sm:w-1/2 lg:w-1/2 2xl:w-1/3 h-3/4 overflow-auto bg-[#cfcccc] rounded-md px-4 py-8 flex flex-col gap-6 z-50">
            <p className="text-[#121212] font-bold text-lg">{title || `My Friends (${friends.length})`}</p>
            <button
              className="absolute top-8 right-4"
              onClick={closeModal}
            >
              <Image
                src="/icons/icon-close.png"
                alt="Icon Close"
                width={25}
                height={25}
                priority
              />
            </button>

            {friends.length === 0 ? (
                <p className='text-black'>You have no friends yet.</p>
            ) : (
                <ul>
                    {friends.map((friend, index) => (
                        <li key={index} className='flex items-center gap-4 text-black py-2 cursor-pointer' onClick={() => handleRouteChange(friend.address)}>
                            <img 
                                src={friend.profileImage} 
                                alt="Profile Image" 
                                width={40} 
                                height={40} 
                                className="rounded-full"
                            />
                            <span>{friend.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </main>
    );
}

export default FriendsList;
