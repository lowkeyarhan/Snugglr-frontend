import { useState, useEffect, useRef } from "react";
import { getAllComments, deleteCommentAdmin } from "../../api/admin/api";

interface AdminReply {
  _id: string;
  text: string;
  createdAt: string;
  username: string;
  userId?: string;
  likesCount: number;
}

interface AdminComment {
  _id: string;
  // Comment author
  username: string;
  userId?: string;
  text: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  replies: AdminReply[];
}

interface AdminCommentRow extends AdminComment {
  confessionId: string;
  confessionText: string;
  confessionLikesCount: number;
  community: string;
  confessionCommentsCount?: number;
}

interface AdminConfession {
  _id: string;
  confession: string;
  username: string;
  community: string;
  likesCount: number;
  commentsCount: number;
  comments: AdminComment[];
  createdAt: string;
}

interface ConfessionGroup {
  confessionId: string;
  confessionText: string;
  community: string;
  likesCount: number;
  comments: AdminCommentRow[];
  firstUsername: string;
  firstCreatedAt: string;
}

export default function Comments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [confessions, setConfessions] = useState<AdminConfession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Expanded state for "group by confession" view (tracks confession IDs)
  const [expandedConfessions, setExpandedConfessions] = useState<Set<string>>(
    () => new Set()
  );
  // Expanded state for replies in comment-centric view (tracks comment IDs)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    () => new Set()
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [groupByConfession, setGroupByConfession] = useState(false);
  const hasFetched = useRef(false);

  const communities = [
    "All Communities",
    ...Array.from(new Set(confessions.map((c) => c.community))).sort(),
  ];

  // Flatten all comments from all confessions so we can show a comment-centric view
  const allComments: AdminCommentRow[] = confessions.flatMap((confession) =>
    confession.comments.map((comment) => ({
      ...comment,
      confessionId: confession._id,
      confessionText: confession.confession,
      confessionLikesCount: confession.likesCount,
      community: confession.community,
      confessionCommentsCount: confession.commentsCount,
    }))
  );

  const filteredComments = allComments.filter((comment) => {
    const matchesSearch = comment.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCommunity =
      selectedCommunity === "all" || comment.community === selectedCommunity;
    const matchesDate =
      !selectedDate ||
      new Date(comment.createdAt).toISOString().split("T")[0] === selectedDate;
    const matchesUsername =
      !usernameQuery ||
      comment.username.toLowerCase().includes(usernameQuery.toLowerCase());

    return matchesSearch && matchesCommunity && matchesDate && matchesUsername;
  });

  const isUsernameFieldDisabled = selectedCommunity === "all";

  // Build grouped view (by confession) derived from the filtered comments
  const confessionGroups: ConfessionGroup[] = Object.values(
    filteredComments.reduce((acc, comment) => {
      const id = comment.confessionId;
      if (!acc[id]) {
        acc[id] = {
          confessionId: id,
          confessionText: comment.confessionText,
          community: comment.community,
          likesCount: comment.confessionLikesCount,
          comments: [],
          firstUsername: comment.username,
          firstCreatedAt: comment.createdAt,
        };
      }
      acc[id].comments.push(comment);
      return acc;
    }, {} as Record<string, ConfessionGroup>)
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await getAllComments(token);
      setConfessions(response.data.confessions);
    } catch (err: any) {
      setError(err.message || "Failed to fetch comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfessionExpand = (id: string) => {
    setExpandedConfessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleReplyExpand = (id: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteComment = async (
    confessionId: string,
    commentId: string
  ) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setDeletingId(commentId);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }
      await deleteCommentAdmin(confessionId, commentId, token);

      // Update the confessions state by removing the deleted comment
      setConfessions((prev) =>
        prev.map((confession) => {
          if (confession._id === confessionId) {
            return {
              ...confession,
              comments: confession.comments.filter((c) => c._id !== commentId),
              commentsCount: confession.comments.length - 1,
            };
          }
          return confession;
        })
      );
      // If this confession was expanded in grouped view and now has no comments,
      // collapse it to avoid showing an empty state.
      setExpandedConfessions((prev) => {
        const next = new Set(prev);
        const confession = confessions.find((c) => c._id === confessionId);
        if (confession && confession.comments.length - 1 <= 0) {
          next.delete(confessionId);
        }
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
      console.error("Error deleting comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
          Comments Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and moderate anonymous user comments.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg px-3 py-2 inline-block">
            {error}
          </p>
        )}
      </header>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              search
            </span>
          </div>
          <input
            type="text"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          />
        </div>

        {/* Community Filter */}
        <select
          value={selectedCommunity}
          onChange={(e) => {
            setSelectedCommunity(e.target.value);
            if (e.target.value === "all") {
              setUsernameQuery("");
            }
          }}
          className="h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
        >
          {communities.map((community) => (
            <option
              key={community}
              value={community === "All Communities" ? "all" : community}
            >
              {community}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
        />

        {/* Username Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              person
            </span>
          </div>
          <input
            type="text"
            placeholder={
              isUsernameFieldDisabled
                ? "Select community first"
                : "Search username..."
            }
            value={usernameQuery}
            onChange={(e) => setUsernameQuery(e.target.value)}
            disabled={isUsernameFieldDisabled}
            className={`w-full h-12 pl-12 pr-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none ${
              isUsernameFieldDisabled
                ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                : "bg-white dark:bg-card-dark"
            }`}
          />
        </div>
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4">
          <span className="text-sm text-slate-700 dark:text-slate-200">
            Group by confessions
          </span>
          <button
            type="button"
            onClick={() => setGroupByConfession((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              groupByConfession
                ? "bg-primary"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                groupByConfession ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Comments Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white dark:bg-background-dark/50 rounded-xl p-12 text-center text-gray-500 dark:text-gray-400">
            Loading confessions...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-white dark:bg-background-dark/50 rounded-xl p-12 text-center text-gray-500 dark:text-gray-400">
            No comments found matching your filters.
          </div>
        ) : groupByConfession ? (
          confessionGroups.map((group) => (
            <div
              key={group.confessionId}
              className="bg-white dark:bg-background-dark/50 rounded-xl p-5"
            >
              {/* Confession Content */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-lg text-gray-800 dark:text-gray-100">
                    {group.confessionText}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-2">
                <span>{group.community}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>@{group.firstUsername}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>
                  {new Date(group.firstCreatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-start gap-4 border-t border-gray-100 dark:border-white/10 pt-3">
                <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-500 transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    favorite
                  </span>
                  <span className="text-sm font-medium">
                    {group.likesCount}
                  </span>
                </button>
                <button
                  className={`flex items-center gap-1.5 transition-colors ${
                    expandedConfessions.has(group.confessionId)
                      ? "text-primary dark:text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                  }`}
                  onClick={() => toggleConfessionExpand(group.confessionId)}
                  disabled={group.comments.length === 0}
                >
                  <span className="material-symbols-outlined text-xl">
                    chat_bubble
                  </span>
                  <span className="text-sm font-medium">
                    {group.comments.length === 0
                      ? "No Comments"
                      : group.comments.length === 1
                      ? "1 Comment"
                      : `${group.comments.length} Comments`}
                  </span>
                </button>
              </div>

              {/* Expanded Comments for this confession */}
              {expandedConfessions.has(group.confessionId) &&
                group.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                    {group.comments.map((comment) => (
                      <div key={comment._id}>
                        <div className="bg-gray-100 dark:bg-background-dark p-3 rounded-xl group relative">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            @{comment.username}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {comment.text}
                          </p>
                          <button
                            onClick={() =>
                              handleDeleteComment(
                                comment.confessionId,
                                comment._id
                              )
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-60"
                            disabled={deletingId === comment._id}
                            title="Delete comment"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>

                        {/* Show replies if any */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2 ml-6 space-y-2">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply._id}
                                className="bg-gray-100 dark:bg-background-dark p-3 rounded-xl"
                              >
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                  @{reply.username}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {reply.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment._id}
              className="bg-white dark:bg-background-dark/50 rounded-xl p-5"
            >
              {/* Comment Content */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-lg text-gray-800 dark:text-gray-100">
                    {comment.text}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    On confession: &quot;{comment.confessionText}&quot;
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-2">
                <span>{comment.community}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>@{comment.username}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-start gap-4 border-t border-gray-100 dark:border-white/10 pt-3">
                <button className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-500 transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    favorite
                  </span>
                  <span className="text-sm font-medium">
                    {comment.likesCount}
                  </span>
                </button>
                <button
                  className={`flex items-center gap-1.5 transition-colors ${
                    expandedReplies.has(comment._id)
                      ? "text-primary dark:text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                  }`}
                  onClick={() => toggleReplyExpand(comment._id)}
                  disabled={comment.repliesCount === 0}
                >
                  <span className="material-symbols-outlined text-xl">
                    chat_bubble
                  </span>
                  <span className="text-sm font-medium">
                    {comment.repliesCount === 0
                      ? "No Replies"
                      : comment.repliesCount === 1
                      ? "1 Reply"
                      : `${comment.repliesCount} Replies`}
                  </span>
                </button>
                <div className="ml-auto flex items-center">
                  <button
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-60"
                    onClick={() =>
                      handleDeleteComment(comment.confessionId, comment._id)
                    }
                    disabled={deletingId === comment._id}
                  >
                    <span className="material-symbols-outlined text-xl">
                      delete
                    </span>
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>

              {/* Expanded Replies */}
              {expandedReplies.has(comment._id) &&
                comment.replies &&
                comment.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply._id}
                        className="bg-gray-100 dark:bg-background-dark p-3 rounded-xl"
                      >
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          @{reply.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
