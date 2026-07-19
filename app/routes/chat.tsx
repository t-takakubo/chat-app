import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function Chat() {
  return (
    <div className="chat-theme bg-background text-foreground flex flex-col h-screen items-center justify-center px-6">
      <Button asChild size="lg" className="px-8 rounded-xl">
        <Link to="/chat/match">マッチングを開始</Link>
      </Button>
    </div>
  );
}
