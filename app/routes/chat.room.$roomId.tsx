import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { cn } from "~/lib/utils";
import { EndChatDialog } from "~/components/end-chat-dialog";
import { PeerLeftDialog } from "~/components/peer-left-dialog";
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
import { ChatComposer } from "~/components/chat-composer";
import { MatchedIntro } from "~/components/matched-intro";
import { TypingIndicator } from "~/components/typing-indicator";
import { useChatRoom } from "~/lib/use-chat-room";
import { SITE_NAME } from "~/lib/seo";
import type { Route } from "./+types/chat.room.$roomId";

// Rooms are private, one-off conversations — keep them out of search indexes.
export const meta: Route.MetaFunction = () => [
  { title: `チャットルーム | ${SITE_NAME}` },
  { name: "robots", content: "noindex, nofollow" },
];

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoomLive() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [peerLeftDialogOpen, setPeerLeftDialogOpen] = useState(false);

  const { messages, peerOnline, peerTyping, peerName, send, sendTyping, leave, userId } =
    useChatRoom(roomId ?? "", () => setPeerLeftDialogOpen(true));

  const handleEnd = () => {
    leave();
    void navigate("/");
  };

  const handlePeerLeftAcknowledge = () => {
    void navigate("/");
  };

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 py-3.5 backdrop-blur-lg">
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

        <EndChatDialog onConfirm={handleEnd} />
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
                    <MatchedIntro peerName={peerName} />
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

                {peerTyping && (
                  <MessageScrollerItem scrollAnchor className="-mt-2">
                    <TypingIndicator authorName={peerName ?? "?"} />
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      <ChatComposer onSend={send} onTypingChange={sendTyping} />

      <PeerLeftDialog
        open={peerLeftDialogOpen}
        peerName={peerName}
        onAcknowledge={handlePeerLeftAcknowledge}
      />
    </div>
  );
}
