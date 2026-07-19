import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { chatTheme } from "~/lib/chat-theme";

export default function Chat() {
  return (
    <div className="flex flex-col h-screen items-center justify-center px-6" style={chatTheme}>
      <Button asChild size="lg" className="px-8 rounded-xl">
        <Link to="/chat/match">マッチングを開始</Link>
      </Button>
    </div>
  );
}
