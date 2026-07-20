import { useParams } from "react-router";
import { cn } from "~/lib/utils";
import { ChatBackLink } from "~/components/chat-back-link";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "~/components/ui/message-scroller";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "~/components/ui/message";
import { Bubble, BubbleContent } from "~/components/ui/bubble";
import { Marker, MarkerContent } from "~/components/ui/marker";
import { ChatComposer } from "~/components/chat-composer";
import { useChatRoom } from "~/lib/use-chat-room";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoomLive() {
  const { roomId } = useParams();
  const { messages, peerOnline, peerName, send, userId } = useChatRoom(roomId ?? "");

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 py-3.5 backdrop-blur-lg">
        <ChatBackLink to="/" />

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chat-avatar text-sm font-bold text-white shadow-sm">
          {(peerName ?? "?")[0]}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm tracking-[-0.01em] leading-none">
            {peerName ?? "相手を待っています…"}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                peerOnline ? "bg-chat-status-online" : "bg-muted-foreground/40",
              )}
            />
            {peerOnline ? "オンライン" : "オフライン"}
          </p>
        </div>

        <ThemeToggle />
      </div>

      {/* Message area */}
      <div className="min-h-0 flex-1">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto max-w-2xl gap-4 px-4 py-6">
                {messages.length === 0 && (
                  <MessageScrollerItem>
                    <Marker variant="separator">
                      <MarkerContent>マッチしました</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}

                {messages.map((msg, i) => {
                  const prev = messages[i - 1];
                  const isMe = msg.authorId === userId;
                  const isGroupStart = !prev || prev.authorId !== msg.authorId;
                  const isLast = i === messages.length - 1;

                  return (
                    <MessageScrollerItem
                      key={msg.id}
                      scrollAnchor={isLast}
                      className={isGroupStart ? "" : "-mt-2"}
                    >
                      <Message align={isMe ? "end" : "start"}>
                        {!isMe && (
                          <MessageAvatar className={isGroupStart ? "" : "bg-transparent"}>
                            {isGroupStart ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chat-avatar text-xs font-semibold text-white shadow-sm">
                                {msg.authorName[0]}
                              </div>
                            ) : (
                              <div className="h-8 w-8" />
                            )}
                          </MessageAvatar>
                        )}
                        <MessageContent>
                          {!isMe && isGroupStart && <MessageHeader>{msg.authorName}</MessageHeader>}
                          <Bubble
                            variant={isMe ? "default" : "secondary"}
                            align={isMe ? "end" : "start"}
                          >
                            <BubbleContent>{msg.body}</BubbleContent>
                          </Bubble>
                          {isLast || messages[i + 1]?.authorId !== msg.authorId ? (
                            <MessageFooter>{formatTime(msg.createdAt)}</MessageFooter>
                          ) : null}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  );
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <ChatComposer onSend={send} />
    </div>
  );
}
