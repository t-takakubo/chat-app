import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function ChatBackLink({ to }: { to: string }) {
  return (
    <Button asChild variant="secondary" size="icon-lg" className="shrink-0 rounded-xl">
      <Link to={to} aria-label="戻る">
        <ArrowLeft />
      </Link>
    </Button>
  );
}
