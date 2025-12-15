import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // who receives this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // category
    type: {
      type: String,
      enum: [
        "match",
        "message",
        "confession",
        "like",
        "comment",
        "admin",
        "system",
      ],
      required: true,
    },

    // text shown to user
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // extra info
    body: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // redirection (deep linking)
    actionUrl: {
      type: String,
      trim: true,
    },

    // related entities
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    relatedChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
    },

    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Confession",
    },

    // read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
