import React, { useState, useEffect } from "react";

interface ChatProfileProps {
  otherUser: any;
  activeChatId: string;
  currentUser: any;
  revealStatus: { revealed: boolean };
  onSubmitGuess: (guess: string) => Promise<any>;
  onRefreshUser: () => void;
}

export const ChatProfile: React.FC<ChatProfileProps> = ({
  otherUser,
  activeChatId,
  currentUser,
  revealStatus,
  onSubmitGuess,
  onRefreshUser
}) => {
  const [guessInput, setGuessInput] = useState("");
  const [submittingGuess, setSubmittingGuess] = useState(false);
  const [showRevealSuccess, setShowRevealSuccess] = useState(false);

  // Local state for guesses to show immediately
  const [currentUserGuess, setCurrentUserGuess] = useState("");
  const [otherUserGuess, setOtherUserGuess] = useState("");

  const userProfileImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB3_iPJIQrt9-mW5A2ydCh3Yxc4LvljOrKyoltkptN-cVP6DbgD5zAnr4dEs77kaw5Z8IqCaskYDyn_nJ-7e1EQD6Mb6OXgIyrvFZGK4vcEV_4flgPXBJhCJYP4RWJgmdloYhBZdEczYdkPD91Lbxip2szT9kOihSNg5cv4LAw4gFIEslHasQHpUQwZvWBs8cSEUqlKhDBI0KtNhHEcGz1lzukeOzUbX5Zg0W62uoUsmn7g8g5pIk7t8OIfrlI8EmzJYYxJH5A9BR92";

  // Initialize guess state
  useEffect(() => {
    if (!currentUser || !activeChatId) return;

    // Check local storage or user object
    const myGuess = currentUser.guesses?.find((g: any) => g.chatId === activeChatId)?.guess || "";
    setCurrentUserGuess(myGuess);

    const theirGuess = otherUser.guesses?.find((g: any) => g.chatId === activeChatId)?.guess || "";
    setOtherUserGuess(theirGuess);
  }, [currentUser, otherUser, activeChatId]);

  const handleGuess = async () => {
    if (!guessInput.trim() || submittingGuess) return;
    setSubmittingGuess(true);

    try {
      const res = await onSubmitGuess(guessInput);
      setCurrentUserGuess(guessInput);
      setGuessInput("");
      onRefreshUser(); // Refresh to get updated state

      if (res?.revealed) {
        setShowRevealSuccess(true);
        setTimeout(() => setShowRevealSuccess(false), 3000);
      }
    } catch (e) {
      // ignore
    } finally {
      setSubmittingGuess(false);
    }
  };

  const isRevealed = revealStatus.revealed;

  return (
    <aside className="bg-white dark:bg-slate-900/50 border-l border-slate-200 dark:border-primary/20 flex flex-col h-full overflow-y-auto w-[400px]">
      <div className="p-6 border-b border-slate-200 dark:border-primary/20">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-3 overflow-hidden">
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
              className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600"
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
          <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white">
            {isRevealed ? otherUser.name : otherUser.username}
          </h2>
          <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
            {isRevealed ? "Identity revealed" : "Anonymous"}
          </p>
        </div>
      </div>

      {otherUser.interests && otherUser.interests.length > 0 && (
        <div className="p-6 border-b border-slate-200 dark:border-primary/20">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherUser.interests.map((interest: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isRevealed ? (
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            The Guessing Game
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Think you know who's behind the mask? Make a guess! If you're both
            right, you can unmask.
          </p>

          <div className="relative mb-4">
            <input
              className="w-full h-11 pl-11 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm"
              placeholder="Enter your guess..."
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !submittingGuess) handleGuess();
              }}
              disabled={submittingGuess}
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-[20px]">
              person_search
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {/* My Guess */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url('${userProfileImage}')` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Your Guess
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {currentUserGuess ? `"${currentUserGuess}"` : "Make your guess above"}
                </p>
              </div>
            </div>

            {/* Other Guess */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg text-gray-400 dark:text-gray-600">
                  person
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {otherUser.username}'s Guess
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {otherUserGuess ? `"${otherUserGuess}"` : "Hasn't guessed yet"}
                </p>
              </div>
            </div>
          </div>

          {showRevealSuccess && (
            <div className="mt-auto p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">
                check_circle
              </span>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">
                  Revealed!
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 flex-grow flex flex-col">
          <div className="flex items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <span className="material-symbols-outlined text-green-500 text-4xl mr-3">
              check_circle
            </span>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">
                Identities Revealed!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                You can now see each other's real names
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
