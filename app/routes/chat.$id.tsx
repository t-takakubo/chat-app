import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "~/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "~/components/ui/message";
import { Bubble, BubbleContent } from "~/components/ui/bubble";
import { Marker, MarkerContent } from "~/components/ui/marker";
import { ChatComposer } from "~/components/chat-composer";
import { chatTheme } from "~/lib/chat-theme";

const roomData: Record<
  string,
  { name: string; members: number; gradient: string; description: string }
> = {
  "1": {
    name: "一般",
    members: 24,
    gradient: "from-amber-400 to-orange-500",
    description: "全体連絡・挨拶",
  },
  "2": {
    name: "雑談",
    members: 18,
    gradient: "from-violet-400 to-purple-500",
    description: "気軽に話しましょう",
  },
  "3": {
    name: "質問",
    members: 12,
    gradient: "from-emerald-400 to-teal-500",
    description: "わからないことはここで",
  },
  "4": {
    name: "開発",
    members: 8,
    gradient: "from-blue-400 to-indigo-500",
    description: "技術的な議論",
  },
  "5": {
    name: "デザイン",
    members: 5,
    gradient: "from-rose-400 to-pink-500",
    description: "UI/UX レビュー",
  },
  "6": {
    name: "お知らせ",
    members: 30,
    gradient: "from-cyan-400 to-sky-500",
    description: "重要なお知らせ",
  },
};

const senderGradients = [
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
];

type Message = {
  id: string;
  text: string;
  sender: string;
  isMe: boolean;
  time: string;
};

const seedMessages: Message[] = [
  { id: "1", text: "おはようございます！", sender: "田中", isMe: false, time: "09:01" },
  { id: "2", text: "おはようございます", sender: "me", isMe: true, time: "09:03" },
  {
    id: "3",
    text: "本日の作業内容を共有します。まず昨日の続きからになります",
    sender: "田中",
    isMe: false,
    time: "09:05",
  },
  {
    id: "4",
    text: "PRのリンクも貼っておきますね",
    sender: "田中",
    isMe: false,
    time: "09:05",
  },
  { id: "5", text: "了解です。確認します", sender: "me", isMe: true, time: "09:06" },
  {
    id: "6",
    text: "何か質問があれば気軽に聞いてください！",
    sender: "佐藤",
    isMe: false,
    time: "09:10",
  },
  {
    id: "7",
    text: "ありがとうございます。よろしくお願いします！",
    sender: "me",
    isMe: true,
    time: "09:11",
  },
  {
    id: "8",
    text: "今日の午後にミーティングを設定しました",
    sender: "鈴木",
    isMe: false,
    time: "10:30",
  },
  { id: "9", text: "参加します", sender: "me", isMe: true, time: "10:32" },
  { id: "10", text: "自分も参加予定です", sender: "me", isMe: true, time: "10:32" },
];

export default function ChatRoom() {
  const { id } = useParams();
  const room = roomData[id ?? "1"] ?? {
    name: "ルーム",
    members: 0,
    gradient: "from-gray-400 to-gray-500",
    description: "",
  };

  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [showInfo, setShowInfo] = useState(false);

  const send = (text: string) => {
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: "me",
        isMe: true,
        time: now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen" style={chatTheme}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{
          borderBottom: "1px solid oklch(1 0 0 / 0.06)",
          background: "oklch(0.09 0.008 60 / 0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          to="/chat"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 flex-shrink-0"
          style={{ background: "oklch(1 0 0 / 0.06)", color: "oklch(0.65 0.015 68)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${room.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}
        >
          {room.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm tracking-[-0.01em] leading-none">{room.name}</h2>
          <p className="text-xs mt-1" style={{ color: "oklch(0.38 0.008 60)" }}>
            {room.members}人のメンバー · {room.description}
          </p>
        </div>

        <button
          onClick={() => setShowInfo((v) => !v)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
          style={{
            background: showInfo ? "oklch(0.73 0.11 70 / 0.12)" : "oklch(1 0 0 / 0.06)",
            color: showInfo ? "oklch(0.73 0.11 70)" : "oklch(0.65 0.015 68)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      {/* Info bar */}
      {showInfo && (
        <div
          className="px-5 py-3 flex-shrink-0 flex items-center justify-between text-xs"
          style={{
            background: "oklch(0.73 0.11 70 / 0.06)",
            borderBottom: "1px solid oklch(0.73 0.11 70 / 0.1)",
            color: "oklch(0.65 0.015 68)",
          }}
        >
          <span>
            #{room.name} · {messages.length} 件のメッセージ
          </span>
          <button style={{ color: "oklch(0.73 0.11 70)" }} className="font-medium">
            メンバー一覧
          </button>
        </div>
      )}

      {/* Message area */}
      <div className="flex-1 min-h-0">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="py-6 gap-4 max-w-2xl mx-auto px-4">
                {/* Date separator */}
                <MessageScrollerItem>
                  <Marker variant="separator">
                    <MarkerContent>今日</MarkerContent>
                  </Marker>
                </MessageScrollerItem>

                {/* Messages */}
                {messages.map((msg, i) => {
                  const prev = messages[i - 1];
                  const isGroupStart =
                    !prev || prev.sender !== msg.sender || prev.isMe !== msg.isMe;
                  const isLast = i === messages.length - 1;
                  const senderIdx = ["田中", "佐藤", "鈴木", "山田"].indexOf(msg.sender);
                  const grad = senderGradients[Math.max(0, senderIdx) % senderGradients.length];

                  return (
                    <MessageScrollerItem
                      key={msg.id}
                      scrollAnchor={isLast}
                      className={isGroupStart ? "" : "-mt-2"}
                    >
                      <Message align={msg.isMe ? "end" : "start"}>
                        {!msg.isMe && (
                          <MessageAvatar>
                            {isGroupStart ? (
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-semibold shadow`}
                              >
                                {msg.sender[0]}
                              </div>
                            ) : (
                              <div className="w-8 h-8" />
                            )}
                          </MessageAvatar>
                        )}
                        <MessageContent>
                          {!msg.isMe && isGroupStart && <MessageHeader>{msg.sender}</MessageHeader>}
                          <Bubble
                            variant={msg.isMe ? "default" : "secondary"}
                            align={msg.isMe ? "end" : "start"}
                          >
                            <BubbleContent>{msg.text}</BubbleContent>
                          </Bubble>
                          {isLast ||
                          messages[i + 1]?.sender !== msg.sender ||
                          messages[i + 1]?.isMe !== msg.isMe ? (
                            <MessageFooter>{msg.time}</MessageFooter>
                          ) : null}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  );
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <ChatComposer onSend={send} />
    </div>
  );
}
