import { Link } from "react-router";

export function ChatBackLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 flex-shrink-0 bg-border text-chat-icon-muted"
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
  );
}
