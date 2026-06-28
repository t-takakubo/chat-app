import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ScrollArea } from "~/components/ui/scroll-area";

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
  { id: "4", text: "了解です。確認します", sender: "me", isMe: true, time: "09:06" },
  {
    id: "5",
    text: "何か質問があれば気軽に聞いてください！",
    sender: "佐藤",
    isMe: false,
    time: "09:10",
  },
  {
    id: "6",
    text: "ありがとうございます。よろしくお願いします！",
    sender: "me",
    isMe: true,
    time: "09:11",
  },
  {
    id: "7",
    text: "今日の午後にミーティングを設定しました",
    sender: "鈴木",
    isMe: false,
    time: "10:30",
  },
  { id: "8", text: "参加します", sender: "me", isMe: true, time: "10:32" },
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
  const [input, setInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
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
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        background: "#0d0c0a",
        color: "#f0ead8",
        fontFamily: "'Geist Variable', sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{
          borderBottom: "1px solid rgba(240,234,216,0.06)",
          background: "rgba(13,12,10,0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          to="/chat"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 flex-shrink-0"
          style={{ background: "rgba(240,234,216,0.06)", color: "#a09890" }}
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
          <h2
            className="font-semibold text-sm tracking-[-0.01em] leading-none"
            style={{ color: "#f0ead8" }}
          >
            {room.name}
          </h2>
          <p className="text-xs mt-1" style={{ color: "#4a4540" }}>
            {room.members}人のメンバー · {room.description}
          </p>
        </div>

        <button
          onClick={() => setShowInfo((v) => !v)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
          style={{
            background: showInfo ? "rgba(212,168,67,0.12)" : "rgba(240,234,216,0.06)",
            color: showInfo ? "#d4a843" : "#a09890",
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
            background: "rgba(212,168,67,0.06)",
            borderBottom: "1px solid rgba(212,168,67,0.1)",
            color: "#a09890",
          }}
        >
          <span>
            #{room.name} · {messages.length} 件のメッセージ
          </span>
          <button style={{ color: "#d4a843" }} className="font-medium">
            メンバー一覧
          </button>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-1 max-w-2xl mx-auto">
          {/* Date divider */}
          <div className="flex items-center gap-3 py-4">
            <div className="flex-1 h-px" style={{ background: "rgba(240,234,216,0.06)" }} />
            <span className="text-xs font-medium" style={{ color: "#3a3530" }}>
              今日
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(240,234,216,0.06)" }} />
          </div>

          {messages.map((msg, i) => {
            const showSender =
              !msg.isMe &&
              (i === 0 || messages[i - 1].sender !== msg.sender || messages[i - 1].isMe);
            const isConsecutive =
              !msg.isMe && i > 0 && messages[i - 1].sender === msg.sender && !messages[i - 1].isMe;
            const senderIndex =
              ["田中", "佐藤", "鈴木", "山田"].indexOf(msg.sender) % senderGradients.length;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${msg.isMe ? "flex-row-reverse" : "flex-row"} ${isConsecutive ? "mt-0.5" : "mt-4"}`}
              >
                {/* Avatar spacer / avatar */}
                <div className="w-8 flex-shrink-0">
                  {!msg.isMe && showSender && (
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${senderGradients[senderIndex >= 0 ? senderIndex : 0]} flex items-center justify-center text-white text-xs font-semibold shadow`}
                    >
                      {msg.sender[0]}
                    </div>
                  )}
                </div>

                <div
                  className={`flex flex-col gap-0.5 max-w-[72%] ${msg.isMe ? "items-end" : "items-start"}`}
                >
                  {!msg.isMe && showSender && (
                    <span
                      className="text-xs font-medium ml-0.5 mb-0.5"
                      style={{ color: "#6b6560" }}
                    >
                      {msg.sender}
                    </span>
                  )}

                  <div className="flex items-end gap-1.5">
                    {msg.isMe && (
                      <span
                        className="text-[10px] mb-0.5 flex-shrink-0"
                        style={{ color: "#3a3530" }}
                      >
                        {msg.time}
                      </span>
                    )}
                    <div
                      className="px-4 py-2.5 text-sm leading-relaxed"
                      style={
                        msg.isMe
                          ? {
                              background: "linear-gradient(135deg, #c9924a 0%, #d4a843 100%)",
                              color: "#0d0c0a",
                              borderRadius: "18px 18px 4px 18px",
                              fontWeight: 500,
                              boxShadow: "0 2px 12px rgba(212,168,67,0.2)",
                            }
                          : {
                              background: "rgba(240,234,216,0.07)",
                              color: "#e0d8c8",
                              borderRadius: "4px 18px 18px 18px",
                              border: "1px solid rgba(240,234,216,0.06)",
                            }
                      }
                    >
                      {msg.text}
                    </div>
                    {!msg.isMe && (
                      <span
                        className="text-[10px] mb-0.5 flex-shrink-0"
                        style={{ color: "#3a3530" }}
                      >
                        {msg.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-2" />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div
        className="px-4 pb-6 pt-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(240,234,216,0.05)" }}
      >
        <div
          className="flex items-end gap-3 max-w-2xl mx-auto rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: "rgba(240,234,216,0.04)",
            border: `1px solid ${input ? "rgba(212,168,67,0.2)" : "rgba(240,234,216,0.07)"}`,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            rows={1}
            className="flex-1 resize-none outline-none bg-transparent text-sm leading-relaxed"
            style={{
              color: "#f0ead8",
              minHeight: "24px",
              maxHeight: "120px",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, #c9924a, #d4a843)"
                : "rgba(240,234,216,0.06)",
              color: input.trim() ? "#0d0c0a" : "#3a3530",
              boxShadow: input.trim() ? "0 2px 12px rgba(212,168,67,0.3)" : "none",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[11px] mt-2" style={{ color: "#2a2520" }}>
          Enter で送信 · Shift+Enter で改行
        </p>
      </div>
    </div>
  );
}
