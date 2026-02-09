import React from "react";
import type { Message } from "../../../hooks/useChat";

interface MessageBubbleProps {
  message: Message;
  isFromCurrentUser: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isFromCurrentUser,
  isFirstInGroup,
  isLastInGroup,
}) => {
  const getBubbleRadius = () => {
    let classes = "rounded-3xl";
    if (isFromCurrentUser) {
      if (!isFirstInGroup) classes += " rounded-tr-md";
      if (!isLastInGroup) classes += " rounded-br-md";
    } else {
      if (!isFirstInGroup) classes += " rounded-tl-md";
      if (!isLastInGroup) classes += " rounded-bl-md";
    }
    return classes;
  };

  const wrapperAlignment = isFromCurrentUser ? "justify-end" : "justify-start";
  const spacingClass = isFirstInGroup ? "mt-5" : "mt-1.5";

  return (
    <div className={`flex ${wrapperAlignment} ${spacingClass}`}>
      <div
        className={`max-w-[70%] px-4 py-2.5 ${getBubbleRadius()} ${isFromCurrentUser
            ? "bg-primary text-white"
            : "bg-slate-200 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
          } text-[15px] leading-relaxed`}
      >
        {message.text ?? ""}
      </div>
    </div>
  );
};
