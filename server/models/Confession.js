import mongoose from "mongoose";

const confessionSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    confession: {
      type: String,
      required: [true, "Confession text is required"],
      trim: true,
      maxlength: [1000, "Confession cannot exceed 1000 characters"],
    },
    allowedDomain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllowedDomain",
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        likesCount: {
          type: Number,
          default: 0,
        },
        likedBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            text: {
              type: String,
              required: true,
              trim: true,
              maxlength: [500, "Reply cannot exceed 500 characters"],
            },
            likesCount: {
              type: Number,
              default: 0,
            },
            likedBy: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

confessionSchema.index({ allowedDomain: 1, createdAt: -1 });
confessionSchema.index({ username: 1 });

const Confession = mongoose.model("Confession", confessionSchema);

export default Confession;
