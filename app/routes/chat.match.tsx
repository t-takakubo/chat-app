import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { chatTheme } from "~/lib/chat-theme";
import { useMatchQueue } from "~/lib/use-match-queue";
import { getIdentity, setDisplayName } from "~/lib/session";

const ambientDots = [
  { radius: 92, duration: 7 },
  { radius: 112, duration: 9.5 },
  { radius: 104, duration: 6 },
];

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChatMatch() {
  const navigate = useNavigate();
  const { status, elapsed, result, start, cancel } = useMatchQueue();
  const [name, setName] = useState(() => getIdentity().name);

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) setDisplayName(value.trim());
  };

  return (
    <div className="flex flex-col h-screen" style={chatTheme}>
      <style>{`
        @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0% { transform: scale(0.75); opacity: 0.45; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes gentle-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.85; } }
        @keyframes draw-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes rise-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .orbit-spin, .pulse-ring, .gentle-pulse { animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 0.06)" }}
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
        <h1 className="font-semibold text-sm tracking-[-0.01em]">話す相手を探す</h1>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {status === "idle" && (
          <div
            className="flex flex-col items-center text-center max-w-xs w-full"
            style={{ animation: "rise-in 0.4s ease-out" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                background: "oklch(0.73 0.11 70 / 0.12)",
                animation: "gentle-pulse 2.6s ease-in-out infinite",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.73 0.11 70)"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" opacity="0.5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.01em] mb-2">誰かとおしゃべりする</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "oklch(0.5 0.02 68)" }}>
              コミュニティの誰かとランダムに1対1でつながります。気軽に話しかけてみましょう。
            </p>

            <label className="w-full text-left mb-6">
              <span
                className="text-xs font-medium tracking-wide uppercase block mb-1.5"
                style={{ color: "oklch(0.45 0.015 68)", letterSpacing: "0.06em" }}
              >
                表示名
              </span>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={20}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "oklch(1 0 0 / 0.05)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                  color: "oklch(0.92 0.018 70)",
                }}
              />
            </label>

            <Button onClick={start} disabled={!name.trim()} className="px-8 rounded-xl w-full">
              はじめる
            </Button>
          </div>
        )}

        {status === "searching" && (
          <div
            className="flex flex-col items-center"
            style={{ animation: "rise-in 0.4s ease-out" }}
          >
            <div className="relative w-64 h-64 flex-shrink-0">
              {/* you, at the center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <span
                    className="pulse-ring absolute w-16 h-16 rounded-full"
                    style={{
                      border: "1px solid oklch(0.73 0.11 70 / 0.5)",
                      animation: "pulse-ring 2.4s ease-out infinite",
                    }}
                  />
                  <span
                    className="pulse-ring absolute w-16 h-16 rounded-full"
                    style={{
                      border: "1px solid oklch(0.73 0.11 70 / 0.5)",
                      animation: "pulse-ring 2.4s ease-out infinite",
                      animationDelay: "1.2s",
                    }}
                  />
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.73 0.11 70)",
                      boxShadow: "0 0 24px oklch(0.73 0.11 70 / 0.4)",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="oklch(0.08 0 0)"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="12" cy="12" r="8" opacity="0.6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ambient decoration, not tied to any specific candidate */}
              {ambientDots.map((dot, i) => (
                <div
                  key={i}
                  className="orbit-spin absolute inset-0 flex items-center justify-center"
                  style={{ animation: `orbit-spin ${dot.duration}s linear infinite` }}
                >
                  <div
                    style={{ transform: `translateX(${dot.radius}px)` }}
                    className="w-2.5 h-2.5 rounded-full"
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ background: "oklch(0.73 0.11 70 / 0.35)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm mt-4 mb-1" style={{ color: "oklch(0.6 0.02 68)" }}>
              話せる相手を待っています…
            </p>
            <p
              className="text-xs tabular-nums mb-6"
              style={{ color: "oklch(0.38 0.008 60)", fontFamily: "ui-monospace, monospace" }}
            >
              {formatElapsed(elapsed)}
            </p>
            <Button variant="ghost" onClick={cancel} className="text-sm">
              キャンセル
            </Button>
          </div>
        )}

        {status === "matched" && result && (
          <div
            className="flex flex-col items-center text-center max-w-xs"
            style={{ animation: "rise-in 0.4s ease-out" }}
          >
            <div className="flex items-center justify-center mb-7">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.73 0.11 70)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="oklch(0.08 0 0)"
                  strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" opacity="0.6" />
                </svg>
              </div>
              <div
                className="w-10 h-px mx-[-1px]"
                style={{
                  background: "linear-gradient(90deg, oklch(0.73 0.11 70), oklch(0.74 0.14 25))",
                  animation: "draw-line 0.5s ease-out",
                }}
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: "oklch(0.6 0.13 25)" }}
              >
                {result.partnerName[0]}
              </div>
            </div>

            <p
              className="text-xs font-medium tracking-wide uppercase mb-2"
              style={{ color: "oklch(0.74 0.14 25)", letterSpacing: "0.08em" }}
            >
              マッチしました
            </p>
            <h2 className="text-lg font-semibold tracking-[-0.01em] mb-2">
              {result.partnerName}さん
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "oklch(0.5 0.02 68)" }}>
              つながりました。よろしくお願いします！
            </p>

            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => navigate(`/chat/room/${result.roomId}`)}
                className="rounded-xl"
              >
                チャットを始める
              </Button>
              <Button variant="ghost" onClick={start} className="text-sm">
                もう一度探す
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
