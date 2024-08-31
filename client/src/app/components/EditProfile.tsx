// 'use client'
import Image from 'next/image';
import { useState } from "react";
import UploadFile from '../components/UploadFile'
import { addFile, getIPFSUrl } from '../ipfs'
import { ethers } from 'ethers';
import { PROFILE_ABI, PROFILE_ADDRESS } from '../../../../context/Constants';

interface EditProfileProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  profileData: { name: string; description: string; profileImageCid: string };
}

declare var window: any

export default function EditProfile({ setShowModal, profileData }: EditProfileProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>(profileData.name || '');
  const [description, setDescription] = useState<string>(profileData.description || '');
  const [profileImage, setProfileImage] = useState<string>(profileData.profileImageCid || '');

  const closeModal = () => {
    setShowModal(false);
  };

  const uploadFiles = async () => {
    try {
      let profileImageCid = profileImage;
      if (selectedFiles.length > 0) {
        profileImageCid = await addFile(selectedFiles[0]);
        console.log(`Uploaded file CID: ${profileImageCid}`);
      }

      const ethereum = window.ethereum;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, signer);
        const userAddress = await signer.getAddress();

        try {
           const userData = await profileContract.getUser(userAddress);

           console.log('User data:', userData);

           if (userData.name !== '') {
             await profileContract.updateUser(name, description, profileImageCid);
           } else {
            await profileContract.registerUser(name, description, profileImageCid);
           }

          console.log("Profile updated/registered successfully!");
          closeModal();
        } catch (err) {
          console.error("Error fetching user data: ", err);
        }
      } else {
        console.error("Ethereum object not found, install Metamask!");
      }
    } catch (error) {
      console.error("Error saving profile: ", error);
    }
  };
  
  const handleSaveClick = () => {
    uploadFiles();
  };

  const profileImageUrl = getIPFSUrl(profileImage);

    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[85%] sm:w-1/2 lg:w-1/2 2xl:w-1/3 h-3/4 overflow-auto bg-[#cfcccc] rounded-md px-4 py-8 flex flex-col gap-6">
            <p className="text-[#121212] font-bold text-lg">Edit profile</p>
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
                <div className="flex flex-col items-start w-full max-h-[100px] h-full text-black">
                    <label>Name</label>
                    <input className="" type="text" name="name" value={name} placeholder="John Doe" onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="flex flex-col">
                    <label>Description</label>
                    <textarea name="description" rows={2} cols={50} value={description} placeholder="Bio or description about the user" onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>

                <div className="flex flex-col items-center">
                  <UploadFile files={selectedFiles} setFiles={setSelectedFiles} txt="Upload your image" isRequired={true} />
                </div>
            </form>
            <button 
              className="font-bold px-4 py-2 text-sm md:text-md bg-gradient-to-r from-[#7ca3f0]/60 to-[#4a90e2]/60 text-[#121212] rounded-md min-w-20 md:min-w-32 w-fit" 
              type="submit"
              onClick={handleSaveClick}
            >
              Save
            </button>
        </div>
      </main>
    );
  }