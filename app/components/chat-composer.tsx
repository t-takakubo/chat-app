import { useState } from "react";
import { cn } from "~/lib/utils";

export function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
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
    <div className="px-4 pb-6 pt-3 flex-shrink-0 border-t border-white/[0.05]">
      <div
        className={cn(
          "flex items-end gap-3 max-w-2xl mx-auto rounded-2xl px-4 py-3 transition-all duration-200 bg-white/[0.04] border",
          input ? "border-primary/20" : "border-white/[0.07]",
        )}
      >
        <textarea
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          rows={1}
          className="flex-1 resize-none outline-none bg-transparent text-sm leading-relaxed placeholder:opacity-30 min-h-6 max-h-[120px]"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed",
            input.trim()
              ? "bg-linear-to-br from-chat-primary-from to-primary text-primary-foreground shadow-[0_2px_12px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
              : "bg-white/[0.06] text-chat-subtle",
          )}
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
      <p className="text-center text-[11px] mt-2 text-chat-ghost">
        Enter で送信 · Shift+Enter で改行
      </p>
    </div>
  );
}
