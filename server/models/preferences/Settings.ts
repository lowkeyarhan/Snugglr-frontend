import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  user: mongoose.Types.ObjectId;

  preferences: {
    theme: string;
  };

  chat: {
    readReceipts: boolean;
  };

  notifications: {
    push: {
      enabled: boolean;
    };
  };

  meta: {
    version: number;
    updatedAt: Date;
  };
}

const SettingsSchema = new Schema<ISettings>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "mocha", "cupid", "amoled", "neon"],
        default: "dark",
      },
    },

    chat: {
      readReceipts: {
        type: Boolean,
        default: true,
      },
    },

    notifications: {
      push: {
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    },

    meta: {
      version: {
        type: Number,
        default: 1,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: false,
  }
);

// keep updatedAt fresh
SettingsSchema.pre("save", function () {
  this.meta.updatedAt = new Date();
});

export default mongoose.model<ISettings>("Settings", SettingsSchema);
