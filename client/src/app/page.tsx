'use client'

import ConnectToWallet from "./components/ConnectToWallet";
import { useState } from "react";

export default function Login() {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <main className="relative flex flex-col h-screen w-full">
      <div className="relative flex flex-col md:flex-row items-center md:justify-between h-full px-4 sm:px-16 2xl:px-24 py-28 md:py-36 z-10 w-full">
        <div className="flex flex-col gap-6 md:gap-10 xl:gap-16 w-full md:w-1/2">
          <div className="w-full flex flex-col gap-4 justify-start">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#7ca3f0]">Welcome to Spark: The Decentralized Social Network</h1>
            <p className="text-md lg:text-xl font-bold text-[#7ca3f0] w-full sm:w-3/5 md:w-full">Connect, share, and engage with true ownership and privacy on the Ethereum blockchain.</p>
          </div>
          <div className="w-1/3 flex justify-start items-center">
            <button type="button" onClick={toggleModal} className="px-4 font-bold py-2 text-sm md:text-md bg-gradient-to-r from-[#7ca3f0] to-[#4a90e2] text-[#121212] rounded-md min-w-20 md:min-w-32">
              LOGIN
            </button>
            {showModal && <ConnectToWallet setShowModal={setShowModal} />}
          </div>
        </div>
        {/* <div className="w-full md:w-1/2">
        <Image
            src="/images/login.png"
            alt="Image"
            className="w-full h-auto"
            width={500}
            height={500}
            priority
          />
        </div> */}
      </div>
    </main>
  );
}
