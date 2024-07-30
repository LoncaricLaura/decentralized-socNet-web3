'use client'
import Image from 'next/image';
import { useState } from "react";
import UploadFile from '../components/UploadFile'

interface EditProfileProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditProfile({ setShowModal }: EditProfileProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const closeModal = () => {
    setShowModal(false);
  };
    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[85%] sm:w-1/2 lg:w-1/3 h-3/4 bg-[#cfcccc] rounded-md px-4 py-8 flex flex-col gap-6">
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
            <form className="w-[100%] flex flex-col gap-4" method="POST" action="https://www.formbackend.com/f/664decaabbf1c319">
                <div className="flex flex-col items-start w-full max-h-[100px] h-full">
                    <label>Name</label>
                    <input className="" type="text" name="name" placeholder="John Doe" />
                </div>

                <div className="flex flex-col">
                    <label>Description</label>
                    <textarea name="message" rows={2} cols={50} placeholder="Bio or description about the user"></textarea>
                </div>

                <div className="flex">
                    <UploadFile files={selectedFiles} setFiles={setSelectedFiles} txt="Upload your image" isRequired={true} />
                </div>

            </form>
            <button 
              className="absolute bottom-8 right-4 px-4 font-bold py-2 text-sm md:text-md bg-gradient-to-r from-[#7ca3f0]/60 to-[#4a90e2]/60 text-[#121212] rounded-md min-w-20 md:min-w-32 w-fit" 
              type="submit"
            >
              Save
            </button>
        </div>
      </main>
    );
  }