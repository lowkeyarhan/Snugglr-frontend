import User from "../models/User.js";
import Match from "../models/Match.js";

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      birthday,
      gender,
      pronouns,
      interests,
      musicPreferences,
      favoriteShows,
      memeVibe,
      community,
      favoriteSpot,
      loveLanguage,
      quirkyFact,
      fantasies,
      idealDate,
      hint,
    } = req.body;

    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (birthday) {
      updateData.birthday = birthday;
      const birthDate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      updateData.age = age;
    }
    if (gender) updateData.gender = gender;
    if (pronouns) updateData.pronouns = pronouns;

    // Handle interests - can be string (JSON) or array
    if (interests) {
      try {
        updateData.interests =
          typeof interests === "string" ? JSON.parse(interests) : interests;
      } catch (e) {
        updateData.interests = interests;
      }
    }

    if (musicPreferences) updateData.musicPreferences = musicPreferences;
    if (favoriteShows) updateData.favoriteShows = favoriteShows;
    if (memeVibe) updateData.memeVibe = memeVibe;
    if (community) updateData.community = community;
    if (favoriteSpot) updateData.favoriteSpot = favoriteSpot;
    if (loveLanguage) updateData.loveLanguage = loveLanguage;
    if (quirkyFact) updateData.quirkyFact = quirkyFact;
    if (fantasies) updateData.fantasies = fantasies;
    if (idealDate) updateData.idealDate = idealDate;
    if (hint) updateData.hint = hint;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      pushNotifications,
      emailNotifications,
      showActiveStatus,
      hideDisplayPicture,
    } = req.body;

    const update = {};
    if (pushNotifications !== undefined)
      update["settings.pushNotifications"] = pushNotifications;
    if (emailNotifications !== undefined)
      update["settings.emailNotifications"] = emailNotifications;
    if (showActiveStatus !== undefined)
      update["privacy.showActiveStatus"] = showActiveStatus;
    if (hideDisplayPicture !== undefined)
      update["privacy.hideDisplayPicture"] = hideDisplayPicture;

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error(`Update Settings Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error.message,
    });
  }
};

export const getPotentialMatches = async (req, res) => {
  try {
    const { _id: userId, email, gender } = req.user;

    if (!gender) {
      return res.status(200).json({
        success: true,
        data: { users: [] },
      });
    }

    const emailDomain = email.split("@")[1];
    const emailPattern = new RegExp(
      `@${emailDomain.replace(".", "\\.")}$`,
      "i"
    );

    const oppositeGender =
      gender === "male"
        ? "female"
        : gender === "female"
        ? "male"
        : { $in: ["male", "female", "other"] };

    const userSwipedOn = await Match.find({ user1: userId });
    const mutualMatches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: "matched",
    });

    const excludedUserIds = [
      ...userSwipedOn.map((match) => match.user2),
      ...mutualMatches.map((match) =>
        match.user1.toString() === userId.toString() ? match.user2 : match.user1
      ),
      userId,
    ];

    const potentialMatches = await User.find({
      _id: { $nin: excludedUserIds },
      email: emailPattern,
      gender: oppositeGender,
    })
      .select("-password -guesses")
      .limit(20);

    res.status(200).json({
      success: true,
      data: { users: potentialMatches },
    });
  } catch (error) {
    console.error("Get Potential Matches Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching potential matches",
      error: error.message,
    });
  }
};

// export const getUserById = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId).select("-password -guesses");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     console.error(`Get User Error: ${error.message}`);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching user",
//       error: error.message,
//     });
//   }
// };
