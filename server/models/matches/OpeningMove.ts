import mongoose from "mongoose";

const OpeningMoveSessionSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      unique: true,
      index: true,
    },

    choices: {
      userA: {
        type: String,
        default: null,
      },
      userB: {
        type: String,
        default: null,
      },
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const OpeningMoveSession = mongoose.model(
  "OpeningMoveSession",
  OpeningMoveSessionSchema
);

export default OpeningMoveSession;
