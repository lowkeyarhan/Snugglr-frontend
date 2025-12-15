import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import {
  getConfessions,
  likeConfession,
  commentOnConfession,
  likeComment,
  replyToComment,
} from "../userAPI/confessions";

const getPotentialMatches = async (_token: string) => {
  return { data: { users: [] as any[] } };
};

const swipeUser = async (
  _userId: string,
  _action: "like" | "pass",
  _token: string
) => {
  return { success: true };
};

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Confessions state
  const [confessions, setConfessions] = useState<any[]>([]);
  const [confessionsLoading, setConfessionsLoading] = useState(true);
  const [confessionsError, setConfessionsError] = useState<string | null>(null);
  const hasFetchedMatches = useRef(false);
  const hasFetchedConfessions = useRef(false);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [activeConfession, setActiveConfession] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  const toggleConfessionLike = async (confessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setConfessionsError("Please login first");
        return;
      }

      const response = await likeConfession(confessionId, token);

      if (response.success) {
        setConfessions((prev) =>
          prev.map((confession) => {
            if (confession._id !== confessionId) return confession;
            const prevCount = Number(confession.likesCount || 0);
            const nextCount = response.liked
              ? prevCount + 1
              : Math.max(0, prevCount - 1);
            return {
              ...confession,
              likesCount: nextCount,
              hasLiked: response.liked,
            };
          })
        );
      }
    } catch (err: any) {
      console.error("Error liking confession:", err);
      setConfessionsError(err.message || "Failed to like confession");
    }
  };

  const openCommentModal = (confession: any) => {
    setActiveConfession(confession);
    setNewComment("");
    setCommentError(null);
    setCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setActiveConfession(null);
    setNewComment("");
    setCommentError(null);
    setReplyingTo(null);
    setReplyText("");
    setExpandedComments(new Set());
  };

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeConfession) return;
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      setCommentError("Please enter a comment before posting.");
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setCommentError("Please login first.");
        return;
      }

      const response = await commentOnConfession(
        activeConfession._id,
        trimmedComment,
        token
      );

      if (response.success) {
        const newCommentObj = {
          ...response.data,
          hasLiked: false,
          likesCount: response.data?.likesCount ?? 0,
          replies: [],
        };
        const processedComments = processCommentsWithLikeState(
          [...(activeConfession.comments || []), newCommentObj],
          currentUserId
        );
        const updatedCount = processedComments.length;

        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === activeConfession._id
              ? {
                  ...confession,
                  comments: processedComments,
                  commentsCount: updatedCount,
                }
              : confession
          )
        );

        setActiveConfession((prev: any) =>
          prev
            ? {
                ...prev,
                comments: processedComments,
                commentsCount: updatedCount,
              }
            : prev
        );

        setNewComment("");
      }
    } catch (err: any) {
      console.error("Error adding comment:", err);
      setCommentError(err.message || "Failed to add comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!activeConfession) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await likeComment(commentId, token);

      if (response.success) {
        // Update the active confession
        setActiveConfession((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.map((comment: any) =>
              comment._id === commentId
                ? {
                    ...comment,
                    likesCount: response.liked
                      ? Number(comment.likesCount || 0) + 1
                      : Math.max(0, Number(comment.likesCount || 0) - 1),
                    hasLiked: response.liked,
                  }
                : comment
            ),
          };
        });

        // Update confessions list
        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === activeConfession._id
              ? {
                  ...confession,
                  comments: confession.comments.map((comment: any) =>
                    comment._id === commentId
                      ? {
                          ...comment,
                          likesCount: response.liked
                            ? Number(comment.likesCount || 0) + 1
                            : Math.max(0, Number(comment.likesCount || 0) - 1),
                          hasLiked: response.liked,
                        }
                      : comment
                  ),
                }
              : confession
          )
        );
      }
    } catch (err: any) {
      console.error("Error liking comment:", err);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!activeConfession || !replyText.trim()) return;

    try {
      setReplySubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await replyToComment(
        activeConfession._id,
        commentId,
        replyText.trim(),
        token
      );

      if (response.success) {
        const newReply = {
          ...response.data,
          hasLiked: false,
          likesCount: response.data?.likesCount ?? 0,
        };
        const processedReplies = [newReply].map((reply: any) => ({
          ...reply,
          hasLiked: computeHasLiked(reply.likedBy, currentUserId),
        }));

        setActiveConfession((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.map((comment: any) =>
              comment._id === commentId
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), ...processedReplies],
                  }
                : comment
            ),
          };
        });

        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === activeConfession._id
              ? {
                  ...confession,
                  comments: confession.comments.map((comment: any) =>
                    comment._id === commentId
                      ? {
                          ...comment,
                          replies: [
                            ...(comment.replies || []),
                            ...processedReplies,
                          ],
                        }
                      : comment
                  ),
                }
              : confession
          )
        );

        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err: any) {
      console.error("Error adding reply:", err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const toggleReplyLike = async (commentId: string, replyId: string) => {
    if (!activeConfession) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Replies are comments too; backend likes by commentId
      const response = await likeComment(replyId, token);

      if (response.success) {
        // Update the active confession
        setActiveConfession((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.map((comment: any) =>
              comment._id === commentId
                ? {
                    ...comment,
                    replies: comment.replies.map((reply: any) =>
                      reply._id === replyId
                        ? {
                            ...reply,
                            likesCount: response.liked
                              ? Number(reply.likesCount || 0) + 1
                              : Math.max(0, Number(reply.likesCount || 0) - 1),
                            hasLiked: response.liked,
                          }
                        : reply
                    ),
                  }
                : comment
            ),
          };
        });

        // Update confessions list
        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === activeConfession._id
              ? {
                  ...confession,
                  comments: confession.comments.map((comment: any) =>
                    comment._id === commentId
                      ? {
                          ...comment,
                          replies: comment.replies.map((reply: any) =>
                            reply._id === replyId
                              ? {
                                  ...reply,
                                  likesCount: response.liked
                                    ? Number(reply.likesCount || 0) + 1
                                    : Math.max(
                                        0,
                                        Number(reply.likesCount || 0) - 1
                                      ),
                                  hasLiked: response.liked,
                                }
                              : reply
                          ),
                        }
                      : comment
                  ),
                }
              : confession
          )
        );
      }
    } catch (err: any) {
      console.error("Error liking reply:", err);
    }
  };

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return "Just now";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const computeHasLiked = (
    likedBy: any[] | undefined,
    userId: string | null
  ) => {
    if (!likedBy || !userId) return false;
    return likedBy.some((id) => id.toString() === userId);
  };

  const processCommentsWithLikeState = (
    comments: any[],
    userId: string | null
  ) => {
    if (!userId) return comments;

    return comments.map((comment) => ({
      ...comment,
      hasLiked: computeHasLiked(comment.likedBy, userId),
      replies: comment.replies
        ? comment.replies.map((reply: any) => ({
            ...reply,
            hasLiked: computeHasLiked(reply.likedBy, userId),
          }))
        : [],
    }));
  };

  const toggleExpandComment = (commentId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderTextWithMentions = (text: string) => {
    // Split text by @mentions
    const parts = text.split(/(@\w+)/g);

    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith("@")) {
            return (
              <span key={index} className="text-[#ee2b8c] font-semibold">
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  useEffect(() => {
    if (!hasFetchedMatches.current) {
      hasFetchedMatches.current = true;
      fetchMatches();
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedConfessions.current) {
      hasFetchedConfessions.current = true;
      fetchConfessions();
    }
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

      // Get current user ID from token or user storage
      let userId: string | null = null;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Use 'id' from backend payload; fall back to '_id' for safety
          userId = user.id || user._id || null;
          setCurrentUserId(userId);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      const result = await getConfessions(token, 1, 20);

      if (result.success && result.data?.confessions) {
        // Process confessions to add hasLiked state for comments and replies
        const processedConfessions = result.data.confessions.map(
          (confession: any) => ({
            ...confession,
            comments: processCommentsWithLikeState(
              confession.comments || [],
              userId
            ),
          })
        );
        setConfessions(processedConfessions);
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
                              <button
                                onClick={() => openCommentModal(confession)}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                              >
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

              {isCommentModalOpen && activeConfession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/60 dark:bg-black/80"
                    onClick={closeCommentModal}
                  ></div>

                  <div className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-[#f8f6f7] dark:bg-[#221019] shadow-2xl">
                    <div className="flex items-center justify-between gap-2 border-b border-black/10 px-5 py-3 dark:border-white/10">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Confession by {activeConfession.username}
                      </h2>
                      <button
                        onClick={closeCommentModal}
                        className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                      >
                        <span className="material-symbols-outlined text-2xl">
                          close
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col overflow-y-auto">
                      <div className="border-b border-black/10 p-6 dark:border-white/10">
                        <p className="mb-4 text-lg leading-relaxed text-slate-800 dark:text-slate-200">
                          {activeConfession.confession}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatTimestamp(activeConfession.createdAt)}
                          </p>
                          <div className="flex items-center gap-2 rounded-full bg-[#fde1ef] px-4 py-2 text-[#ee2b8c]">
                            <span className="material-symbols-outlined text-[20px] font-bold text-[#ee2b8c]">
                              favorite
                            </span>
                            <p className="text-sm font-bold text-[#ee2b8c]">
                              {activeConfession.likesCount || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col px-6 py-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            Comments
                          </h3>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {activeConfession.commentsCount || 0} total
                          </span>
                        </div>

                        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                          {(activeConfession.comments || []).length === 0 && (
                            <div className="flex flex-1 items-center justify-center py-10">
                              <p className="text-slate-500 dark:text-slate-400">
                                Be the first to comment!
                              </p>
                            </div>
                          )}

                          {(activeConfession.comments || []).map(
                            (comment: any) => (
                              <div
                                key={comment._id || comment.createdAt}
                                className="flex flex-col gap-2"
                              >
                                {/* Main Comment */}
                                <div className="flex flex-col items-start">
                                  <div className="rounded-lg rounded-tl-none bg-slate-100 p-3 dark:bg-slate-800">
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                      {comment.user?.username ||
                                        comment.user?.name ||
                                        "Anonymous"}
                                    </p>
                                    <p className="text-base text-slate-800 dark:text-slate-200 mt-1">
                                      {renderTextWithMentions(comment.text)}
                                    </p>
                                  </div>
                                  <div className="mt-1 pl-1 flex items-center gap-3 text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">
                                      {formatTimestamp(comment.createdAt)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        toggleCommentLike(comment._id)
                                      }
                                      className={`flex items-center gap-1 hover:text-[#ee2b8c] transition-colors ${
                                        comment.hasLiked
                                          ? "text-[#ee2b8c]"
                                          : "text-slate-500 dark:text-slate-400"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        {comment.hasLiked
                                          ? "favorite"
                                          : "favorite_border"}
                                      </span>
                                      <span>{comment.likesCount || 0}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (replyingTo === comment._id) {
                                          setReplyingTo(null);
                                          setReplyText("");
                                        } else {
                                          setReplyingTo(comment._id);
                                          // Expand to show replies section
                                          setExpandedComments((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.add(comment._id);
                                            return newSet;
                                          });
                                          const username =
                                            comment.user?.username ||
                                            comment.user?.name ||
                                            "Anonymous";
                                          setReplyText(`@${username} `);
                                        }
                                      }}
                                      className="text-slate-500 dark:text-slate-400 hover:text-[#ee2b8c] transition-colors font-medium"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>

                                {/* View Replies Button */}
                                {comment.replies &&
                                  comment.replies.length > 0 &&
                                  !expandedComments.has(comment._id) && (
                                    <button
                                      onClick={() =>
                                        toggleExpandComment(comment._id)
                                      }
                                      className="ml-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                                    >
                                      ── View {comment.replies.length}{" "}
                                      {comment.replies.length === 1
                                        ? "reply"
                                        : "replies"}
                                    </button>
                                  )}

                                {/* Replies */}
                                {comment.replies &&
                                  comment.replies.length > 0 &&
                                  expandedComments.has(comment._id) && (
                                    <div className="ml-8 flex flex-col gap-2">
                                      {comment.replies.map((reply: any) => (
                                        <div
                                          key={reply._id}
                                          className="flex flex-col items-start"
                                        >
                                          <div className="rounded-lg rounded-tl-none bg-slate-100/80 p-2.5 dark:bg-slate-800/80">
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                              {reply.user?.username ||
                                                reply.user?.name ||
                                                "Anonymous"}
                                            </p>
                                            <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                                              {renderTextWithMentions(
                                                reply.text
                                              )}
                                            </p>
                                          </div>
                                          <div className="mt-1 pl-1 flex items-center gap-3 text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">
                                              {formatTimestamp(reply.createdAt)}
                                            </span>
                                            <button
                                              onClick={() =>
                                                toggleReplyLike(
                                                  comment._id,
                                                  reply._id
                                                )
                                              }
                                              className={`flex items-center gap-1 hover:text-[#ee2b8c] transition-colors ${
                                                reply.hasLiked
                                                  ? "text-[#ee2b8c]"
                                                  : "text-slate-500 dark:text-slate-400"
                                              }`}
                                            >
                                              <span className="material-symbols-outlined text-sm">
                                                {reply.hasLiked
                                                  ? "favorite"
                                                  : "favorite_border"}
                                              </span>
                                              <span>
                                                {reply.likesCount || 0}
                                              </span>
                                            </button>
                                            <button
                                              onClick={() => {
                                                setReplyingTo(comment._id);
                                                // Expand to show replies section
                                                setExpandedComments((prev) => {
                                                  const newSet = new Set(prev);
                                                  newSet.add(comment._id);
                                                  return newSet;
                                                });
                                                const username =
                                                  reply.user?.username ||
                                                  reply.user?.name ||
                                                  "Anonymous";
                                                setReplyText(`@${username} `);
                                              }}
                                              className="text-slate-500 dark:text-slate-400 hover:text-[#ee2b8c] transition-colors font-medium"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Hide Replies Button */}
                                      <button
                                        onClick={() =>
                                          toggleExpandComment(comment._id)
                                        }
                                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium self-start"
                                      >
                                        ── Hide replies
                                      </button>
                                    </div>
                                  )}

                                {/* Reply Input */}
                                {replyingTo === comment._id && (
                                  <div className="ml-8 flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      placeholder="Write a reply..."
                                      autoFocus
                                      className="flex-1 rounded-full border border-slate-300 bg-slate-100 py-2 px-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-300 focus:ring-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          handleReplySubmit(comment._id);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() =>
                                        handleReplySubmit(comment._id)
                                      }
                                      disabled={
                                        replySubmitting || !replyText.trim()
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ee2b8c] text-white transition-colors hover:bg-[#d71e78] disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {replySubmitting
                                          ? "hourglass_empty"
                                          : "send"}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-black/10 p-4 dark:border-white/10">
                      {commentError && (
                        <p className="mb-2 text-sm text-red-500">
                          {commentError}
                        </p>
                      )}
                      <form
                        onSubmit={handleCommentSubmit}
                        className="relative flex items-center"
                      >
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full rounded-full border border-slate-300 bg-slate-100 py-3 pl-4 pr-14 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-300 focus:ring-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                        />
                        <button
                          type="submit"
                          disabled={commentSubmitting}
                          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ee2b8c] text-white transition-colors hover:bg-[#d71e78] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined">
                            {commentSubmitting ? "hourglass_empty" : "send"}
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

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
