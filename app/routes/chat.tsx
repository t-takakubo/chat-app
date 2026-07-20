import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ThemeToggle } from "~/components/theme-toggle";
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

export default function Chat() {
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
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-end px-4 py-3.5">
        <ThemeToggle />
      </div>

      {/* Stage */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16">
        {status === "idle" && (
          <div className="flex w-full max-w-xs animate-rise-in flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/12 animate-gentle-pulse motion-reduce:animate-none">
              <PersonIcon size={26} strokeWidth={2} opacity={0.5} className="text-primary" />
            </div>
            <h1 className="mb-2 text-lg font-semibold tracking-[-0.01em]">誰かとおしゃべりする</h1>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              誰かとランダムに1対1でつながります。気軽に話しかけてみましょう。
            </p>

            <div className="mb-6 w-full space-y-2 text-left">
              <Label htmlFor="display-name">表示名</Label>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={20}
                placeholder="ニックネーム"
                className="h-10 rounded-xl px-3.5"
              />
            </div>

            <Button onClick={start} disabled={!name.trim()} className="w-full rounded-xl px-8">
              はじめる
            </Button>
          </div>
        )}

        {status === "searching" && (
          <div className="flex animate-rise-in flex-col items-center">
            <div className="relative h-64 w-64 shrink-0">
              {/* you, at the center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {[false, true].map((delayed, i) => (
                    <span
                      key={i}
                      className={cn(
                        "absolute h-16 w-16 rounded-full border border-primary/50 animate-pulse-ring motion-reduce:animate-none",
                        delayed && "[animation-delay:1.2s]",
                      )}
                    />
                  ))}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_40%,transparent)]">
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
                  <div className="h-2.5 w-2.5 translate-x-(--chat-dot-radius) rounded-full">
                    <div className="h-full w-full rounded-full bg-primary/35" />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 mb-1 text-sm text-muted-foreground">話せる相手を待っています…</p>
            <p className="mb-6 font-mono text-xs tabular-nums text-muted-foreground/70">
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
