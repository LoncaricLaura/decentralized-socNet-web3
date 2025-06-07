'use client'
import Link from 'next/link'
import FriendsList from "./FriendsList";
import { useState } from "react";

export default function Menu() {
    const [showModalFriendsList, setShowModalFriendsList] = useState(false);

    const toggleModalFriendsList = () => {
        setShowModalFriendsList(!showModalFriendsList);
    };
    
    return (
        <>
      <main className="sticky top-32 w-1/4 lg:w-1/6 h-[250px] hidden md:flex flex-col items-start justify-start gap-y-5 my-16 border-r border-[#d1e3fa]">
        <div className="flex flex-row items-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <img
                src="/images/icon-friends.png"
                alt="Icon Home"
                width={50}
                height={50}
            />
            <div className="mt-4" onClick={toggleModalFriendsList}>Friends</div>
        </div>
        <div className="flex flex-row items-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <img
                src="/images/icon-saved.png"
                alt="Icon Profile"
                width={50}
                height={50}
            />
            <Link href={`/saved-posts`}>Saved</Link>
        </div>
        <div className="flex flex-row items-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <img
                src="/images/icon-rewards.png"
                alt="Icon Profile"
                width={50}
                height={50}
            />
            <Link href={`/profile`}>Rewards</Link>
        </div>

      </main>
    {showModalFriendsList && <FriendsList setShowModal={setShowModalFriendsList} />}
    </>
    );
  }