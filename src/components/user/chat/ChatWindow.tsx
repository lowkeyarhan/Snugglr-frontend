import React, { useRef, useEffect } from "react";
import type { Message } from "../../../hooks/useChat";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  activeChat: any;
  messages: Message[];
  otherUser: any;
  currentUser: any;
  messageInput: string;
  setMessageInput: (val: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
  revealStatus: { revealed: boolean };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChat,
  messages,
  otherUser,
  currentUser,
  messageInput,
  setMessageInput,
  onSendMessage,
  sendingMessage,
  revealStatus,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!activeChat || !otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Select a chat to start messaging</p>
      </div>
    );
  }

  const isRevealed = revealStatus.revealed;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-primary/10 dark:border-primary/20 bg-white dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            {otherUser.image &&
            otherUser.image.trim() !== "" &&
            otherUser.image !== "default-avatar.png" ? (
              <img
                src={otherUser.image}
                alt={otherUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextElement = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = "flex";
                }}
              />
            ) : null}
            <span
              className="material-symbols-outlined text-xl text-gray-400 dark:text-gray-600"
              style={{
                display:
                  otherUser.image &&
                  otherUser.image.trim() !== "" &&
                  otherUser.image !== "default-avatar.png"
                    ? "none"
                    : "flex",
              }}
            >
              person
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isRevealed ? otherUser.name : otherUser.username}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRevealed ? "Identity revealed" : "Anonymous"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {["call", "videocam", "more_horiz"].map((icon) => (
            <button
              key={icon}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 scrollbar-hide">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const prev = messages[index - 1];
            const next = messages[index + 1];

            const senderId =
              typeof message.sender === "string"
                ? message.sender
                : message.sender?._id;
            const prevSenderId = prev
              ? typeof prev.sender === "string"
                ? prev.sender
                : prev.sender?._id
              : undefined;
            const nextSenderId = next
              ? typeof next.sender === "string"
                ? next.sender
                : next.sender?._id
              : undefined;

            const isFromCurrentUser =
              (senderId || "").toString() === currentUser?.id?.toString();
            const isPrevSame =
              !!prev && prevSenderId?.toString() === senderId?.toString();
            const isNextSame =
              !!next && nextSenderId?.toString() === senderId?.toString();

            return (
              <MessageBubble
                key={message._id || index}
                message={message}
                isFromCurrentUser={isFromCurrentUser}
                isFirstInGroup={!isPrevSame}
                isLastInGroup={!isNextSame}
              />
            );
          })
        ) : (
          <div className="flex flex-col w-full text-center items-center justify-center h-full py-20">
            <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500 mb-4">
              chat_bubble_outline
            </span>
            <h3 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">
              No messages yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
              Start the conversation!
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-primary/10 dark:border-primary/20 shrink-0">
        <div className="relative">
          <input
            className="w-full h-12 pr-28 pl-12 rounded-full bg-slate-50 border-primary/10 dark:bg-slate-950 border focus:outline-none focus:border-primary/10 focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Type a message..."
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !sendingMessage) {
                onSendMessage();
              }
            }}
            disabled={sendingMessage}
          />
          <button className="absolute left-3 top-1/2 -translate-y-1/2 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">
              add_circle
            </span>
          </button>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {["mood", "mic", "image"].map((icon) => (
              <button
                key={icon}
                className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {icon}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
