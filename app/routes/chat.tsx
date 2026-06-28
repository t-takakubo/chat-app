import React, { useState } from "react";
import { Link } from "react-router";
import { Avatar, AvatarBadge, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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

const chatTheme = {
  "--background": "oklch(0.09 0.008 60)",
  "--foreground": "oklch(0.92 0.018 70)",
  "--card": "oklch(0.13 0.008 60)",
  "--card-foreground": "oklch(0.92 0.018 70)",
  "--popover": "oklch(0.13 0.008 60)",
  "--popover-foreground": "oklch(0.92 0.018 70)",
  "--primary": "oklch(0.73 0.11 70)",
  "--primary-foreground": "oklch(0.08 0 0)",
  "--secondary": "oklch(0.15 0.006 60)",
  "--secondary-foreground": "oklch(0.88 0.015 70)",
  "--muted": "oklch(0.15 0.006 60)",
  "--muted-foreground": "oklch(0.45 0.015 68)",
  "--accent": "oklch(0.18 0.007 60)",
  "--accent-foreground": "oklch(0.92 0.018 70)",
  "--border": "oklch(1 0 0 / 0.06)",
  "--input": "oklch(1 0 0 / 0.08)",
  "--ring": "oklch(0.73 0.11 70)",
  "--radius": "0.75rem",
  background: "oklch(0.09 0.008 60)",
  color: "oklch(0.92 0.018 70)",
  fontFamily: "'Geist Variable', sans-serif",
} as React.CSSProperties;

export default function Chat() {
  const [search, setSearch] = useState("");
  const filtered = rooms.filter((r) => r.name.includes(search) || r.lastMessage.includes(search));

  return (
    <div className="flex flex-col h-screen" style={chatTheme}>
      {/* Header */}
      <div
        className="px-6 pt-8 pb-5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(240,234,216,0.06)" }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-[1.75rem] font-semibold tracking-[-0.03em] leading-none"
              style={{ color: "oklch(0.92 0.018 70)" }}
            >
              メッセージ
            </h1>
            <p
              className="text-xs mt-2 font-medium tracking-wide uppercase"
              style={{ color: "oklch(0.38 0.008 60)", letterSpacing: "0.08em" }}
            >
              {rooms.length} チャンネル
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl bg-primary/10 text-primary hover:bg-white/5"
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
          </Button>
        </div>

        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "oklch(0.38 0.008 60)" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        <div className="py-3">
          {filtered.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "oklch(0.38 0.008 60)" }}>
              見つかりませんでした
            </p>
          )}
          {filtered.map((room, i) => (
            <Link
              key={room.id}
              to={`/chat/${room.id}`}
              className="flex items-center gap-4 px-6 py-3.5 transition-all duration-150 relative hover:bg-white/5"
            >
              {/* Unread indicator line */}
              {room.unread > 0 && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r-full"
                  style={{ background: "oklch(0.73 0.11 70)" }}
                />
              )}

              <Avatar className="w-12 h-12 rounded-2xl after:rounded-2xl flex-shrink-0">
                <AvatarFallback
                  className={`bg-gradient-to-br ${gradients[i % gradients.length]} text-white font-bold text-base rounded-2xl`}
                >
                  {room.name[0]}
                </AvatarFallback>
                <AvatarBadge className={i % 3 === 2 ? "bg-gray-500" : "bg-green-500"} />
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-semibold text-sm tracking-[-0.01em]"
                    style={{ color: room.unread > 0 ? "oklch(0.92 0.018 70)" : "#a09890" }}
                  >
                    {room.name}
                  </span>
                  <span
                    className="text-xs flex-shrink-0 ml-2"
                    style={{ color: "oklch(0.38 0.008 60)" }}
                  >
                    {room.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-xs truncate"
                    style={{ color: room.unread > 0 ? "#a09890" : "oklch(0.38 0.008 60)" }}
                  >
                    {room.lastMessage}
                  </p>
                  {room.unread > 0 && (
                    <Badge
                      variant="default"
                      className="min-w-[1.25rem] h-5 rounded-full px-1.5 tabular-nums"
                    >
                      {room.unread}
                    </Badge>
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
