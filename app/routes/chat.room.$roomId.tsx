import { useParams, Link } from "react-router";
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
import { chatTheme } from "~/lib/chat-theme";
import { useChatRoom } from "~/lib/use-chat-room";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoomLive() {
  const { roomId } = useParams();
  const { messages, peerOnline, peerName, send, userId } = useChatRoom(roomId ?? "");

  return (
    <div className="flex flex-col h-screen" style={chatTheme}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{
          borderBottom: "1px solid oklch(1 0 0 / 0.06)",
          background: "oklch(0.09 0.008 60 / 0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          to="/chat"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 flex-shrink-0"
          style={{ background: "oklch(1 0 0 / 0.06)", color: "oklch(0.65 0.015 68)" }}
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

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0"
          style={{ background: "oklch(0.6 0.13 25)" }}
        >
          {(peerName ?? "?")[0]}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm tracking-[-0.01em] leading-none">
            {peerName ?? "相手を待っています…"}
          </h2>
          <p
            className="text-xs mt-1 flex items-center gap-1.5"
            style={{ color: "oklch(0.38 0.008 60)" }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: peerOnline ? "oklch(0.7 0.16 145)" : "oklch(0.4 0.008 60)" }}
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
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow"
                                style={{ background: "oklch(0.6 0.13 25)" }}
                              >
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
