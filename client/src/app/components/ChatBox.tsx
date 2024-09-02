"use client"
import Image from "next/image";

interface ChatBoxProps {
    name: string,
    image: string
}

export default function ChatBox({name, image}: ChatBoxProps) {
    return (
        <main className="relative flex flex-col justify-between bg-[#E8EAF7]/10 rounded-md shadow-md mb-4 hover:shadow-lg max-h-full h-full">
            <div className="flex items-center space-x-4 p-4 bg-[#E8EAF7]/10 ">
                <Image
                    src={image}
                    alt={`${name}s avatar`}
                    width={50}
                    height={50}
                    className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
                />
                <p>{name}</p>
            </div>
            <div className="h-full w-full py-6 px-4">
                messages
            </div>
            <div className="sticky bottom-0 w-full z-30 px-4 py-6">
                <input
                    name="content"
                    placeholder={`Type a message...`}
                    className="bg-[#E8EAF7]/10 rounded-full w-full placeholder:pl-2 placeholder:text-gray-400"
                >
                </input>
                <Image
                    src='/icons/icon-send.png'
                    alt="Icon Send"
                    width={30}
                    height={30}
                    className="cursor-pointer absolute right-7 bottom-7"
                />
            </div>
        </main>
    );
}
