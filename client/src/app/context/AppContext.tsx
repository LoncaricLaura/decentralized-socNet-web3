"use client"
import { ethers } from "ethers";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { PROFILE_ADDRESS, PROFILE_ABI, POST_ABI, POST_ADDRESS } from "../../../../context/Constants";
import gun from "../../../gun";

declare var window: any

interface AppContextType {
    SEA: any;
    connectToMetaMask: () => Promise<void>;
    accountData: AccountType | undefined;
    isAuthenticated: boolean;
    profileData: ProfileType | undefined;
    fetchUserProfile: (address: string) => Promise<ProfileType | undefined>;
    userKeys: any;
  }
  
export const AppContext = createContext<AppContextType>({} as AppContextType);

export interface AccountType {
    address?: string;
    balance?: string;
    chainId?: string;
    network?: string;
}

export interface ProfileType {
  name: string;
  description: string;
  profileImageCid: string;
}

export interface PostType {
  postId: number;
  postCid: string;
  timestamp: Date;
  content: string;
  mediaUrl: string[];
  likes: number;
  hidden: boolean;
}

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [SEA, setSEA] = useState<any>(null);
  const [accountData, setAccountData] = useState<AccountType>();
  const [userKeys, setUserKeys] = useState<any>();
  const [profileData, setProfileData] = useState<ProfileType>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    import('gun/sea').then(() => {
      setSEA(Gun.SEA);
    });
  }, []);

  const updateAccountData = async (address: string) => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    setAccountData({
      address,
      balance: ethers.formatEther(balance),
      chainId: network.chainId.toString(),
      network: network.name,
    });
    setIsAuthenticated(true);

    const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, provider);
    const userProfile = await profileContract.getUser(address);

    setProfileData({
      name: userProfile.name,
      description: userProfile.description,
      profileImageCid: userProfile.profileImageCid,
    });
  };

  const connectToMetaMask = useCallback(async () => {
    if (!window.ethereum) return alert("MetaMask not installed");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      await updateAccountData(address);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, provider);
      const isRegistered = await profileContract.isUserRegistered(address);

      router.push(isRegistered ? "/home" : `/profile/${address}`);
    } catch (error: any) {
      alert(`Error connecting to MetaMask: ${error.message ?? error}`);
    }
  }, [router]);

  const fetchUserProfile = async (address: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, provider);
    const userProfile = await profileContract.getUser(address);
    return {
      name: userProfile.name,
      description: userProfile.description,
      profileImageCid: userProfile.profileImageCid,
    };
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountChange = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await updateAccountData(accounts[0]);
      } else {
        setAccountData(undefined);
        setProfileData(undefined);
        setIsAuthenticated(false);
        router.push("/");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountChange);

    const getConnectedAccount = async () => {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        await updateAccountData(accounts[0]);
      } else if (pathname !== "/") {
        router.push("/");
      }
    };

    getConnectedAccount();

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
    };
  }, [router, pathname]);

  useEffect(() => {
    const generateKeyPair = async () => {
      if (!SEA) return;
      let pair;
      const stored = localStorage.getItem("gunKeyPair");

      if (stored) {
        pair = JSON.parse(stored);
      } else {
        pair = await SEA.pair();
        localStorage.setItem("gunKeyPair", JSON.stringify(pair));
      }

      setUserKeys(pair);

      if (accountData?.address) {
        gun.get("userPubKeys").get(accountData.address).put({
          pub: pair.pub,
          epub: pair.epub
        });
      }
    };

    if (SEA && accountData?.address) generateKeyPair();
  }, [accountData]);

  useEffect(() => {
    if (!accountData?.address) return;

    const myAddress = accountData.address;
    const statusPath = `status/${myAddress}`;

    const updateStatus = () => {
      gun.get(statusPath).put({
        online: true,
        timestamp: Date.now(),
      });
    };

  updateStatus();
    const interval = setInterval(updateStatus, 15_000);

    window.addEventListener('beforeunload', () => {
      gun.get(statusPath).put({ online: false, timestamp: Date.now() });
    });

    return () => {
      clearInterval(interval);
      gun.get(statusPath).put({ online: false, timestamp: Date.now() });
    };
  }, [accountData]);

  return (
    <AppContext.Provider
      value={{
        SEA,
        accountData,
        connectToMetaMask,
        isAuthenticated,
        profileData,
        fetchUserProfile,
        userKeys
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;