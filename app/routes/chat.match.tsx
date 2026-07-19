import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { ChatBackLink } from "~/components/chat-back-link";
import { cn } from "~/lib/utils";
import { useMatchQueue } from "~/lib/use-match-queue";
import { getIdentity, setDisplayName } from "~/lib/session";

const ambientDots = [
  { radius: 92, duration: 7 },
  { radius: 112, duration: 9.5 },
  { radius: 104, duration: 6 },
].map((dot) => ({
  ...dot,
  style: {
    "--chat-orbit-duration": `${dot.duration}s`,
    "--chat-dot-radius": `${dot.radius}px`,
  } as CSSProperties,
}));

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PersonIcon({
  size,
  strokeWidth,
  opacity,
  className,
}: {
  size: number;
  strokeWidth: number;
  opacity: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" opacity={opacity} />
    </svg>
  );
}

export default function ChatMatch() {
  const navigate = useNavigate();
  const { status, elapsed, result, start, cancel } = useMatchQueue();
  const [name, setName] = useState(() => getIdentity().name);

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) setDisplayName(value.trim());
  };

  useEffect(() => {
    if (status === "matched" && result) {
      void navigate(`/chat/room/${result.roomId}`);
    }
  }, [status, result, navigate]);

  return (
    <div className="chat-theme bg-background text-foreground flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0 border-b border-border">
        <ChatBackLink to="/chat" />
        <h1 className="font-semibold text-sm tracking-[-0.01em]">話す相手を探す</h1>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {status === "idle" && (
          <div className="flex flex-col items-center text-center max-w-xs w-full animate-rise-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-primary/12 animate-gentle-pulse motion-reduce:animate-none">
              <PersonIcon size={26} strokeWidth={2} opacity={0.5} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-[-0.01em] mb-2">誰かとおしゃべりする</h2>
            <p className="text-sm leading-relaxed mb-6 text-chat-secondary-text">
              コミュニティの誰かとランダムに1対1でつながります。気軽に話しかけてみましょう。
            </p>

            <label className="w-full text-left mb-6">
              <span className="text-xs font-medium uppercase block mb-1.5 text-muted-foreground tracking-[0.06em]">
                表示名
              </span>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={20}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors bg-white/[0.05] border border-input text-foreground"
              />
            </label>

            <Button onClick={start} disabled={!name.trim()} className="px-8 rounded-xl w-full">
              はじめる
            </Button>
          </div>
        )}

        {status === "searching" && (
          <div className="flex flex-col items-center animate-rise-in">
            <div className="relative w-64 h-64 flex-shrink-0">
              {/* you, at the center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {[false, true].map((delayed, i) => (
                    <span
                      key={i}
                      className={cn(
                        "absolute w-16 h-16 rounded-full border border-primary/50 animate-pulse-ring motion-reduce:animate-none",
                        delayed && "[animation-delay:1.2s]",
                      )}
                    />
                  ))}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_40%,transparent)]">
                    <PersonIcon
                      size={16}
                      strokeWidth={2.5}
                      opacity={0.6}
                      className="text-primary-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* ambient decoration, not tied to any specific candidate */}
              {ambientDots.map((dot, i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center animate-orbit-spin motion-reduce:animate-none"
                  style={dot.style}
                >
                  <div className="w-2.5 h-2.5 rounded-full translate-x-[var(--chat-dot-radius)]">
                    <div className="w-full h-full rounded-full bg-primary/35" />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm mt-4 mb-1 text-chat-tertiary">話せる相手を待っています…</p>
            <p className="text-xs tabular-nums mb-6 text-chat-faint font-mono">
              {formatElapsed(elapsed)}
            </p>
            <Button variant="ghost" onClick={cancel} className="text-sm">
              キャンセル
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
