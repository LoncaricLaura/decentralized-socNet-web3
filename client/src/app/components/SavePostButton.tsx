import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import Gun from "gun";
import { AppContext } from "../context/AppContext";

interface SavePostButtonProps {
  postId: string;
  onUnsave?: (postId: string) => void; 
}

const SavePostButton: React.FC<SavePostButtonProps> = ({ postId, onUnsave }) => {
  const { accountData } = useContext(AppContext);
  const [isSaved, setIsSaved] = useState(false);
  const gun = Gun();

  useEffect(() => {
    if (!accountData?.address) return;

    const userSavedPosts = gun.get("users").get(accountData.address).get("savedPosts");

    userSavedPosts.map().once((savedPostId) => {
      if (savedPostId === postId) {
        setIsSaved(true);
      }
    });
  }, [accountData?.address, postId]);

  const toggleSavePost = () => {
    if (!accountData?.address) {
      console.error("User not logged in");
      return;
    }

    const userSavedPosts = gun.get("users").get(accountData.address).get("savedPosts");

    if (isSaved) {
      userSavedPosts.map().once((savedPostId, key) => {
        if (savedPostId === postId) {
          userSavedPosts.get(key).put(null);
          setIsSaved(false);

          if (onUnsave) {
            onUnsave(postId);
          }
        }
      });
    } else {
      userSavedPosts.set(postId as any);
      setIsSaved(true);
    }
  };

  return (
    <Image
      src={isSaved ? "/icons/icon-saved.svg" : "/icons/icon-save.svg"}
      alt="Save Post"
      width={26}
      height={26}
      priority
      className="cursor-pointer absolute right-0 -bottom-0.5"
      onClick={toggleSavePost}
    />
  );
};

export default SavePostButton;
