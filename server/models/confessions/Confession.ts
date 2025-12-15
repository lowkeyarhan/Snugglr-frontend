import mongoose from "mongoose";

const confessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    confession: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllowedCollege",
      required: true,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

confessionSchema.index({ institution: 1, createdAt: -1 });

export default mongoose.model("Confession", confessionSchema);
