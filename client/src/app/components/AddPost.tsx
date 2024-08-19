// 'use client'
import Image from 'next/image';
import { useState } from "react";
import UploadFile from '../components/UploadFile'
import { addFile, addJson } from '../ipfs'
import { ethers } from 'ethers';
import { POST_ABI, POST_ADDRESS } from '../../../../context/Constants';

interface AddPostProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  profileData: { name: string, description: string; };
}

declare var window: any

export default function AddPost({ setShowModal, profileData }: AddPostProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [content, setContent] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const closeModal = () => {
    setShowModal(false);
  };

  const uploadPost = async () => {
    try {
      const mediaCids: string[] = [];
    
      for (const file of selectedFiles) {
        const mediaCid = await addFile(file);
        console.log(`Uploaded media CID: ${mediaCid}`);
        mediaCids.push(mediaCid);
      }

        const postJson = {
            media: mediaCids,
            content: content,
            location: location,
            timestamp: Date.now()
        };

        const postCid = await addJson(postJson);
        console.log(`Uploaded post JSON CID: ${postCid}`);

        const ethereum = window.ethereum;
        if (ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, signer);

            await postContract.createPost(postCid);
            console.log("Post stored on-chain successfully!");
            closeModal();
        } else {
            console.error("Ethereum object not found, install Metamask!");
        }
    } catch (error) {
      console.error("Error uploading post:", error);
    }
  };
  
  const handleSaveClick = () => {
    uploadPost();
  };

    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[85%] sm:w-1/2 lg:w-1/2 2xl:w-1/3 h-3/4 overflow-auto bg-[#cfcccc] rounded-md px-4 py-8 flex flex-col gap-6">
            <p className="text-[#121212] font-bold text-lg">Add post</p>
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
            <form className="w-[100%] flex flex-col gap-4" method="POST">
                <div className="flex flex-col">
                    <textarea name="content" rows={2} cols={50} value={content} placeholder="Share your thoughts..." onChange={(e) => setContent(e.target.value)}></textarea>
                </div>

                <div className="flex flex-col">
                    <textarea name="text" rows={2} cols={50} value={location} placeholder="Location" onChange={(e) => setLocation(e.target.value)}></textarea>
                </div>

                <div className="flex">
                    <UploadFile files={selectedFiles} setFiles={setSelectedFiles} txt="" isRequired={true} />
                </div>

            </form>
            <button 
              className="font-bold px-4 py-2 text-sm md:text-md bg-gradient-to-r from-[#7ca3f0]/60 to-[#4a90e2]/60 text-[#121212] rounded-md min-w-20 md:min-w-32 w-fit" 
              type="submit"
              onClick={handleSaveClick}
            >
              Post
            </button>
        </div>
      </main>
    );
  }