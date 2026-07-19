export type ChatMessage = {
  id: number;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: number;
};

export type QueueServerEvent = { type: "matched"; roomId: string; partnerName: string };

export type RoomServerEvent =
  | { type: "history"; messages: ChatMessage[]; peerNames: string[] }
  | { type: "message"; message: ChatMessage }
  | { type: "peer-joined"; name: string }
  | { type: "peer-left" };

export type RoomClientEvent = { type: "message"; body: string };
