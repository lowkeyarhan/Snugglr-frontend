import { useState, useEffect, useRef } from "react";
import {
  getCommentsForConfession,
  commentOnConfession,
  replyToComment,
  likeComment,
  likeConfession,
} from "../userAPI/confessions";
import { getUser } from "../userAPI/auth";

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    name?: string;
    profilePicture?: string;
  };
  confession: string;
  parentComment: string | null;
  likesCount: number;
  createdAt: string;
  isLikedByMe?: boolean;
  replies?: Comment[];
}

interface ConfessionModalProps {
  confession: {
    _id: string;
    confession: string;
    user: any;
    institution?: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    isLikedByMe?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onConfessionLike: () => void;
}

export default function ConfessionModal({
  confession,
  isOpen,
  onClose,
  onConfessionLike,
}: ConfessionModalProps) {
  type ReplyCtx = { parentId: string; anchorId: string };
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  // Instagram-style: replies are a single thread under the parent comment (no deep nesting UI).
  // We still support tagging the user you hit "Reply" on.
  const [replyCtx, setReplyCtx] = useState<ReplyCtx | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && confession._id) {
      fetchComments();
    }
  }, [isOpen, confession._id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await getCommentsForConfession(confession._id, token);
      if (response.success && response.data) {
        // Organize comments into threads (top-level comments with nested replies)
        const allComments = response.data;
        const topLevelComments = allComments.filter(
          (c: Comment) => !c.parentComment
        );
        const allReplies = allComments.filter((c: Comment) => c.parentComment);

        // Recursively attach replies to their parent comments/replies
        const attachReplies = (parentId: string): Comment[] => {
          return allReplies
            .filter((reply: Comment) => reply.parentComment === parentId)
            .map((reply: Comment) => ({
              ...reply,
              replies: attachReplies(reply._id), // Recursively attach nested replies
            }));
        };

        const organizedComments = topLevelComments.map((comment: Comment) => ({
          ...comment,
          replies: attachReplies(comment._id),
        }));

        setComments(organizedComments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await commentOnConfession(
        confession._id,
        newComment.trim(),
        token
      );

      if (response.success) {
        setNewComment("");
        await fetchComments();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyCtx?.parentId) return;
    const trimmed = replyText.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await replyToComment(
        confession._id,
        replyCtx.parentId,
        trimmed,
        token
      );

      if (response.success) {
        setReplyText("");
        setReplyCtx(null);
        await fetchComments();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (likingComments.has(commentId)) return; // Prevent double-clicks

    try {
      setLikingComments((prev) => new Set(prev).add(commentId));
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await likeComment(commentId, token);
      if (response.success) {
        // Optimistically update the UI
        setComments((prevComments) => {
          const updateCommentLikes = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment._id === commentId) {
                const newLiked = response.liked;
                const currentLikes = comment.likesCount || 0;
                return {
                  ...comment,
                  isLikedByMe: newLiked,
                  likesCount: newLiked
                    ? currentLikes + 1
                    : Math.max(0, currentLikes - 1),
                };
              }
              // Update nested replies
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateCommentLikes(comment.replies),
                };
              }
              return comment;
            });
          };

          return updateCommentLikes(prevComments);
        });

        // Refresh to get accurate data
        await fetchComments();
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setLikingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleLikeConfession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await likeConfession(confession._id, token);
      if (response.success) {
        onConfessionLike();
      }
    } catch (error) {
      console.error("Error liking confession:", error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getUsername = (user: any) => {
    if (typeof user === "object") {
      return user.username || user.name || "Anonymous";
    }
    return "Anonymous";
  };

  const getUserAvatar = (user: any, index: number) => {
    if (typeof user === "object" && user.profilePicture) {
      return user.profilePicture;
    }
    const defaultAvatars = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtY-ZLxX5ZMjSyn5R49qX_B5lP1CCzjp5qwl6iWY7vVPNlQy6MIvxKRB_3H7UuBxr9gwJgiQkWy-EKlvTBVghLt6tyQyvf-VysSgUfmc6V97dFtPZd4zPmDH_EN5XexF2ohADLaQJpd1XocACD3LcWajb87XF3jX9RTzyyBRtHyrYOhcfLjVHVahYAYWKAeRBRD3-7voUdKGm1lwAsqKIDDgS2yy4CgaDdOdwijfyhZfInmuy8O14EL903cecGjZiOSZZtGJMBoCNn",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYwWxB4BGnOefkjNl03d16DlV_I7zsH5la88OfDKs8kngQMY6G6rzi9h2SF-3ldkP5bDt0fulLJCcNDYkR2wHPZEfOPHpn7UhNmEPnM1Feua__pJP5rTQ1qSthgi6WVMFAUNyRMFIsMCUlmYLCQT3KVpfIEvdrOPrXG1XPJ1E06ygIHWczpdBNPQfLUFEkAM4KpaJHjEef7IG30LIbLoY051OCdwrm5u1ozBVS8tEIUPFRYcseE9CHYp5O8n7oT3WO_VVTLHlkB_FS",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCS73fQcSYaU0tXeKf_SuhBFDJyw-xgj7AI8zGSuCZy7lHf4uVMlNPX6udqpOjat33mOJq_hfJLgPKYspZkhquJ9FVmxU9idD8YnNhdj-PYbov0tgGtfOBGT57mUm3-QgTb0p0Vg_S1KvqpFES5GA7sBupQnld4AfE5cDnX3GGHnv6vxQrDVeU3LW6sD9uRRzFTig2Qh2JPppN6jFAC3SK9XPIHUOT1PgiX95kpHR0PgsBoQAqyJntlLWCVOJCAXvjyAmi_2bMYTj_q",
    ];
    return defaultAvatars[index % defaultAvatars.length];
  };

  const isOriginalPoster = (commentUser: any) => {
    if (!confession.user || !commentUser) return false;
    const confessionUserId =
      typeof confession.user === "object"
        ? confession.user._id
        : confession.user;
    const commentUserId =
      typeof commentUser === "object" ? commentUser._id : commentUser;
    return confessionUserId === commentUserId;
  };

  const flattenReplyPairs = (
    nodes: Comment[],
    parentUsername: string
  ): Array<{ node: Comment; tag: string }> => {
    return nodes.flatMap((n) => [
      { node: n, tag: parentUsername },
      ...flattenReplyPairs(n.replies ?? [], getUsername(n.user)),
    ]);
  };

  // Render a reply row (thread is flattened at the comment level; no nested "View replies" per reply)
  const renderReply = (
    reply: Comment,
    replyIndex: number,
    _rootCommentId: string,
    tagUser: string
  ) => {
    const replyUsername = getUsername(reply.user);
    const replyAvatar = getUserAvatar(reply.user, replyIndex + 100);
    const replyIsOP = isOriginalPoster(reply.user);
    const isReplying = replyCtx?.anchorId === reply._id;

    return (
      <div key={reply._id} className="flex gap-3 items-start">
        <div className="flex-shrink-0">
          {replyIsOP ? (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-white">
              OP
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover"
                src={replyAvatar}
              />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div
            className={`${
              replyIsOP
                ? "bg-primary/5 border border-primary/10"
                : "bg-gray-100"
            } p-3 rounded-[18px] rounded-tl-none inline-block max-w-full`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-xs font-bold ${
                  replyIsOP ? "text-primary" : "text-gray-900"
                }`}
              >
                {replyUsername}
              </span>
              {replyIsOP && (
                <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-[1px] rounded-full font-bold">
                  Author
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800">
              {tagUser ? (
                <span className="text-primary font-medium mr-1">
                  @{tagUser}
                </span>
              ) : null}
              {tagUser && reply.text?.startsWith(`@${tagUser}`)
                ? reply.text.replace(new RegExp(`^@${tagUser}\\s*`), "")
                : reply.text}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <span className="text-xs font-medium text-gray-400">
              {formatTimeAgo(reply.createdAt)}
            </span>
            <button
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => handleLikeComment(reply._id)}
            >
              Like
            </button>
            <button
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => {
                setReplyCtx(
                  replyCtx?.anchorId === reply._id
                    ? null
                    : {
                        // IMPORTANT: keep true parentComment relationship in DB.
                        // We'll flatten only for display, but reply-to-reply should store parentComment = reply._id.
                        parentId: reply._id,
                        anchorId: reply._id,
                      }
                );
                setReplyText("");
              }}
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
            <div className="flex items-center gap-1 ml-auto mr-1">
              <span
                className={`material-symbols-outlined text-[12px] ${
                  reply.isLikedByMe
                    ? "text-primary fill-current"
                    : "text-gray-300"
                }`}
                style={{
                  fontVariationSettings: reply.isLikedByMe
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                favorite
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {reply.likesCount || 0}
              </span>
            </div>
          </div>

          {/* Reply Input for Nested Replies */}
          {isReplying && (
            <div className="mt-3 pl-2">
              <div className="flex gap-2 items-start">
                <div className="size-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-600">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 text-sm rounded-full py-2 px-4 border-none ring-1 ring-transparent focus:ring-primary/20 transition-all outline-none"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitReply();
                      }
                    }}
                  />
                  <button
                    className="p-2 rounded-full text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                    onClick={() => handleSubmitReply()}
                    disabled={!replyText.trim() || submitting}
                  >
                    <span
                      className="material-symbols-outlined text-[18px] fill-current"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      send
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const confessionUsername = getUsername(confession.user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[550px] h-[85vh] md:h-[90vh] bg-white/98 backdrop-blur-xl border border-white/60 shadow-lg rounded-[32px] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white/90 z-20">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-900 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-[22px]">
                arrow_back
              </span>
            </button>
            <h2 className="text-base font-bold tracking-tight text-gray-900">
              Comments
            </h2>
          </div>
          <button
            className="group flex items-center justify-center size-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-gray-500 group-hover:text-gray-900 text-[20px]">
              close
            </span>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {/* Confession Card */}
          <div className="px-6 py-6 border-b border-gray-100">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-400 p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {confession.user?.profilePicture ? (
                      <img
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        src={confession.user.profilePicture}
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-900">
                        {confessionUsername
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "AS"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-none mb-1">
                    {confessionUsername}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatTimeAgo(confession.createdAt)} ago
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-900 transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>

            {/* Confession Text */}
            <div className="mb-5">
              <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-800">
                {confession.confession}
              </p>
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center gap-6 pt-2">
              <button
                className={`flex items-center gap-2 group transition-colors ${
                  confession.isLikedByMe
                    ? "text-primary"
                    : "text-gray-500 hover:text-primary"
                }`}
                onClick={handleLikeConfession}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${
                    confession.isLikedByMe ? "fill-current" : ""
                  }`}
                  style={{
                    fontVariationSettings: confession.isLikedByMe
                      ? "'FILL' 1"
                      : "'FILL' 0",
                  }}
                >
                  favorite
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {confession.likesCount || 0}
                </span>
              </button>
              <button className="flex items-center gap-2 group text-gray-500 hover:text-gray-900 transition-colors">
                <span className="material-symbols-outlined text-[22px]">
                  chat_bubble
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {confession.commentsCount || 0}
                </span>
              </button>
              <button className="ml-auto text-gray-400 hover:text-gray-900 transition-colors">
                <span className="material-symbols-outlined text-[22px]">
                  ios_share
                </span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-5 py-6 space-y-7">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-300 border-r-transparent"></div>
                <p className="mt-2 text-gray-500 text-sm">
                  Loading comments...
                </p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No comments yet. Be the first!
                </p>
              </div>
            ) : (
              comments.map((comment, index) => {
                const commentUsername = getUsername(comment.user);
                const commentAvatar = getUserAvatar(comment.user, index);
                const isReplying = replyCtx?.anchorId === comment._id;
                const hasReplies =
                  comment.replies && comment.replies.length > 0;
                const showReplies = expandedReplies.has(comment._id);
                const flattened = comment.replies
                  ? flattenReplyPairs(comment.replies, commentUsername)
                  : [];
                const totalReplies = flattened.length;

                return (
                  <div key={comment._id} className="flex gap-3 items-start">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                        <img
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          src={commentAvatar}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Main Comment Bubble */}
                      <div className="bg-gray-100 hover:bg-gray-200 transition-colors p-3.5 rounded-[20px] rounded-tl-none inline-block max-w-full">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-gray-900">
                            {commentUsername}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-snug">
                          {comment.text}
                        </p>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-4 mt-1.5 ml-2">
                        <span className="text-xs font-medium text-gray-400">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                        <button
                          className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                          onClick={() => handleLikeComment(comment._id)}
                        >
                          Like
                        </button>
                        <button
                          className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                          onClick={() => {
                            setReplyCtx(
                              isReplying
                                ? null
                                : {
                                    parentId: comment._id,
                                    anchorId: comment._id,
                                  }
                            );
                            setReplyText("");
                          }}
                        >
                          {isReplying ? "Cancel" : "Reply"}
                        </button>
                        <div className="flex items-center gap-1 ml-auto mr-1">
                          <span
                            className={`material-symbols-outlined text-[12px] ${
                              comment.isLikedByMe
                                ? "text-primary fill-current"
                                : "text-gray-300"
                            }`}
                            style={{
                              fontVariationSettings: comment.isLikedByMe
                                ? "'FILL' 1"
                                : "'FILL' 0",
                            }}
                          >
                            favorite
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {comment.likesCount || 0}
                          </span>
                        </div>
                      </div>

                      {/* Reply Input */}
                      {isReplying && (
                        <div className="mt-3 pl-2">
                          <div className="flex gap-2 items-start">
                            <div className="size-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-200">
                              <span className="text-[10px] font-bold text-gray-600">
                                {currentUser?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 text-sm rounded-full py-2 px-4 border-none ring-1 ring-transparent focus:ring-primary/20 transition-all outline-none"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitReply();
                                  }
                                }}
                              />
                              <button
                                className="p-2 rounded-full text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                                onClick={() => handleSubmitReply()}
                                disabled={!replyText.trim() || submitting}
                              >
                                <span
                                  className="material-symbols-outlined text-[18px] fill-current"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  send
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies (Instagram-style: hidden by default; clicking reveals ALL replies at once) */}
                      {hasReplies && totalReplies > 0 && (
                        <div className="mt-2 ml-10 pl-4 flex flex-col gap-2">
                          {!showReplies ? (
                            <button
                              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
                              onClick={() => {
                                const next = new Set(expandedReplies);
                                next.add(comment._id);
                                setExpandedReplies(next);
                              }}
                            >
                              <div className="w-6 h-[1px] bg-gray-300"></div>
                              View{" "}
                              {totalReplies === 1
                                ? "1 reply"
                                : `${totalReplies} replies`}
                            </button>
                          ) : (
                            <>
                              {flattened.map(({ node, tag }, i) =>
                                renderReply(node, i, comment._id, tag)
                              )}
                              <button
                                className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                onClick={() => {
                                  const next = new Set(expandedReplies);
                                  next.delete(comment._id);
                                  setExpandedReplies(next);
                                }}
                              >
                                Hide replies
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Padding for bottom scrolling visibility */}
            <div className="h-6"></div>
          </div>
        </div>

        {/* Sticky Input Footer */}
        <footer className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 md:px-6 md:py-4 z-20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-purple-500 p-[1.5px] shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {currentUser?.profilePicture ? (
                  <img
                    alt="Current User Avatar"
                    className="w-full h-full object-cover opacity-90"
                    src={currentUser.profilePicture}
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-900">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 relative group">
              <input
                className="w-full bg-gray-100 text-gray-900 placeholder-gray-400 text-sm rounded-full py-3 pl-5 pr-12 border-none ring-1 ring-transparent focus:ring-primary/20 transition-all outline-none"
                placeholder="Add a comment as yourself..."
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
              >
                <span
                  className="material-symbols-outlined text-[20px] fill-current"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
