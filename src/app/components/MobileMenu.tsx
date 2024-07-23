'use client'
import { useRouter  } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface MobileMenuProps {
    setMobMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }

export default function MobileMenu({ setMobMenuOpen }: MobileMenuProps) {
    return (
      <main className="absolute z-50 top-20 left-0 w-full h-screen md:hidden flex flex-col items-center justify-start gap-y-5 bg-[#121212] px-4 py-8">
        <div onClick={() => setMobMenuOpen(false)} className="flex items-start justify-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <Image
                src="/images/icon-friends.png"
                alt="Icon Home"
                width={20}
                height={20}
                priority
            />
            <Link href={`/home`} className="text-lg">Friends</Link>
        </div>
        <div onClick={() => setMobMenuOpen(false)} className="flex items-start justify-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <Image
                src="/images/icon-saved.png"
                alt="Icon Profile"
                width={20}
                height={20}
                priority
            />
            <Link href={`/profile`} className="text-lg">Saved</Link>
        </div>
        <div onClick={() => setMobMenuOpen(false)} className="flex items-start justify-center gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
            <Image
                src="/images/icon-rewards.png"
                alt="Icon Profile"
                width={20}
                height={20}
                priority
            />
            <Link href={`/profile`} className="text-lg">Rewards</Link>
        </div>
      </main>
    );
  }