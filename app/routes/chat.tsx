import { useState } from "react";
import { Link } from "react-router";
import { ScrollArea } from "~/components/ui/scroll-area";

const rooms = [
  {
    id: "1",
    name: "一般",
    lastMessage: "よろしくお願いします！",
    time: "12:34",
    unread: 3,
    members: 24,
  },
  {
    id: "2",
    name: "雑談",
    lastMessage: "週末どうでしたか？",
    time: "11:20",
    unread: 0,
    members: 18,
  },
  {
    id: "3",
    name: "質問",
    lastMessage: "解決しました、ありがとう",
    time: "09:15",
    unread: 1,
    members: 12,
  },
  {
    id: "4",
    name: "開発",
    lastMessage: "PRのレビューお願いします",
    time: "昨日",
    unread: 7,
    members: 8,
  },
  {
    id: "5",
    name: "デザイン",
    lastMessage: "モックアップ更新しました",
    time: "昨日",
    unread: 0,
    members: 5,
  },
  {
    id: "6",
    name: "お知らせ",
    lastMessage: "明日はミーティングがあります",
    time: "月曜",
    unread: 2,
    members: 30,
  },
];

const gradients = [
  "from-amber-400 to-orange-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-cyan-400 to-sky-500",
];

export default function Chat() {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const filtered = rooms.filter((r) => r.name.includes(search) || r.lastMessage.includes(search));

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
        className="px-6 pt-8 pb-5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(240,234,216,0.06)" }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-[1.75rem] font-semibold tracking-[-0.03em] leading-none"
              style={{ color: "#f0ead8" }}
            >
              メッセージ
            </h1>
            <p
              className="text-xs mt-2 font-medium tracking-wide uppercase"
              style={{ color: "#4a4540", letterSpacing: "0.08em" }}
            >
              {rooms.length} チャンネル
            </p>
          </div>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{ background: "rgba(212,168,67,0.12)", color: "#d4a843" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "#4a4540" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
            style={{
              background: "rgba(240,234,216,0.04)",
              border: "1px solid rgba(240,234,216,0.07)",
              color: "#f0ead8",
            }}
          />
        </div>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        <div className="py-3">
          {filtered.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "#4a4540" }}>
              見つかりませんでした
            </p>
          )}
          {filtered.map((room, i) => (
            <Link
              key={room.id}
              to={`/chat/${room.id}`}
              onMouseEnter={() => setHovered(room.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-4 px-6 py-3.5 transition-all duration-150 relative"
              style={{
                background: hovered === room.id ? "rgba(240,234,216,0.04)" : "transparent",
              }}
            >
              {/* Unread indicator line */}
              {room.unread > 0 && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r-full"
                  style={{ background: "#d4a843" }}
                />
              )}

              <div className="relative flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-base shadow-lg`}
                >
                  {room.name[0]}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{
                    background: i % 3 === 2 ? "#6b7280" : "#22c55e",
                    borderColor: "#0d0c0a",
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-semibold text-sm tracking-[-0.01em]"
                    style={{ color: room.unread > 0 ? "#f0ead8" : "#a09890" }}
                  >
                    {room.name}
                  </span>
                  <span className="text-xs flex-shrink-0 ml-2" style={{ color: "#4a4540" }}>
                    {room.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-xs truncate"
                    style={{ color: room.unread > 0 ? "#a09890" : "#4a4540" }}
                  >
                    {room.lastMessage}
                  </p>
                  {room.unread > 0 && (
                    <span
                      className="min-w-[1.25rem] h-5 rounded-full flex items-center justify-center text-xs font-bold px-1.5 flex-shrink-0 tabular-nums"
                      style={{ background: "#d4a843", color: "#0d0c0a" }}
                    >
                      {room.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom nav hint */}
      <div
        className="px-6 py-4 flex-shrink-0 flex items-center justify-center gap-1"
        style={{ borderTop: "1px solid rgba(240,234,216,0.04)" }}
      >
        <span className="text-xs" style={{ color: "#2a2520" }}>
          {rooms.reduce((acc, r) => acc + r.unread, 0)} 件の未読メッセージ
        </span>
      </div>
    </div>
  );
}
