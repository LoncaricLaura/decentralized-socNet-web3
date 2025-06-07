"use client"
import React, { useContext, useEffect, useState } from "react";
import gun from "../../../gun";
import { AppContext } from "@/app/context/AppContext";
import { getIPFSUrl } from "../ipfs";
import Link from "next/link";

interface InboxPreview {
  target: string;
  lastMessage: string;
  timestamp: number;
  avatarCid?: string;
  name?: string;
  online?: boolean;
}

export default function InboxList() {
  const { accountData, fetchUserProfile } = useContext(AppContext);
  const [inboxes, setInboxes] = useState<InboxPreview[]>([]);

    useEffect(() => {
        if (!accountData?.address) return;
        const myAddress = accountData.address;
        const today = new Date().toISOString().split("T")[0];

        gun.get("userInboxes").get(myAddress).once((inboxes) => {
            if (!inboxes) return;
            Object.keys(inboxes).forEach(async (otherUserAddress) => {
                if (!otherUserAddress) return;

                const pathsToCheck = [
                    `inbox/${myAddress}/${otherUserAddress}/${today}`,
                    `inbox/${otherUserAddress}/${myAddress}/${today}`
                ];

                for (const path of pathsToCheck) {
                    const indexPath = `${path}/index`;
                    const timestamps: string[] = [];

                    gun.get(indexPath).map().once(async (_val, key) => {
                        if (!key) return;

                        timestamps.push(key);

                        const recentKey = timestamps
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

                        if (recentKey) {
                            gun.get(`${path}/${recentKey}`).once(async (msg) => {
                                if (!msg?.text || !msg.timestamp) return;
                                const profile = await fetchUserProfile(otherUserAddress);

                                setInboxes((prev) => {
                                    const exists = prev.find(i => i.target === otherUserAddress);
                                    if (!exists) {
                                    return [
                                        ...prev,
                                        {
                                        target: otherUserAddress,
                                        lastMessage: msg.text,
                                        timestamp: msg.timestamp,
                                        name: profile?.name,
                                        avatarCid: profile?.profileImageCid,
                                        }
                                    ];
                                    }

                                    if (msg.timestamp > exists.timestamp) {
                                    return prev.map(i =>
                                        i.target === otherUserAddress
                                        ? { ...i, lastMessage: msg.text, timestamp: msg.timestamp }
                                        : i
                                    );
                                    }

                                    return prev;
                                });
                            });

                            gun.get(`status/${otherUserAddress}`).on((status) => {
                                const isOnline = status?.online && Date.now() - status.timestamp < 30_000;

                                setInboxes((prev) =>
                                    prev.map((i) =>
                                    i.target === otherUserAddress
                                        ? { ...i, online: isOnline }
                                        : i
                                    )
                                );
                                });
                        }
                    });
                }
            });
        });

    }, [accountData]);

  const sorted = [...inboxes].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="p-4 text-white pt-24">
      <h2 className="text-lg font-semibold mb-4">Your Chats</h2>
      {sorted.map((chat) => (
        <Link key={chat.target} href={`/messages/${chat.target}`} className="flex items-center gap-3 mb-4">
            <div className="relative">
                <img
                    src={getIPFSUrl(chat.avatarCid)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                />
                  {chat.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                    )}
            </div>
          <div>
            <p className="font-bold">{chat.name || chat.target}</p>
            <p className="text-xs text-gray-400">
              {new Date(chat.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
