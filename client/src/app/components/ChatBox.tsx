"use client";
import Image from "next/image";
import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "@/app/context/AppContext";
import { getIPFSUrl } from "../ipfs";
import UploadFile from "./UploadFile";
import { ChatMessage } from "../@types/chat";
import { useSharedSecret } from "../hooks/useSharedSecret";
import { useSendMessage } from "../hooks/useSendMessage";
import { useMessages } from "../hooks/useMessages";

interface ChatBoxProps {
  name: string;
  image: string;
  targetUserId: string | string[];
}

export default function ChatBox({ name, image, targetUserId }: ChatBoxProps) {
  const { SEA, fetchUserProfile, profileData, accountData, userKeys } = useContext(AppContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showModalAttachFile, setShowModalAttachFile] = useState(false);

  const myAddress = accountData?.address;
  const targetAddress = typeof targetUserId === "string" ? targetUserId : targetUserId[0];

  const today = new Date().toISOString().split("T")[0];
  const pathA = myAddress && targetAddress ? `inbox/${myAddress}/${targetAddress}/${today}` : "";
  const pathB = myAddress && targetAddress ? `inbox/${targetAddress}/${myAddress}/${today}` : "";

  const { sharedSecret, sharedSecretsCache } = useSharedSecret(SEA, targetAddress, userKeys);

  useMessages(pathA, pathB, SEA, userKeys, sharedSecretsCache, setMessages);

  const sendMessage = useSendMessage(
    SEA,
    myAddress!,
    targetAddress!,
    userKeys,
    profileData,
    sharedSecret,
    setMessages,
    fetchUserProfile
  );

  const handleSendMessage = () => {
    sendMessage(inputValue, selectedFiles, () => {
      setInputValue("");
      setSelectedFiles([]);
      setShowModalAttachFile(false);
    });
  };

  const toggleModalAttachFile = () => {
    setShowModalAttachFile(!showModalAttachFile);
  };

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  return (
    <main className="relative flex flex-col justify-between bg-[#E8EAF7]/10 rounded-md shadow-md mb-4 hover:shadow-lg max-h-full h-full w-full lg:w-[60%]">
      <div className="sticky z-40 top-0 flex items-center space-x-4 p-4 bg-[#E8EAF7]/10 ">
        <img
          src={image}
          alt={`${name}'s avatar`}
          width={50}
          height={50}
          className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
        />
        <p>{name}</p>
      </div>

      <div className="flex flex-col-reverse h-full w-full py-6 px-4 overflow-y-auto">
        {sortedMessages.map((message, index) => {
          const isUserMessage = message.sender === myAddress;
          return (
            <div
              key={index}
              className={`${
                isUserMessage
                  ? "flex w-full justify-end items-end space-x-2 mb-3"
                  : "flex w-full justify-start items-start space-x-2 mb-3"
              }`}
            >
              {!isUserMessage && (
                <img
                  src={getIPFSUrl(message.avatarCid)}
                  className="w-8 h-8 rounded-full"
                  alt="Sender"
                />
              )}
              <div
                className={`mb-2 px-4 py-1.5 rounded-full w-fit max-w-80 ${
                  message.fileCid
                    ? ""
                    : isUserMessage
                    ? "bg-[#79abed]/50"
                    : "bg-[#548ad1]/50"
                }`}
              >
                {message.fileCid ? (
                  message.fileType?.startsWith("image/") ? (
                    <img
                      src={getIPFSUrl(message.fileCid)}
                      className="rounded-md w-20 md:w-full max-w-48"
                    />
                  ) : message.fileType?.startsWith("video/") ? (
                    <video controls className="rounded-md max-w-xs">
                      <source
                        src={getIPFSUrl(message.fileCid)}
                        type={message.fileType}
                      />
                    </video>
                  ) : (
                    <a
                      href={getIPFSUrl(message.fileCid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-200"
                    >
                      📄 {message.fileName || "Document"}
                    </a>
                  )
                ) : (
                  <p className="text-sm text-pretty break-all">{message.text}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`sticky flex justify-center my-auto bottom-0 w-full z-30 px-4 py-6 ${showModalAttachFile ? 'pb-0' : ''}`}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          name="content"
          placeholder="Type a message..."
          className="bg-[#E8EAF7]/10 rounded-full w-full text-white placeholder:text-light-gray py-2 pr-6 pl-12"
        />
        <Image
          src="/icons/icon-send.png"
          alt="Send"
          width={30}
          height={30}
          className={`cursor-pointer absolute right-8 bottom-10 ${showModalAttachFile ? 'bottom-4' : ''}`}
          onClick={handleSendMessage}
        />
        <Image
          src="/icons/icon-attach.png"
          alt="Attach"
          width={25}
          height={25}
          className={`cursor-pointer absolute left-8 bottom-10 ${showModalAttachFile ? 'bottom-4' : ''}`}
          onClick={toggleModalAttachFile}
        />
      </div>

      {showModalAttachFile && (
        <UploadFile
          files={selectedFiles}
          setFiles={setSelectedFiles}
          setShowModal={setShowModalAttachFile}
          txt=""
          isRequired={false}
        />
      )}
    </main>
  );
}

