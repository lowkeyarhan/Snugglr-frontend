import { useState, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useChat } from "../hooks/useChat";
import { ChatSidebar } from "../components/user/chat/ChatSidebar";
import { ChatWindow } from "../components/user/chat/ChatWindow";
import { ChatProfile } from "../components/user/chat/ChatProfile";

export default function Chat() {
  const {
    chats,
    messages,
    activeChatId,
    activeChat,
    setActiveChatId,
    loading,
    currentUser,
    revealStatus,
    sendMessage,
    sendingMessage,
    submitGuess,
    refreshUser
  } = useChat();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const otherUser = useMemo(() => {
    if (!activeChat || !currentUser) return null;
    return activeChat.users.find(
      (user: any) => user._id?.toString() !== currentUser.id?.toString()
    );
  }, [activeChat, currentUser]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed />

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onChatSelect={setActiveChatId}
        currentUser={currentUser}
        revealStatus={revealStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
      />

      <main className="flex-1 grid grid-cols-[1fr,400px]">
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          otherUser={otherUser}
          currentUser={currentUser}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
          revealStatus={revealStatus}
        />

        {activeChat && otherUser && (
          <ChatProfile
            otherUser={otherUser}
            activeChatId={activeChatId}
            currentUser={currentUser}
            revealStatus={revealStatus}
            onSubmitGuess={submitGuess}
            onRefreshUser={refreshUser}
          />
        )}
      </main>
    </div>
  );
}
