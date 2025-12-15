import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
      index: true,
    },

    // soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// enforce message rules
messageSchema.pre("save", function () {
  if (this.type === "text" && !this.text) {
    throw new Error("Text message cannot be empty");
  }

  if (this.type === "system") {
    this.sender = null;
  }
});

// fast chat pagination
messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
