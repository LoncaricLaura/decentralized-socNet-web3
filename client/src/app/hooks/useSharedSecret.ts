import { useState, useEffect, useRef } from "react";
import gun from "../../../gun";

export const useSharedSecret = (
  SEA: any,
  targetAddress: string | undefined,
  userKeys: any
) => {
  const [sharedSecret, setSharedSecret] = useState<string | null>(null);
  const sharedSecretsCache = useRef(new Map<string, string>());

  const tryGetRecipientKey = (retries = 5) => {
    if (!targetAddress || !userKeys) return;
    gun.get("userPubKeys").get(targetAddress).once(async (keys) => {
      const recipientEpub = keys?.epub;
      if (!recipientEpub) {
        if (retries > 0) setTimeout(() => tryGetRecipientKey(retries - 1), 1000);
          return;
        }
        const shared = await SEA.secret(recipientEpub, userKeys);
      if (shared) setSharedSecret(shared);
    });
  };

  useEffect(() => {
    tryGetRecipientKey();
  }, [SEA, targetAddress, userKeys]);

  return { sharedSecret, sharedSecretsCache };
};
