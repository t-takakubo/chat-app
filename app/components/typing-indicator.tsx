import { Bubble, BubbleContent } from "~/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "~/components/ui/message";

export function TypingIndicator({ authorName }: { authorName: string }) {
  return (
    <Message align="start">
      <MessageAvatar>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chat-avatar text-xs font-semibold text-white shadow-sm">
          {authorName[0]}
        </div>
      </MessageAvatar>
      <MessageContent>
        <Bubble variant="secondary" align="start">
          <BubbleContent>
            <span className="flex items-center gap-1 py-0.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
            </span>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
