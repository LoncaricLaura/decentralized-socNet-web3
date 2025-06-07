import { FC } from "react";

const FriendRequestNotification: FC<{ requestId: string, from: string, from_name: string, from_img: string, to: string, handleAccept: Function, handleDecline: Function }> = ({ requestId, from_name, from_img, handleAccept, handleDecline }) => {
  return (
    <div className="p-4 shadow-lg rounded-md">
        <p className="font-bold text-sm">New Friend Request</p>
        <div className="flex gap-1.5 justify-start items-center">
        <img
            src={from_img || "/default-avatar.png"} 
            alt={`${from_name}'s profile picture`} 
            width={40} 
            height={40} 
            className="rounded-full"
        />
         <p className="font-bold">{from_name}</p>
         <p className="text-sm">sent you a friend request.</p>
        </div>
      <div className="flex justify-center gap-4 mt-2">
        <button className="bg-green-500 text-white px-2 py-1 rounded-md" onClick={() => handleAccept(requestId)}>Accept</button>
        <button className="bg-red-500 text-white px-2 py-1 rounded-md" onClick={() => handleDecline(requestId)}>Decline</button>
      </div>
    </div>
  );
}

export default FriendRequestNotification;
