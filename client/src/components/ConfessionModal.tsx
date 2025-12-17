import { useState, useEffect, useRef } from "react";
import {
  getCommentsForConfession,
  commentOnConfession,
  replyToComment,
  likeComment,
  likeConfession,
} from "../userAPI/confessions";
import { getUser } from "../userAPI/auth";

// --- Helpers ---
const getToken = () => localStorage.getItem("token");
const formatTimeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};
const getUsername = (u: any) => u?.username || u?.name || "Anonymous";
const getAvatar = (u: any, i: number) =>
  u?.profilePicture ||
  `http://googleusercontent.com/profile/picture/${(i % 3) + 12}`;
const flattenReplies = (
  nodes: any[],
  parentTag: string
): { node: any; tag: string }[] =>
  nodes.flatMap((n) => [
    { node: n, tag: parentTag },
    ...flattenReplies(n.replies || [], getUsername(n.user)),
  ]);

// Confession modal component
export default function ConfessionModal({
  confession,
  isOpen,
  onClose,
  onConfessionLike,
}: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({ comment: "", reply: "" });
  const [replyCtx, setReplyCtx] = useState<{
    parentId: string;
    anchorId: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();

  // Load comments for a confession
  useEffect(() => {
    if (!isOpen || !confession._id) return;
    const load = async () => {
      setLoading(true);
      const token = getToken();
      if (token) {
        const res = await getCommentsForConfession(confession._id, token);
        if (res.success && res.data) {
          const mapReplies = (parentId: string): any[] =>
            res.data
              .filter((r: any) => r.parentComment === parentId)
              .map((r: any) => ({ ...r, replies: mapReplies(r._id) }));
          setComments(
            res.data
              .filter((c: any) => !c.parentComment)
              .map((c: any) => ({ ...c, replies: mapReplies(c._id) }))
          );
        }
      }
      setLoading(false);
    };
    load();
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", esc);
    };
  }, [isOpen, confession._id, onClose]);

  // Handle comment or reply submission
  const handleAction = async (action: "comment" | "reply") => {
    const text = action === "comment" ? inputs.comment : inputs.reply;
    if (!text.trim() || submitting || !getToken()) return;
    setSubmitting(true);
    try {
      const res =
        action === "comment"
          ? await commentOnConfession(confession._id, text.trim(), getToken()!)
          : await replyToComment(
              confession._id,
              replyCtx!.parentId,
              text.trim(),
              getToken()!
            );

      if (res.success) {
        setInputs((p) => ({ ...p, [action]: "" }));
        if (action === "reply") setReplyCtx(null);
        // Refresh comments after submission
        const refresh = await getCommentsForConfession(
          confession._id,
          getToken()!
        );
        if (refresh.success) {
          const mapReplies = (pid: string): any[] =>
            refresh.data
              .filter((r: any) => r.parentComment === pid)
              .map((r: any) => ({ ...r, replies: mapReplies(r._id) }));
          setComments(
            refresh.data
              .filter((c: any) => !c.parentComment)
              .map((c: any) => ({ ...c, replies: mapReplies(c._id) }))
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle like for a confession or a comment
  const toggleLike = async (id: string, isConfession = false) => {
    const token = getToken();
    if (!token) return;
    if (isConfession) {
      const res = await likeConfession(id, token);
      if (res.success) onConfessionLike();
    } else {
      const res = await likeComment(id, token);
      if (res.success) {
        const updateRec = (list: any[]): any[] =>
          list.map((c) => {
            if (c._id === id)
              return {
                ...c,
                isLikedByMe: res.liked,
                likesCount: res.liked
                  ? (c.likesCount || 0) + 1
                  : Math.max(0, (c.likesCount || 0) - 1),
              };
            return { ...c, replies: updateRec(c.replies || []) };
          });
        setComments((prev) => updateRec(prev));
      }
    }
  };

  // Render a single comment or reply row
  const renderRow = (
    item: any,
    idx: number,
    parentId: string,
    tagUser?: string
  ) => {
    const isOP = item.user?._id === confession.user?._id;
    const isReplying = replyCtx?.anchorId === item._id;
    return (
      <div key={item._id} className="flex gap-3 items-start">
        <div className="flex-shrink-0">
          {isOP ? (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-white">
              OP
            </div>
          ) : (
            <img
              alt="avatar"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
              src={getAvatar(item.user, idx)}
            />
          )}
        </div>
        <div className="flex-1">
          <div
            className={`${
              isOP ? "bg-primary/5 border border-primary/10" : "bg-gray-100"
            } p-3 rounded-[18px] rounded-tl-none inline-block max-w-full`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-xs font-bold ${
                  isOP ? "text-primary" : "text-gray-900"
                }`}
              >
                {getUsername(item.user)}
              </span>
              {isOP && (
                <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-[1px] rounded-full font-bold">
                  Author
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800">
              {tagUser && (
                <span className="text-primary font-medium mr-1">
                  @{tagUser}
                </span>
              )}
              {tagUser
                ? item.text.replace(new RegExp(`^@${tagUser}\\s*`), "")
                : item.text}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <span className="text-xs font-medium text-gray-400">
              {formatTimeAgo(item.createdAt)}
            </span>
            <button
              className="text-xs font-bold text-gray-500 hover:text-gray-900"
              onClick={() => toggleLike(item._id)}
            >
              Like
            </button>
            <button
              className="text-xs font-bold text-gray-500 hover:text-gray-900"
              onClick={() => {
                setReplyCtx(
                  isReplying
                    ? null
                    : {
                        parentId: parentId === "root" ? item._id : parentId,
                        anchorId: item._id,
                      }
                );
                setInputs((p) => ({ ...p, reply: "" }));
              }}
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
            <div className="flex items-center gap-1 ml-auto mr-1">
              <span
                className={`material-symbols-outlined text-[12px] ${
                  item.isLikedByMe
                    ? "text-primary fill-current"
                    : "text-gray-300"
                }`}
              >
                {item.isLikedByMe ? "favorite" : "favorite"}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {item.likesCount || 0}
              </span>
            </div>
          </div>
          {isReplying && (
            <div className="mt-3 pl-2 flex gap-2 items-start">
              <div className="size-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-200">
                <span className="text-[10px] font-bold text-gray-600">
                  {currentUser?.username?.[0].toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  className="flex-1 bg-gray-100 text-gray-900 text-sm rounded-full py-2 px-4 outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Write a reply..."
                  value={inputs.reply}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, reply: e.target.value }))
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleAction("reply")}
                />
                <button
                  className="p-2 text-primary hover:bg-primary/5 rounded-full disabled:opacity-50"
                  onClick={() => handleAction("reply")}
                  disabled={!inputs.reply.trim()}
                >
                  <span className="material-symbols-outlined text-[18px] fill-current">
                    send
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the confession modal
  if (!isOpen) return null;
  const username = getUsername(confession.user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[550px] h-[85vh] md:h-[90vh] bg-white/98 backdrop-blur-xl border border-white/60 shadow-lg rounded-[32px] flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white/90 z-20">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-900 hover:bg-gray-100 p-1.5 rounded-full"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-[22px]">
                arrow_back
              </span>
            </button>
            <h2 className="text-base font-bold text-gray-900">Comments</h2>
          </div>
          <button
            className="flex items-center justify-center size-8 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-gray-500 text-[20px]">
              close
            </span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-400 p-[2px] shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {confession.user?.profilePicture ? (
                      <img
                        alt="avatar"
                        className="w-full h-full object-cover"
                        src={confession.user.profilePicture}
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-900">
                        {username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-none mb-1">
                    {username}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatTimeAgo(confession.createdAt)} ago
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-900">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <p className="mb-5 text-lg md:text-xl font-medium leading-relaxed text-gray-800">
              {confession.confession}
            </p>
            <div className="flex items-center gap-6 pt-2">
              <button
                className={`flex items-center gap-2 group transition-colors ${
                  confession.isLikedByMe
                    ? "text-primary"
                    : "text-gray-500 hover:text-primary"
                }`}
                onClick={() => toggleLike(confession._id, true)}
              >
                <span
                  className={`material-symbols-outlined text-[22px] group-hover:scale-110 ${
                    confession.isLikedByMe ? "fill-current" : ""
                  }`}
                >
                  {confession.isLikedByMe ? "favorite" : "favorite_border"}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {confession.likesCount || 0}
                </span>
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="material-symbols-outlined text-[22px]">
                  chat_bubble
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {confession.commentsCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 space-y-7">
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No comments yet. Be the first!
              </div>
            ) : (
              comments.map((c, i) => {
                const flattened = c.replies
                  ? flattenReplies(c.replies, getUsername(c.user))
                  : [];
                return (
                  <div key={c._id} className="flex flex-col gap-2">
                    {renderRow(c, i, "root")}
                    {flattened.length > 0 && (
                      <div className="ml-10 pl-4 flex flex-col gap-2">
                        {!expanded.has(c._id) ? (
                          <button
                            className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2"
                            onClick={() =>
                              setExpanded((prev) => new Set(prev).add(c._id))
                            }
                          >
                            <div className="w-6 h-[1px] bg-gray-300"></div>View{" "}
                            {flattened.length} replies
                          </button>
                        ) : (
                          <>
                            {flattened.map((r, idx) =>
                              renderRow(r.node, idx + 100, c._id, r.tag)
                            )}
                            <button
                              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
                              onClick={() =>
                                setExpanded((prev) => {
                                  const n = new Set(prev);
                                  n.delete(c._id);
                                  return n;
                                })
                              }
                            >
                              Hide replies
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div className="h-6"></div>
          </div>
        </div>

        <footer className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 md:px-6 md:py-4 z-20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-purple-500 p-[1.5px] shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {currentUser?.profilePicture ? (
                  <img
                    alt="me"
                    className="w-full h-full object-cover"
                    src={currentUser.profilePicture}
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-900">
                    {currentUser?.username?.[0].toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 relative group">
              <input
                className="w-full bg-gray-100 text-gray-900 text-sm rounded-full py-3 pl-5 pr-12 outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Add a comment as yourself..."
                value={inputs.comment}
                onChange={(e) =>
                  setInputs((p) => ({ ...p, comment: e.target.value }))
                }
                onKeyPress={(e) => e.key === "Enter" && handleAction("comment")}
              />
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full text-primary hover:bg-primary/5 disabled:opacity-50"
                onClick={() => handleAction("comment")}
                disabled={!inputs.comment.trim() || submitting}
              >
                <span className="material-symbols-outlined text-[20px] fill-current">
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
