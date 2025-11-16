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
    const currentUserId = req.user._id;
    const currentUserEmail = req.user.email;
    const currentUserGender = req.user.gender;

    // Extract email domain from current user's email
    const emailDomain = currentUserEmail.split("@")[1];

    console.log("🔍 Getting potential matches for user:", {
      userId: currentUserId,
      email: currentUserEmail,
      emailDomain: emailDomain,
      gender: currentUserGender,
    });

    // If user hasn't set their gender, return empty results
    if (!currentUserGender) {
      console.log("❌ User has no gender set");
      return res.status(200).json({
        success: true,
        data: {
          users: [],
        },
      });
    }

    // Get all matches where:
    // 1. Current user initiated the swipe (user1), OR
    // 2. Status is "matched" (mutual match - should be hidden from both)
    const existingMatches = await Match.find({
      $or: [
        { user1: currentUserId }, // Current user already swiped
        {
          $or: [{ user1: currentUserId }, { user2: currentUserId }],
          status: "matched", // Mutual matches
        },
      ],
    });

    // Extract user IDs to exclude
    const swipedUserIds = existingMatches.map((match) =>
      match.user1.toString() === currentUserId.toString()
        ? match.user2
        : match.user1
    );

    console.log(
      `📝 Excluding ${swipedUserIds.length} users (already swiped or matched)`
    );

    // Determine opposite gender for filtering
    let oppositeGender;
    if (currentUserGender === "male") {
      oppositeGender = "female";
    } else if (currentUserGender === "female") {
      oppositeGender = "male";
    } else {
      // For "other" gender, we'll allow matching with all genders
      oppositeGender = { $in: ["male", "female", "other"] };
    }

    console.log(
      `🔎 Searching for users with gender: ${JSON.stringify(oppositeGender)}`
    );

    // Create regex pattern to match email domain
    const emailDomainPattern = new RegExp(
      `@${emailDomain.replace(".", "\\.")}$`,
      "i"
    );

    // First, check how many users exist with the same email domain and opposite gender
    const totalOppositeGenderInDomain = await User.countDocuments({
      email: emailDomainPattern,
      gender: oppositeGender,
      _id: { $ne: currentUserId },
    });

    console.log(
      `👥 Total ${oppositeGender} users with @${emailDomain}: ${totalOppositeGenderInDomain}`
    );

    const potentialMatches = await User.find({
      _id: {
        $nin: [...swipedUserIds, currentUserId],
      },
      email: emailDomainPattern,
      gender: oppositeGender,
    })
      .select("-password -guesses")
      .limit(20);

    console.log(`✅ Found ${potentialMatches.length} potential matches`);

    res.status(200).json({
      success: true,
      data: {
        users: potentialMatches,
      },
    });
  } catch (error) {
    console.error(`❌ Get Potential Matches Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching potential matches",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -guesses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(`Get User Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};
