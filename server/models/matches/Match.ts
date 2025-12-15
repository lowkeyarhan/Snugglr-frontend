import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "EXPIRED"],
      default: "PENDING",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// enforce consistent ordering
MatchSchema.pre("save", function () {
  const [a, b] = [this.userA, this.userB].sort((x, y) =>
    x.toString().localeCompare(y.toString())
  );
  this.userA = a;
  this.userB = b;
});

MatchSchema.index({ userA: 1, userB: 1 });

export default mongoose.model("Match", MatchSchema);
