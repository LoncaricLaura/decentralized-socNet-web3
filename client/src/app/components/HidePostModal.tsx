'use client'
import Image from 'next/image';
import { ethers } from "ethers";
import { POST_ADDRESS, POST_ABI } from "../../../../context/Constants";
import { removePinnedData } from "../ipfs";

declare var window: any

interface HidePostModalProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  postCid?: string,
  postId: number
}

export default function HidePostModal({ setShowModal, postCid, postId }: HidePostModalProps) {

  const hidePost = async () => {
    try {
      await removePinnedData(postCid || '');

      const ethereum = window.ethereum;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);

        const hidePost = await postContract.hidePost(postId);
        await hidePost.wait();
        setShowModal(false);
        console.log("Post has been hidden from the profile");
      }
    } catch (error) {
      console.error("Error hidding post: ", error);
    }
  }

  const closeModal = () => {
    setShowModal(false);
  };
    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[90%] sm:w-1/2 lg:w-1/3 2xl:w-1/3 h-1/4 bg-[#cfcccc] rounded-md px-4 pt-6 pb-12 flex flex-col items-center gap-6">
            <p className="text-[#121212] text-lg md:text-xl font-bold max-w-[80%] text-center text-wrap">Do you want to hide this post?</p>
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
            <div className="bg-gradient-to-r from-[#7ca3f0] to-[#4a90e2] hover:from-[#5c8ded] hover:to-[#5c8ded] rounded-md min-w-20 md:min-w-32 m-auto">
                <button onClick={hidePost} className="flex gap-2 items-center text-white font-bold text-lg px-4 py-2.5">
                    <Image
                        src='/icons/icon-hide.png'
                        alt="Icon hide"
                        width={20}
                        height={20}
                        className=""
                    />
                    Hide post
              </button>
           </div>
        </div>
      </main>
    );
  }