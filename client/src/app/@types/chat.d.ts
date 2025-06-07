export interface ChatMessage {
  sender: string;
  timestamp: number;
  avatarCid?: string;
  text?: string;
  fileCid?: string;
  fileType?: string;
  fileName?: string;
};