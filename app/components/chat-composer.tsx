import { useState } from "react";

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
    <div
      className="px-4 pb-6 pt-3 flex-shrink-0"
      style={{ borderTop: "1px solid oklch(1 0 0 / 0.05)" }}
    >
      <div
        className="flex items-end gap-3 max-w-2xl mx-auto rounded-2xl px-4 py-3 transition-all duration-200"
        style={{
          background: "oklch(1 0 0 / 0.04)",
          border: `1px solid ${input ? "oklch(0.73 0.11 70 / 0.2)" : "oklch(1 0 0 / 0.07)"}`,
        }}
      >
        <textarea
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          rows={1}
          className="flex-1 resize-none outline-none bg-transparent text-sm leading-relaxed placeholder:opacity-30"
          style={{ minHeight: "24px", maxHeight: "120px" }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
          style={{
            background: input.trim()
              ? "linear-gradient(135deg, oklch(0.65 0.12 55), oklch(0.73 0.11 70))"
              : "oklch(1 0 0 / 0.06)",
            color: input.trim() ? "oklch(0.08 0 0)" : "oklch(0.3 0.008 60)",
            boxShadow: input.trim() ? "0 2px 12px oklch(0.73 0.11 70 / 0.3)" : "none",
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
      <p className="text-center text-[11px] mt-2" style={{ color: "oklch(0.28 0.005 60)" }}>
        Enter で送信 · Shift+Enter で改行
      </p>
    </div>
  );
}
