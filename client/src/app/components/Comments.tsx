'use client'
import Image from 'next/image';
import { useEffect, useState } from "react";
import gun from "../../../gun";
import { getIPFSUrl } from '../ipfs';
import ReactTimeAgo from 'react-time-ago';

interface CommentsProps {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    postId: any,
    currentUser: {
        avatarUrl: string;
        username: string;
    };
}

interface Comment {
    avatarUrl: string;
    username: string;
    content: string;
    timestamp: number;
  }

export default function Comments({ postId, currentUser }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>("");

      useEffect(() => {
        if (!postId) return;

        const posts = gun.get("posts");
        const commentsRef = posts.get(postId).get("comments");

        setComments([]); 
        commentsRef.map().on((comment, key) => {
            if (!comment || !key) return;

            setComments((prev) => {
                const isDuplicate = prev.some((c) => c.timestamp === comment.timestamp);
                if (isDuplicate) return prev;
                return [...prev, { ...comment, key }];
            });
        });

        return () => {
            commentsRef.off();
        };
    }, [postId]);


    const addComment = async () => {
        if (!postId) {
            console.error("Post CID is not defined. Cannot add comment.");
            return;
        }
    
        if (!newComment.trim()) {
            console.error("Comment content is empty.");
            return;
        }
        
        const comment = {
            avatarUrl: getIPFSUrl(currentUser.avatarUrl),
            username: currentUser.username,
            content: newComment,
            timestamp: Date.now(),
        };
    
        try {
            const posts = gun.get("posts");
            const commentsRef = posts.get(postId).get("comments");
            commentsRef.set(comment);
            setNewComment("");
            console.log("Comment added successfully!");
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };
    

    return (
      <main className="">
        <div className="relative w-full h-3/4 overflow-auto px-1 py-4 flex flex-col gap-4">
            <p className="text-gray-400 font-bold text-sm">Comments</p>

            <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                <div key={comment.timestamp} className="flex gap-2 items-start">
                <Image
                    src={comment.avatarUrl || "/images/icon-profile.png"}
                    alt={`${comment.username}'s avatar`}
                    width={25}
                    height={25}
                    className="rounded-full shadow-md shadow-gray-800 cursor-pointer"
                />
                <div className="flex flex-col bg-[#E8EAF7]/15 rounded-md px-2 py-1.5 w-full">
                    <div className='flex justify-between w-full'>
                        <p className="font-bold text-sm text-gray-400 pb-1 cursor-pointer">{comment.username}</p>
                        <p className="text-xs text-gray-500">
                        <ReactTimeAgo date={comment.timestamp} locale="en-US" className="text-xs"/>
                        </p>
                    </div>
                    <p className="text-gray-200 text-sm">{comment.content}</p>
                </div>
                </div>
            ))}
            </div>

            <div className="flex flex-col gap-2">
                <textarea
                    rows={2}
                    cols={50}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none border rounded-md p-2 text-white"
                ></textarea>
                <button
                    onClick={addComment}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    Add Comment
                </button>
            </div>
        </div>
      </main>
    );
  }