export type ChatMessage = {
  id: number;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: number;
};

export type QueueServerEvent = { type: "matched"; roomId: string; partnerName: string };

export type RoomServerEvent =
  | { type: "history"; messages: ChatMessage[]; peerNames: string[]; peerVisible: boolean[] }
  | { type: "message"; message: ChatMessage }
  | { type: "peer-joined"; name: string }
  | { type: "peer-left" }
  | { type: "peer-presence"; visible: boolean }
  | { type: "peer-typing"; isTyping: boolean };

export type RoomClientEvent =
  | { type: "message"; body: string }
  | { type: "presence"; visible: boolean }
  | { type: "typing"; isTyping: boolean };
