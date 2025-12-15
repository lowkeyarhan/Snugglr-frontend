import mongoose from "mongoose";

const MatchPoolSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },

    mood: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 80,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const MatchPoolModel = mongoose.model("MatchPool", MatchPoolSchema);

export default MatchPoolModel;
