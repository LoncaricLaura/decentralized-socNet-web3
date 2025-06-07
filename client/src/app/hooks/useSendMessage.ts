import gun from "../../../gun";
import { addFile } from '../ipfs'
import { ChatMessage } from "../@types/chat";

export const useSendMessage = (
  SEA: any,
  myAddress: string | undefined,
  targetAddress: string,
  userKeys: any,
  profile: any,
  sharedSecret: string | null,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  fetchUserProfile: (address: string) => Promise<any>
) => {
  const storeMessage = (from: string, to: string, bucket: string, key: string, message: any) => {
    const base = `inbox/${from}/${to}/${bucket}`;
    gun.get(base).get(key).put(message);
    gun.get(`${base}/index`).get(key).put(true);
    gun.get("userInboxes").get(from).get(to).put(true);
  };

  return async (text: string, files: File[], clear: () => void) => {
    if (!SEA || (!text.trim() && files.length === 0) || !sharedSecret || !myAddress || !userKeys?.pub) return;

    const selfSecret = await SEA.secret(userKeys.epub, userKeys);
    const now = new Date();
    const timestamp = now.getTime();
    const key = now.toISOString();
    const bucket = now.toISOString().split("T")[0];
    const profileData = profile || await fetchUserProfile(myAddress);

    const baseMessage = {
      sender: myAddress,
      timestamp,
      senderPubKey: userKeys.epub,
      avatarCid: profileData?.profileImageCid,
      senderName: profileData?.name,
    };

    if (text.trim()) {
      const encryptedForThem = await SEA.encrypt(text, sharedSecret);
      const encryptedForMe = await SEA.encrypt(text, selfSecret);
      storeMessage(myAddress, targetAddress, bucket, key, { ...baseMessage, text: encryptedForMe });
      storeMessage(targetAddress, myAddress, bucket, key, { ...baseMessage, text: encryptedForThem });
      setMessages((prev) => [...prev, { ...baseMessage, text }]);
    }

    for (const file of files) {
      const cid = await addFile(file);
      const forThem = {
        ...baseMessage,
        fileCid: await SEA.encrypt(cid, sharedSecret),
        fileType: await SEA.encrypt(file.type, sharedSecret),
        fileName: await SEA.encrypt(file.name, sharedSecret),
      };
      const forMe = {
        ...baseMessage,
        fileCid: await SEA.encrypt(cid, selfSecret),
        fileType: await SEA.encrypt(file.type, selfSecret),
        fileName: await SEA.encrypt(file.name, selfSecret),
      };
      const fileKey = new Date().toISOString();
      const fileBucket = fileKey.split("T")[0];
      storeMessage(myAddress, targetAddress, fileBucket, fileKey, forMe);
      storeMessage(targetAddress, myAddress, fileBucket, fileKey, forThem);
      setMessages((prev) => [...prev, { ...baseMessage, fileCid: cid, fileType: file.type, fileName: file.name }]);
    }

    clear();
  };
};
