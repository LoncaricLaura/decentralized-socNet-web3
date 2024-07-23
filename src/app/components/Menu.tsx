'use client'
import { useRouter  } from "next/navigation";
import ConnectToWallet from "../components/ConnectToWallet";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Menu() {
    return (
      <main className="sticky top-32 w-1/4 lg:w-1/6 h-[250px] hidden md:flex flex-col items-start justify-start gap-y-5 my-16 border-r border-[#d1e3fa]">
        <div className="flex flex-row items-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <Image
                src="/images/icon-friends.png"
                alt="Icon Home"
                width={50}
                height={50}
                priority
            />
            <Link href={`/home`} className="mt-4">Friends</Link>
        </div>
        <div className="flex flex-row items-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <Image
                src="/images/icon-saved.png"
                alt="Icon Profile"
                width={50}
                height={50}
                priority
            />
            <Link href={`/profile`}>Saved</Link>
        </div>
        <div className="flex flex-row items-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <Image
                src="/images/icon-rewards.png"
                alt="Icon Profile"
                width={50}
                height={50}
                priority
            />
            <Link href={`/profile`}>Rewards</Link>
        </div>
      </main>
    );
  }