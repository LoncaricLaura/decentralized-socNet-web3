"use client"
import Image from "next/image";
import React, { useEffect, useRef, useState } from 'react';

interface ChatBoxProps {
    name: string,
    image: string,
    targetUserId: string | string[]; 
}

export default function ChatBox({name, image, targetUserId}: ChatBoxProps) {
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
  
    useEffect(() => {
      wsRef.current = new WebSocket("ws://localhost:3001");
  
      wsRef.current.onopen = () => {
        console.log("Connected to WebSocket server");
      };
  
      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(await event.data.text());
        if (data.type === 'offer') {
          handleOffer(data.offer);
        } else if (data.type === 'answer') {
          handleAnswer(data.answer);
        } else if (data.type === 'candidate') {
          handleCandidate(data.candidate);
        } else if (data.type === 'message') {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      };
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        if (dataChannelRef.current) {
          dataChannelRef.current.close();
          dataChannelRef.current = null;
        }
      };      
    }, []);
  
    useEffect(() => {
      if (targetUserId) {
        initiateConnection(targetUserId);
      }
    }, [targetUserId]);
  
    const initiateConnection = async (peerId: string | string[]) => {
        const pc = new RTCPeerConnection();
        pcRef.current = pc;
      
        const dataChannel = pc.createDataChannel('chat');
        dataChannelRef.current = dataChannel;
        dataChannel.onopen = () => console.log('Data channel open');
        dataChannel.onclose = () => console.log('Data channel closed');
        dataChannel.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, data]);
        };
      
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            wsRef.current?.send(JSON.stringify({
              type: 'candidate',
              candidate: event.candidate,
            }));
          }
        };
      
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      
        wsRef.current?.send(JSON.stringify({
          type: 'offer',
          offer: pc.localDescription,
          peerId
        }));
      };
  
    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current?.send(JSON.stringify({
            type: 'candidate',
            candidate: event.candidate,
          }));
        }
      };
      
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        dataChannelRef.current = channel;
        channel.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, data]);
        };
      };
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      wsRef.current?.send(JSON.stringify({
        type: 'answer',
        answer: pc.localDescription
      }));
    };
  
    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };
  
    const handleCandidate = async (candidate: RTCIceCandidateInit | undefined) => {
      if (pcRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };
  
    const handleSendMessage = () => {
        if (inputValue.trim() === "" || !dataChannelRef.current) return;
      
        const messageToSend = {
          sender: name,
          text: inputValue,
        };
      
        try {
          if (dataChannelRef.current.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify(messageToSend));
            console.log('Message sent:', messageToSend);
      
            setMessages((prevMessages) => [...prevMessages, messageToSend]);
            setInputValue("");
          } else {
            console.error('Data channel is not open');
          }
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      };
      
    
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
            <div className="flex flex-col-reverse h-full w-full py-6 px-4 overflow-y-auto">
                {messages.map((message, index) => {
                    const isUserMessage = message.sender === name;
                    return (
                        <div key={index} className={`${isUserMessage ? 'flex w-full justify-end' : 'flex w-full justify-start'}`}>
                        <div
                            className={`mb-2 px-4 py-1.5 rounded-full w-fit ${
                                isUserMessage ? 'bg-[#79abed]/50' : 'bg-[#548ad1]/50'
                            }`}
                        >
                            {message.text}
                        </div>
                        </div>
                    );
                })}
            </div>
            <div className="sticky bottom-0 w-full z-30 px-4 py-6">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                        }}
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
                    onClick={handleSendMessage}
                />
            </div>
        </main>
    );
}
