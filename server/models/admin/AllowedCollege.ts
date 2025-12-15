import mongoose from "mongoose";

const AllowedCollegeSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AllowedCollegeModel = mongoose.model(
  "AllowedCollege",
  AllowedCollegeSchema
);

export default AllowedCollegeModel;
