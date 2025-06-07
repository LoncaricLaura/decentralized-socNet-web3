'use client'
import Image from 'next/image';
import { useContext } from 'react';
import { AppContext } from "@/app/context/AppContext";
import gun from "../../../gun";

interface FriendsModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  slug: any,
  setFriendRequestStatus: React.Dispatch<React.SetStateAction<'none' | 'pending' | 'sent' | 'friends'>>;
}

export default function FriendsModal({ setShowModal, slug, setFriendRequestStatus }: FriendsModalProps) {
    const { accountData } = useContext(AppContext);

    const handleUnfriend = async () => {
        if (!accountData?.address || !slug) {
          console.error("Invalid data: missing addresses.");
          return;
        }
      
        const senderNode = gun.get('users').get(accountData.address).get('friends');
        senderNode.map().once((friendAddress, friendKey) => {
          if (friendAddress === slug) {
            senderNode.get(friendKey).put(null);
          }
        });
      
        const receiverNode = gun.get('users').get(slug).get('friends');
        receiverNode.map().once((friendAddress, friendKey) => {
          if (friendAddress === accountData.address) {
            receiverNode.get(friendKey).put(null);
          }
        });
      
        setFriendRequestStatus('none');
        setShowModal(false);
        console.log(`Unfriended ${slug}`);
      };
      

  const closeModal = () => {
    setShowModal(false);
  };
    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[90%] sm:w-1/2 lg:w-1/3 2xl:w-1/3 h-1/4 bg-[#cfcccc] rounded-md px-4 pt-6 pb-12 flex flex-col items-center gap-6">
            <p className="text-[#121212] text-lg md:text-xl font-bold max-w-[80%] text-center text-wrap">Do you want to remove a friend?</p>
            <button
              className="absolute top-6 right-4"
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
            <button onClick={handleUnfriend} className="bg-gradient-to-r from-[#7ca3f0] to-[#4a90e2] hover:from-[#5c8ded] hover:to-[#5c8ded] rounded-md min-w-20 md:min-w-32 m-auto">
              <p className='text-center text-white font-bold text-lg px-4 py-2.5'>Unfriend</p>
           </button>
        </div>
      </main>
    );
  }