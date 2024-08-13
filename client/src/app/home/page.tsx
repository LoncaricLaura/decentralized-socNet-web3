'use client'

import Menu from "../components/Menu";
import Post from "../components/Post";

export default function Home() {
//  {fake data}
  const posts = [
    {
      avatarUrl: "/images/icon-profile.png",
      username: "John Doe",
      handle: "johndoe",
      timestamp: "2h ago",
      content: "This is an example of a Twitter-like post.",
      mediaUrl: "/images/icon-chat.png",
      likes: 123,
      retweets: 45,
      replies: 67,
    },
    {
      avatarUrl: "/images/icon-profile.png",
      username: "Jane Smith",
      handle: "janesmith",
      timestamp: "3h ago",
      content: "Another example post.",
      mediaUrl: "/images/icon-chat.png",
      likes: 234,
      retweets: 56,
      replies: 78,
    },
  ];
  return (
    <main className="relative flex flex-row min-h-screen">
      <div className="flex justify-start gap-10 px-4 sm:px-16 2xl:px-24 py-16 w-full">
        <Menu />
        <div className="w-full md:w-[80%] xl:w-[60%] pt-16">
            {posts.map((post, index) => (
              <Post
                key={index}
                avatarUrl={post.avatarUrl}
                username={post.username}
                handle={post.handle}
                timestamp={post.timestamp}
                content={post.content}
                mediaUrl={post.mediaUrl}
                likes={post.likes}
                retweets={post.retweets}
                replies={post.replies}
              />
          ))}
        </div>
      </div>
    </main>
  );
}
