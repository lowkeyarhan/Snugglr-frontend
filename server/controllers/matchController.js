import Match from "../models/Match.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { createAndEmitNotification } from "../utils/notificationHelper.js";

export const swipe = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    const currentUserId = req.user._id;
    const currentUserGender = req.user.gender;
    const currentUsername = req.user.username;

    console.log("Swipe attempt:", {
      targetUserId,
      action,
      currentUserId,
      currentUsername,
      currentUserGender,
    });

    // Validate input
    if (!targetUserId || !action) {
      return res.status(400).json({
        success: false,
        message: "Please provide targetUserId and action (like/pass)",
      });
    }

    // Can't swipe on yourself
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot swipe on yourself",
      });
    }

    // Get target user to check gender compatibility
    const targetUser = await User.findById(targetUserId).select(
      "gender username"
    );

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    console.log("Target user found:", {
      targetUser: targetUser.username,
      targetGender: targetUser.gender,
    });

    // Validate that usernames are available
    if (!currentUsername) {
      return res.status(400).json({
        success: false,
        message: "Current user username not found",
      });
    }

    if (!targetUser.username) {
      return res.status(400).json({
        success: false,
        message: "Target user username not found",
      });
    }

    // Check gender compatibility for opposite gender matching
    if (currentUserGender && targetUser.gender) {
      const isSameGender = currentUserGender === targetUser.gender;
      const isOppositeGender =
        (currentUserGender === "male" && targetUser.gender === "female") ||
        (currentUserGender === "female" && targetUser.gender === "male");

      // Only allow swipes if genders are opposite (or if current user is "other")
      if (currentUserGender !== "other" && !isOppositeGender) {
        return res.status(400).json({
          success: false,
          message: "Matches are only available between opposite genders",
        });
      }
    }

    // Only process "like" actions (ignore "pass")
    if (action !== "like") {
      return res.status(200).json({
        success: true,
        message: "Pass recorded",
        data: {
          matched: false,
        },
      });
    }

    // Check if target user already liked current user (check both directions)
    const existingMatch = await Match.findOne({
      $or: [
        { user1: targetUserId, user2: currentUserId },
        { user1: currentUserId, user2: targetUserId },
      ],
      status: "pending",
    });

    if (existingMatch) {
      console.log("Found existing match:", existingMatch);
      // It's a mutual match! Update status to "matched" and usernames
      existingMatch.status = "matched";
      existingMatch.user1Username = currentUsername;
      existingMatch.user2Username = targetUser.username;
      await existingMatch.save();

      // Create a chat room for these two users
      const chat = await Chat.create({
        users: [currentUserId, targetUserId],
        revealed: false,
      });

      // Create match notifications for both users
      try {
        await createAndEmitNotification({
          recipient: currentUserId,
          sender: targetUserId,
          type: "new_match",
          title: "It's a Match! 🎉",
          message: "You have a new match! Start chatting now.",
          relatedMatch: existingMatch._id,
          relatedChat: chat._id,
          actionUrl: `/chat/${chat._id}`,
        });

        await createAndEmitNotification({
          recipient: targetUserId,
          sender: currentUserId,
          type: "new_match",
          title: "It's a Match! 🎉",
          message: "You have a new match! Start chatting now.",
          relatedMatch: existingMatch._id,
          relatedChat: chat._id,
          actionUrl: `/chat/${chat._id}`,
        });
      } catch (notifError) {
        console.error(
          `❌ Error creating match notifications: ${notifError.message}`
        );
        // Don't fail the request if notification creation fails
      }

      return res.status(200).json({
        success: true,
        message: "It's a match! 🎉",
        data: {
          matched: true,
          matchId: existingMatch._id,
          chatId: chat._id,
        },
      });
    }

    // Check if there's already a match in either direction to prevent duplicates
    const duplicateMatch = await Match.findOne({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId },
      ],
    });

    if (duplicateMatch) {
      console.log("Duplicate match found, skipping creation");
      return res.status(200).json({
        success: true,
        message: "Like already recorded",
        data: {
          matched: false,
        },
      });
    }

    // No existing match, create a new pending match
    const newMatch = await Match.create({
      user1: currentUserId,
      user1Username: currentUsername,
      user2: targetUserId,
      user2Username: targetUser.username,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Like recorded",
      data: {
        matched: false,
        matchId: newMatch._id,
      },
    });
  } catch (error) {
    console.error(`❌ Swipe Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error processing swipe",
      error: error.message,
    });
  }
};

/**
 * Get all mutual matches for current user
 * GET /api/match/matches
 * Protected route
 */
export const getMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserGender = req.user.gender;

    // If user hasn't set their gender, return empty results
    if (!currentUserGender) {
      return res.status(200).json({
        success: true,
        data: {
          matches: [],
        },
      });
    }

    // Find all matches where current user is involved and status is "matched"
    const matches = await Match.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }],
      status: "matched",
    })
      .populate("user1", "-password -guesses") // Populate user1 details
      .populate("user2", "-password -guesses") // Populate user2 details
      .sort({ updatedAt: -1 }); // Sort by most recent

    // Format response to show the other user in each match, filtering by opposite gender
    const formattedMatches = matches
      .map((match) => {
        const otherUser =
          match.user1._id.toString() === currentUserId.toString()
            ? match.user2
            : match.user1;

        const otherUsername =
          match.user1._id.toString() === currentUserId.toString()
            ? match.user2Username
            : match.user1Username;

        return {
          matchId: match._id,
          user: otherUser,
          username: otherUsername,
          matchedAt: match.updatedAt,
        };
      })
      .filter((match) => {
        // Filter to only show matches with opposite gender
        const otherUserGender = match.user.gender;

        if (currentUserGender === "male" && otherUserGender === "female") {
          return true;
        } else if (
          currentUserGender === "female" &&
          otherUserGender === "male"
        ) {
          return true;
        } else if (currentUserGender === "other") {
          // For "other" gender, allow all matches
          return true;
        }

        return false;
      });

    res.status(200).json({
      success: true,
      data: {
        matches: formattedMatches,
      },
    });
  } catch (error) {
    console.error(`❌ Get Matches Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching matches",
      error: error.message,
    });
  }
};
