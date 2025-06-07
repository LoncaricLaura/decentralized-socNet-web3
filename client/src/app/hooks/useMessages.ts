import { useEffect } from "react";
import gun from "../../../gun";
import { ChatMessage } from "../@types/chat";

export const useMessages = (
  dayPathA: string,
  dayPathB: string,
  SEA: any,
  userKeys: any,
  sharedSecretsCache: React.MutableRefObject<Map<string, string>>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const loadMessagesFromIndex = async (dayPath: string, limit = 15) => {
    const indexNode = gun.get(`${dayPath}/index`).map();
    const seenKeys = new Set<string>();
    indexNode.once((_, key) => {
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);

      const sorted = [...seenKeys].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, limit);
      sorted.forEach((timestampKey) => {
        gun.get(`${dayPath}/${timestampKey}`).once(async (msg) => {
          if (!msg?.timestamp) return;
          let shared = sharedSecretsCache.current.get(msg.senderPubKey);
          if (!shared) {
            shared = await SEA.secret(msg.senderPubKey, userKeys);
            if (shared) sharedSecretsCache.current.set(msg.senderPubKey, shared);
          }
          const text = msg.text ? await SEA.decrypt(msg.text, shared) : null;
          const fileCid = msg.fileCid ? await SEA.decrypt(msg.fileCid, shared) : null;
          if (!text && !fileCid) return;
          const decrypted: ChatMessage = {
            ...msg,
            text,
            fileCid,
            fileType: msg.fileType ? await SEA.decrypt(msg.fileType, shared) : null,
            fileName: msg.fileName ? await SEA.decrypt(msg.fileName, shared) : null,
          };
          setMessages((prev) => {
            const all = [...prev, decrypted];
            const dmessages = all.filter((m, i, arr) =>
              arr.findIndex(x => x.timestamp === m.timestamp && x.sender === m.sender) === i);
            return dmessages.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
          });
        });
      });
    });
    return () => indexNode.off();
  };

  useEffect(() => {
    let offA: (() => void) | undefined;
    let offB: (() => void) | undefined;

    if (dayPathA && dayPathB && SEA && userKeys) {
      (async () => {
        offA = await loadMessagesFromIndex(dayPathA);
        offB = await loadMessagesFromIndex(dayPathB);
      })();
    }

    return () => {
      offA?.();
      offB?.();
    };
  }, [dayPathA, dayPathB, SEA, userKeys]);
};
