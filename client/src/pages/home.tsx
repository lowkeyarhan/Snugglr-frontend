import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import {
  getPotentialMatches,
  swipeUser,
  getConfessions,
  likeConfession,
} from "../API/api";

// Dummy Stories (no functionality)
const dummyStories = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    label: "Sarah",
    hasNotification: true,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
    label: "New match!",
    hasNotification: true,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    label: "Confession",
    hasNotification: false,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    label: "Likes",
    hasNotification: false,
  },
];

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swiping, setSwiping] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Confessions state
  const [confessions, setConfessions] = useState<any[]>([]);
  const [confessionsLoading, setConfessionsLoading] = useState(true);
  const [confessionsError, setConfessionsError] = useState<string | null>(null);

  const toggleConfessionLike = async (confessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setConfessionsError("Please login first");
        return;
      }

      const response = await likeConfession(confessionId, token);

      if (response.success) {
        // Update the confession with new like count and like state
        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === confessionId
              ? {
                  ...confession,
                  likesCount: response.data.likesCount,
                  hasLiked: response.data.hasLiked,
                }
              : confession
          )
        );
      }
    } catch (err: any) {
      console.error("Error liking confession:", err);
      setConfessionsError(err.message || "Failed to like confession");
    }
  };

  // Fetch potential matches and confessions on component mount
  useEffect(() => {
    fetchMatches();
    fetchConfessions();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      const result = await getPotentialMatches(token);

      if (result.data?.users && result.data.users.length > 0) {
        setMatches(result.data.users);
      } else {
        setMatches([]);
        setError("No more matches available at the moment!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfessions = async () => {
    try {
      setConfessionsLoading(true);
      setConfessionsError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setConfessionsError("Please login first");
        return;
      }

      const result = await getConfessions(token, 1, 20);

      if (result.success && result.data?.confessions) {
        setConfessions(result.data.confessions);
      } else {
        setConfessions([]);
        setConfessionsError("No confessions available at the moment!");
      }
    } catch (err: any) {
      setConfessionsError(err.message || "Failed to fetch confessions");
    } finally {
      setConfessionsLoading(false);
    }
  };

  const handleLike = async (userId: string) => {
    if (swiping) return;

    try {
      setSwiping(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      await swipeUser(userId, "like", token);

      // Remove the swiped user from the list
      setMatches((prev) => prev.filter((match) => match._id !== userId));

      // Reset index if needed
      if (currentMatchIndex >= matches.length - 1) {
        setCurrentMatchIndex(Math.max(0, matches.length - 2));
      }
    } catch (err: any) {
      setError(err.message || "Failed to swipe");
    } finally {
      setSwiping(false);
    }
  };

  const handlePass = async (userId: string) => {
    if (swiping) return;

    try {
      setSwiping(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      await swipeUser(userId, "pass", token);

      // Remove the swiped user from the list
      setMatches((prev) => prev.filter((match) => match._id !== userId));

      // Reset index if needed
      if (currentMatchIndex >= matches.length - 1) {
        setCurrentMatchIndex(Math.max(0, matches.length - 2));
      }
    } catch (err: any) {
      setError(err.message || "Failed to swipe");
    } finally {
      setSwiping(false);
    }
  };

  const scrollToMatch = (index: number) => {
    setCurrentMatchIndex(index);
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const target = container.children[currentMatchIndex] as
      | HTMLElement
      | undefined;
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentMatchIndex]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen bg-background-light dark:bg-background-dark">
          <div className="px-6 py-8 w-full">
            <div className="flex flex-col gap-8">
              {/* Stories Section - DUMMY (No Functionality) */}
              <div className="flex w-full overflow-x-auto scrollbar-hide">
                <div className="flex flex-row items-start justify-start gap-5 py-4">
                  {dummyStories.map((story) => (
                    <div
                      key={story.id}
                      className="flex flex-col items-center gap-2 w-20 text-center cursor-not-allowed opacity-70"
                      title="Coming soon!"
                    >
                      <div
                        className={`w-16 h-16 rounded-full bg-center bg-no-repeat bg-cover ${
                          story.hasNotification
                            ? "ring-2 ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark ring-pink-500"
                            : ""
                        }`}
                        style={{ backgroundImage: `url(${story.image})` }}
                      />
                      <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                        {story.label}
                      </p>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-2 w-20 text-center cursor-not-allowed opacity-70">
                    <div className="w-16 h-16 rounded-full bg-center bg-no-repeat bg-cover flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                      <span className="material-symbols-outlined text-3xl text-slate-500">
                        add
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                      New Post
                    </p>
                  </div>
                </div>
              </div>

              {/* No Potential Matches State */}
              {error && (
                <div className="flex flex-col items-center justify-center py-20">
                  <span className="material-symbols-outlined text-6xl text-muted-light dark:text-muted-dark mb-4">
                    sentiment_content
                  </span>
                  <h3 className="text-2xl font-bold mb-2">We're sorry!</h3>
                  <p className="text-muted-light dark:text-muted-dark text-center max-w-md">
                    {error}
                  </p>
                  <button
                    onClick={fetchMatches}
                    className="mt-6 px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30 font-boldrounded-lg font-bold  transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg
                    className="animate-spin h-12 w-12 text-pink-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="mt-4 text-lg font-medium text-muted-light dark:text-muted-dark">
                    Finding your matches...
                  </p>
                </div>
              )}

              {/* No Matches State */}
              {!loading && matches.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20">
                  <span className="material-symbols-outlined text-6xl text-muted-light dark:text-muted-dark mb-4">
                    sentiment_content
                  </span>
                  <h3 className="text-2xl font-bold mb-2">No more matches!</h3>
                  <p className="text-muted-light dark:text-muted-dark text-center max-w-md">
                    You've seen everyone in your community. Check back later for
                    new people!
                  </p>
                  <button
                    onClick={fetchMatches}
                    className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              )}

              {/* Match Cards Carousel */}
              {!loading && matches.length > 0 && (
                <div className="relative w-full">
                  {/* Scrollable Match Cards Container */}
                  <div className="relative overflow-hidden">
                    <div
                      ref={carouselRef}
                      className="flex gap-6 overflow-x-auto snap-x snap-mandatory pr-4 pb-4 scrollbar-hide"
                    >
                      {matches.map((match, index) => {
                        const isFocused = index === currentMatchIndex;
                        return (
                          <div
                            key={match._id}
                            className={`flex-shrink-0 w-full max-w-xl snap-center transition-all duration-300 ${
                              isFocused
                                ? "scale-100 opacity-100"
                                : "scale-90 opacity-40 pointer-events-none"
                            }`}
                            onClick={() => !isFocused && scrollToMatch(index)}
                          >
                            <div className="flex flex-col items-center justify-center gap-6 bg-white dark:bg-card-dark rounded-lg py-6 px-2 shadow-lg">
                              {/* Profile Picture (Blurred) */}
                              <div className="w-full max-w-40 aspect-square flex items-center justify-center">
                                <div
                                  className="w-full h-full rounded-full overflow-hidden shadow-2xl relative bg-gray-200 dark:bg-gray-800"
                                  aria-label="Profile picture (blurred for privacy)"
                                >
                                  {match.image &&
                                  match.image !== "default-avatar.png" ? (
                                    <>
                                      <img
                                        src={`http://localhost:8081/uploads/avatars/${match.image}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full"
                                        style={{
                                          maskImage:
                                            "radial-gradient(circle at center, white 85%, transparent 100%)",
                                          filter: "blur(8px)",
                                        }}
                                      />
                                      <div className="absolute inset-0 rounded-full ring ring-white/80 dark:ring-slate-800 pointer-events-none" />
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600">
                                        person
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* User Info */}
                              <div className="text-center ">
                                <h3 className="text-2xl font-bold">
                                  {match.username || "Anonymous"}
                                </h3>
                                {match.age && (
                                  <p className="text-muted-light dark:text-muted-dark">
                                    {match.age} years old
                                  </p>
                                )}

                                {/* Interests */}
                                {match.interests &&
                                  match.interests.length > 0 && (
                                    <div className="flex gap-2 justify-center mt-3 flex-wrap">
                                      {match.interests
                                        .slice(0, 5)
                                        .map(
                                          (interest: string, idx: number) => (
                                            <span
                                              key={idx}
                                              className="bg-primary/10 dark:bg-primary/20 text-primary text-sm font-semibold px-3 py-1 rounded-full"
                                            >
                                              {interest}
                                            </span>
                                          )
                                        )}
                                    </div>
                                  )}

                                {/* Taste Quick Facts */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-left max-w-md mx-auto">
                                  {/* Music */}
                                  {match.musicPreferences && (
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-base">
                                          music_note
                                        </span>
                                        Music
                                      </div>
                                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                        {match.musicPreferences}
                                      </p>
                                    </div>
                                  )}

                                  {/* Shows */}
                                  {match.favoriteShows && (
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-base">
                                          movie
                                        </span>
                                        Shows
                                      </div>
                                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                        {match.favoriteShows}
                                      </p>
                                    </div>
                                  )}

                                  {/* Meme Vibe */}
                                  {match.memeVibe && (
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-base">
                                          mood
                                        </span>
                                        Vibe
                                      </div>
                                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 italic break-words">
                                        "{match.memeVibe}"
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Hint */}
                                {match.hint && (
                                  <div className="mt-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                      "{match.hint}"
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-4 w-full max-w-md">
                                <button
                                  onClick={() => handlePass(match._id)}
                                  disabled={!isFocused || swiping}
                                  className="flex-1 h-16 rounded-lg bg-slate-200/70 dark:bg-slate-800/70 font-bold text-slate-600 dark:text-slate-300 text-lg flex items-center justify-center gap-2 hover:bg-slate-300/70 dark:hover:bg-slate-700/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="material-symbols-outlined">
                                    close
                                  </span>
                                  Meh
                                </button>
                                <button
                                  onClick={() => handleLike(match._id)}
                                  disabled={!isFocused || swiping}
                                  className="flex-1 h-16 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="material-symbols-outlined">
                                    favorite
                                  </span>
                                  Might Work
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {currentMatchIndex > 0 && (
                    <button
                      onClick={() => scrollToMatch(currentMatchIndex - 1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Previous match"
                    >
                      <span className="material-symbols-outlined text-2xl">
                        chevron_left
                      </span>
                    </button>
                  )}
                  {currentMatchIndex < matches.length - 1 && (
                    <button
                      onClick={() => scrollToMatch(currentMatchIndex + 1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Next match"
                    >
                      <span className="material-symbols-outlined text-2xl">
                        chevron_right
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Confessions & Likes Section */}
              <div className="flex flex-col gap-6 pt-8">
                <h2 className="text-2xl font-bold tracking-tight">
                  Confessions & Likes
                </h2>

                {/* No Potential Matches State */}
                {confessionsError && !confessionsLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <span className="material-symbols-outlined text-6xl text-muted-light dark:text-muted-dark mb-4">
                      sentiment_content
                    </span>
                    <h3 className="text-2xl font-bold mb-2">
                      No confessions yet!
                    </h3>
                    <p className="text-muted-light dark:text-muted-dark text-center max-w-md">
                      {confessionsError}
                    </p>
                    <button
                      onClick={fetchConfessions}
                      className="mt-6 px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30 font-boldrounded-lg font-bold  transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                )}

                {/* Confessions Loading State */}
                {confessionsLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <svg
                      className="animate-spin h-12 w-12 text-pink-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-4 text-lg font-medium text-muted-light dark:text-muted-dark">
                      Loading confessions...
                    </p>
                  </div>
                )}

                {/* No Confessions State */}
                {!confessionsLoading &&
                  confessions.length === 0 &&
                  !confessionsError && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <span className="material-symbols-outlined text-6xl text-muted-light dark:text-muted-dark mb-4">
                        chat_bubble_outline
                      </span>
                      <h3 className="text-2xl font-bold mb-2">
                        No confessions found!
                      </h3>
                      <p className="text-muted-light dark:text-muted-dark text-center max-w-md">
                        Be the first to share a confession in your community.
                      </p>
                      <button
                        onClick={fetchConfessions}
                        className="mt-6 px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30 font-boldrounded-lg font-bold  transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                  )}

                {/* Confessions Grid */}
                {!confessionsLoading && confessions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {confessions.map((confession) => {
                      // Format the time ago
                      const timeAgo = confession.createdAt
                        ? new Date(confession.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Recently";

                      return (
                        <div
                          key={confession._id}
                          className="flex flex-col rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-900/50 hover:shadow-xl transition-shadow h-full"
                        >
                          <div className="p-4 flex flex-col w-full gap-2 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-black text-lg">
                                  person
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold">
                                  {confession.username || "Anonymous"}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {timeAgo}
                                </p>
                              </div>
                            </div>
                            <p className="mt-2 flex-1">
                              {confession.confession}
                            </p>
                          </div>
                          <div className="px-4 pb-4">
                            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                              <button
                                onClick={() =>
                                  toggleConfessionLike(confession._id)
                                }
                                className={`flex items-center gap-1.5 transition-colors ${
                                  confession.hasLiked
                                    ? "text-pink-500 hover:text-pink-600"
                                    : "hover:text-pink-500"
                                }`}
                              >
                                <span className="material-symbols-outlined text-xl">
                                  {confession.hasLiked
                                    ? "favorite"
                                    : "favorite_border"}
                                </span>
                                <span className="text-sm font-medium">
                                  {confession.likesCount || 0}
                                </span>
                              </button>
                              <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">
                                  mode_comment
                                </span>
                                <span className="text-sm font-medium">
                                  {confession.commentsCount || 0}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Info Section */}
              {!loading && matches.length > 0 && (
                <div className="mt-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">How it works</h3>
                  <ul className="space-y-2 text-sm text-muted-light dark:text-muted-dark">
                    <li className="flex items-start gap-2">
                      <span>
                        Swipe right if you want to explore, meh if you didn't
                        like them, might work if you do!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>If they like you too, it's a match!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>
                        Identities remain anonymous until you both choose to
                        reveal
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
