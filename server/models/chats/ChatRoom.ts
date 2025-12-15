import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    type: {
      type: String,
      enum: ["personal", "group"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["LOCKED", "ACTIVE", "EXPIRED"],
      default: "LOCKED",
      index: true,
    },

    anonymous: {
      type: Boolean,
      default: false,
      index: true,
    },

    openingMoveSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OpeningMoveSession",
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    groupName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// consistent ordering for 1–1 chats
chatSchema.pre("save", function () {
  if (this.type === "personal" && this.users.length === 2) {
    this.users.sort((a, b) => a.toString().localeCompare(b.toString()));
  }
});

// prevent duplicate NORMAL DMs
chatSchema.index(
  { users: 1, institute: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "personal",
      anonymous: { $ne: true },
    },
  }
);

const ChatRoom = mongoose.model("ChatRoom", chatSchema);

export default ChatRoom;
