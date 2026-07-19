import { useParams } from "react-router";
import { cn } from "~/lib/utils";
import { ChatBackLink } from "~/components/chat-back-link";
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
    <div className="chat-theme bg-background text-foreground flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0 border-b border-border bg-background/90 backdrop-blur-lg">
        <ChatBackLink to="/chat" />

        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0 bg-chat-avatar">
          {(peerName ?? "?")[0]}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm tracking-[-0.01em] leading-none">
            {peerName ?? "相手を待っています…"}
          </h2>
          <p className="text-xs mt-1 flex items-center gap-1.5 text-chat-faint">
            <span
              className={cn(
                "inline-block w-1.5 h-1.5 rounded-full",
                peerOnline ? "bg-chat-status-online" : "bg-chat-faint",
              )}
            />
            {peerOnline ? "オンライン" : "オフライン"}
          </p>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 min-h-0">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="py-6 gap-4 max-w-2xl mx-auto px-4">
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
                          <MessageAvatar>
                            {isGroupStart ? (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow bg-chat-avatar">
                                {msg.authorName[0]}
                              </div>
                            ) : (
                              <div className="w-8 h-8" />
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
