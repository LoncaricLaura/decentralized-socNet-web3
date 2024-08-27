"use client"
import { ethers } from "ethers";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { PROFILE_ADDRESS, PROFILE_ABI, POST_ABI, POST_ADDRESS } from "../../../../context/Constants";
import { getFile, getIPFSUrls } from "../ipfs";

declare var window: any

interface AppContextType {
    connectToMetaMask: () => Promise<void>;
    accountData: AccountType | undefined;
    isAuthenticated: boolean;
    profileData: ProfileType | undefined;
    fetchUserProfile: (address: string) => Promise<ProfileType | undefined>;
    getUserPosts: (address: string) => Promise<PostType[]>;
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

const AppProvider = ({ children}: { children: React.ReactNode}) => {
    const [accountData, setAccountData] = useState<AccountType>();
    const [profileData, setProfileData] = useState<ProfileType | undefined>();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const ethereum = window.ethereum;

    const updateAccountData = async (address: string) => {
      const provider = new ethers.BrowserProvider(ethereum);
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
  
      const accountData = {
        address,
        balance: ethers.formatEther(balance),
        chainId: network.chainId.toString(),
        network: network.name,
      };
  
      setAccountData(accountData);
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
      if (ethereum) {
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          const address = accounts[0];
          await updateAccountData(address);
  
          const provider = new ethers.BrowserProvider(ethereum);
          const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, provider);
          const isRegistered = await profileContract.isUserRegistered(address);
  
          if (isRegistered) {
            router.push("/home");
          } else {
            router.push(`/profile/${address}`);
          }
        } catch (error: Error | any) {
          alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
        }
      } else {
        alert("MetaMask not installed");
      }
    }, [router]);

    // fetch profile data for specific user
    const fetchUserProfile = async (address: string) => {
      const provider = new ethers.BrowserProvider(ethereum);
      const profileContract = new ethers.Contract(PROFILE_ADDRESS, PROFILE_ABI, provider);
      const userProfile = await profileContract.getUser(address);
      return {
          name: userProfile.name,
          description: userProfile.description,
          profileImageCid: userProfile.profileImageCid,
      };
    }

    // get current user posts
    const getUserPosts = async (address: string) => {
      const provider = new ethers.BrowserProvider(ethereum);
      const postContract = new ethers.Contract(POST_ADDRESS, POST_ABI, provider);
      const postIds = await postContract.getUserPosts(address);
      
      return await Promise.all(
        postIds.map(async (postId: any) => {
          const postData = await postContract.getPost(postId);
          const postJson = await getFile(postData.postCid);
          const parsedPost = JSON.parse(new TextDecoder().decode(postJson));
              return {
                  postId,
                  postCid: postData.postCid,
                  timestamp: new Date(Number(postData.timestamp) * 1000),
                  content: parsedPost.content,
                  mediaUrl: getIPFSUrls(parsedPost.media),
                  likes: parsedPost.likes,
                  hidden: postData.hidden
              };
          }));
  };

// update or clear data if account is changed or disconnected
    const handleAccountChange = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await updateAccountData(accounts[0]);
      } else {
        setAccountData(undefined);
        setProfileData(undefined);
        setIsAuthenticated(false);
      }
    };

      useEffect(() => {
        if (ethereum) {
          ethereum.on("accountsChanged", handleAccountChange);
    
          const getConnectedAccount = async () => {
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
              await updateAccountData(accounts[0]);
            } else {
              router.push('/');
            }
          };
          getConnectedAccount();
    
          return () => {
            ethereum.removeListener("accountsChanged", handleAccountChange);
          };
        }
      }, []);

      useEffect(() => {
        const checkMetaMaskConnection = async () => {
          if (ethereum) {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            if (accounts.length === 0 && pathname !== '/') {
              router.push('/');
            }
          } else {
            if (pathname !== '/') {
              router.push('/');
            }
          }
        };
    
        checkMetaMaskConnection();
      }, [router]);

      return (
        <AppContext.Provider
          value={{ accountData, connectToMetaMask, isAuthenticated, profileData, fetchUserProfile, getUserPosts }}
        >
          {children}
        </AppContext.Provider>
      );
}

export default AppProvider;