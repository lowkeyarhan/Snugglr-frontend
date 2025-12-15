import User from "../models/profile/User";

// get my profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // find the user by their ID and select the fields to return
    const user = await User.findById(userId)
      .select("-password -__v")
      .populate("institution", "name");

    // check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // return the user
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};

// allowed fields to update
const ALLOWED_FIELDS = [
  "name",
  "profilePicture",
  "phoneNumber",
  "birthday",
  "pronouns",
  "favArtists",
  "favMovies",
  "favAlbums",
  "favSpotOnCampus",
  "loveLanguage",
  "quirkyFacts",
  "idealDate",
  "fantasies",
];

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // allowed fields to update
    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // check if no editable fields are provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No editable fields provided",
      });
    }

    // update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password -__v")
      .populate("institution", "name");

    // return the updated user
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: err.message,
    });
  }
};
