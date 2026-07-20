import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

// 入力を止めてからこの時間が経ったら「入力中」を解除する
const TYPING_IDLE_MS = 2000;

export function ChatComposer({
  onSend,
  onTypingChange,
}: {
  onSend: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const typingTimeoutRef = useRef<number | null>(null);

  const stopTyping = () => {
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTypingChange?.(false);
  };

  useEffect(() => stopTyping, []);

  const handleChange = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    onTypingChange?.(true);
    if (typingTimeoutRef.current !== null) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    stopTyping();
    onSend(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME変換確定のEnterを送信として扱わないよう isComposing をチェックする。
    // Safari は compositionend 後も isComposing が残る場合があるため keyCode 229 も見る。
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-background px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border-2 border-input bg-card px-3 py-2 shadow-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <Textarea
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力…"
          rows={1}
          aria-label="メッセージ"
          className="max-h-30 min-h-6 flex-1 resize-none overflow-y-auto rounded-none border-0 bg-transparent p-1.5 text-foreground leading-relaxed placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
        />
        <Button
          size="icon-lg"
          onClick={send}
          disabled={!input.trim()}
          aria-label="送信"
          className="rounded-xl bg-linear-to-br from-chat-primary-from to-primary shadow-[0_2px_12px_color-mix(in_oklch,var(--primary)_30%,transparent)] hover:opacity-90 disabled:shadow-none"
        >
          <SendHorizontal />
        </Button>
      </div>
      <p className="mt-2 hidden text-center text-[11px] text-muted-foreground sm:block">
        Enter で送信 · Shift+Enter で改行
      </p>
    </div>
  );
}
