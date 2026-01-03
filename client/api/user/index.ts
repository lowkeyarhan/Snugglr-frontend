// Authentication & Profile
export { registerUser, loginUser } from "./auth";
export { updateUserProfile, getMyProfile } from "./user";
export {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUser,
  setUser,
  removeUser,
  logout,
  isAuthenticated,
} from "./auth";

// Confessions & Comments
export {
  createConfession,
  getConfessions,
  likeConfession,
  getCommentsForConfession,
  commentOnConfession,
  replyToComment,
  likeComment,
} from "./confessions";

// Matching
export { joinMatchPool, tryMatch, submitOpeningMove } from "./match";

// Chatrooms
export {
  createPersonalChat,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  getMyChats,
  getChatById,
} from "./rooms";

// Messages
export { getMessages, sendMessage } from "./messages";

// Chat metadata (inbox view)
export { getUserChats, getChatMeta } from "./rooms";

// Types
export type { ChatRoom } from "./rooms";
export type { Message, MessagesResponse } from "./messages";
export type { ChatListItem, ChatMeta } from "./rooms";
