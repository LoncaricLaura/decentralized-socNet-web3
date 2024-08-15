'use client'
import { useRouter  } from "next/navigation";
import { useCallback } from "react";
import Image from 'next/image';
import { ethers } from "ethers";

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

declare var window: any

export default function ConnectToWallet({ setShowModal, setAccountData }: ConnectToWalletProps) {
  const router = useRouter();

  const _connectToMetaMask = useCallback(async () => {
    const ethereum = window.ethereum;
    if (typeof ethereum !== "undefined") {
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(ethereum);
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        const accountData = {
          address,
          balance: ethers.formatEther(balance),
          chainId: network.chainId.toString(),
          network: network.name,
        };
        
        setAccountData?.(accountData);
        localStorage.setItem('accountData', JSON.stringify(accountData));
        router.push('/home');
      } catch (error: Error | any) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }, [setAccountData, router]);

  const closeModal = () => {
    setShowModal(false);
  };
    return (
      <main className="fixed flex items-center justify-center top-0 left-0 z-40 m-auto w-full h-full bg-[#121212]/85">
        <div className="relative w-[50%] sm:w-1/2 lg:w-1/2 2xl:w-1/4 h-1/4 bg-[#cfcccc] rounded-md px-4 py-6 flex flex-col items-center gap-6">
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
              <button onClick={_connectToMetaMask} className="text-[#121212] text-md">
                Connect to MetaMask
              </button>
           </div>
        </div>
      </main>
    );
  }