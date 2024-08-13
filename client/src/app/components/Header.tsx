'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import MobileMenu from "./MobileMenu";
import { AccountType } from "./ConnectToWallet";

interface HeaderProps extends AccountType {}

export default function Header() {
  const [accountData, setAccountData] = useState<HeaderProps>({});
  const [mobMenuOpen, setMobMenuOpen] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('accountData');
    if (storedData) {
      setAccountData(JSON.parse(storedData));
    }
  }, []);

  const pathname = usePathname();

  const toggleMobMenu = () => {
    setMobMenuOpen(!mobMenuOpen);
  };

  const bgColorClass = pathname !== '/' ? 'bg-[#121212]' : '';
  const loginClass = pathname === '/' ? 'md:hidden' : '';
    return (
      <main className={`fixed px-4 sm:px-16 2xl:px-24 top-0 w-full flex h-20 flex-row items-center justify-between ${bgColorClass}`}>
        <div className="relative flex items-center justify-between">
          <Image
            src="/images/spark.png"
            alt="Icon Close"
            className="w-12 h-12"
            width={70}
            height={70}
            priority
          />
          {pathname === '/' && (
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-l from-[#7ca3f0] to-[#4a90e2] text-transparent bg-clip-text italic">
              Spark 
            </h1>
          )}
        </div>
        <div className={`flex gap-8 items-center ${loginClass}`}>
            <Link href={`/home`} className="flex flex-row items-end gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
              <Image
                  src="/images/icon-home.png"
                  alt="Icon Home"
                  width={30}
                  height={30}
                  priority
              />
              <p className="hidden sm:flex">Home</p>
            </Link>
            <Link href={`/profile`} className="flex flex-row items-end gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
                <Image
                    src="/images/icon-profile.png"
                    alt="Icon Profile"
                    width={30}
                    height={30}
                    priority
                />
                <p className="hidden sm:flex">Profile</p>
            </Link>
            <Link href={`/messages`} className="flex flex-row items-end gap-x-2 cursor-pointer text-[#d1e3fa] hover:text-white">
                <Image
                    src="/images/icon-chat.png"
                    alt="Icon Messages"
                    width={30}
                    height={30}
                    priority
                />
                <p className="hidden sm:flex">Messages</p>
            </Link>
          </div>

          <div className={`hidden md:flex px-2 mx-2 max-w-24 truncate ${loginClass}`}>
            <span>🟢 {accountData.address ?? "Wallet Address"}</span>
          </div>
          <div className="md:hidden flex items-center">
            <button className="btn ml-4 flex flex-col" aria-label="Menu" onClick={toggleMobMenu}>
              <div className={`hamb-line m-0.5 h-0.5 w-6 bg-[#e8f0fa] transition-all duration-300 ${mobMenuOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
              <div className={`hamb-line m-0.5 h-0.5 w-6 bg-[#e8f0fa] transition-all duration-300 ${mobMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`hamb-line m-0.5 h-0.5 w-6 bg-[#e8f0fa] transition-all duration-300 ${mobMenuOpen ? 'translate-y-[-7px] -rotate-45' : ''}`} />
            </button>
          </div>
          {mobMenuOpen && <MobileMenu setMobMenuOpen={setMobMenuOpen} />}
      </main>
    );
  }