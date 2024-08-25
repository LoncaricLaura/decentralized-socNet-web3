'use client'
import { useRouter  } from "next/navigation";
import { useContext } from "react";
import Image from 'next/image';
import { AppContext } from "../context/AppContext";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

interface ConnectToWalletProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountData?: React.Dispatch<React.SetStateAction<AccountType>>;
}

export default function ConnectToWallet({ setShowModal, setAccountData }: ConnectToWalletProps) {
  const { connectToMetaMask } = useContext(AppContext);

  const closeModal = () => {
    setShowModal(false);
  };
    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[50%] sm:w-1/2 lg:w-1/3 2xl:w-1/3 h-1/3 bg-[#cfcccc] rounded-md px-4 pt-6 pb-12 flex flex-col items-center gap-6">
            <p className="text-[#121212] text-lg md:text-xl font-bold">Connect to your wallet</p>
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
            <div className="flex gap-4 bg-[#f0eded] hover:bg-[#f7f5f5] rounded-md px-4 py-2 w-fit m-auto">
              <Image
                src="/icons/icon-metamask.svg"
                alt="MetaMask"
                width={50}
                height={50}
                priority
              />
              <button onClick={connectToMetaMask} className="text-[#121212] text-md">
                Connect to MetaMask
              </button>
           </div>
        </div>
      </main>
    );
  }