import Confession from "../models/Confession.js";
import User from "../models/User.js";
import AllowedDomain from "../models/AllowedDomain.js";
import { createAndEmitNotification } from "../utils/notificationHelper.js";

export const createConfession = async (req, res) => {
  try {
    const { text } = req.body;
    const username = req.user.username;
    const userEmail = req.user.email;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Confession text is required",
      });
    }

    // Get the user's domain from their email
    const emailDomain = userEmail.split("@")[1]?.toLowerCase();
    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Find the allowed domain
    const allowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (!allowedDomain) {
      return res.status(403).json({
        success: false,
        message: "Domain not authorized for confessions",
      });
    }

    const newConfession = await Confession.create({
      username: username,
      confession: text.trim(),
      allowedDomain: allowedDomain._id,
    });

    res.status(201).json({
      success: true,
      message: "Confession posted successfully",
      data: {
        confession: newConfession,
      },
    });
  } catch (error) {
    console.error(`Error creating confession: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error creating confession",
      error: error.message,
    });
  }
};

export const getConfessions = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { page = 1, limit = 20 } = req.query;

    // Get the user's domain from their email
    const emailDomain = userEmail.split("@")[1]?.toLowerCase();
    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Find the allowed domain
    const allowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (!allowedDomain) {
      return res.status(403).json({
        success: false,
        message: "Domain not authorized for confessions",
      });
    }

    const confessions = await Confession.find({
      allowedDomain: allowedDomain._id,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("comments.user", "username name image")
      .populate("comments.replies.user", "username name image")
      .populate("allowedDomain", "domain institutionName")
      .lean();

    const total = await Confession.countDocuments({
      allowedDomain: allowedDomain._id,
    });

    const confessionsWithCounts = confessions.map((confession) => ({
      ...confession,
      commentsCount: confession.comments.length,
      hasLiked: confession.likedBy
        ? confession.likedBy.some(
            (id) => id.toString() === req.user._id.toString()
          )
        : false,
    }));

    res.status(200).json({
      success: true,
      data: {
        confessions: confessionsWithCounts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalConfessions: total,
      },
    });
  } catch (error) {
    console.error(`Error fetching confessions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching confessions",
      error: error.message,
    });
  }
};

export const likeConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const userId = req.user._id;

    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    // Check if user's domain matches confession's domain
    const userEmail = req.user.email;
    const emailDomain = userEmail.split("@")[1]?.toLowerCase();

    const userAllowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (
      !userAllowedDomain ||
      confession.allowedDomain.toString() !== userAllowedDomain._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot like confessions from other domains",
      });
    }

    // Check if user has already liked this confession
    const hasLiked = confession.likedBy
      ? confession.likedBy.some((id) => id.toString() === userId.toString())
      : false;
    let action = "";

    // Initialize likedBy array if it doesn't exist
    if (!confession.likedBy) {
      confession.likedBy = [];
    }

    if (hasLiked) {
      // Unlike: remove user from likedBy array and decrement count
      confession.likedBy = confession.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      confession.likesCount = Math.max(0, confession.likesCount - 1);
      action = "unliked";
    } else {
      // Like: add user to likedBy array and increment count
      confession.likedBy.push(userId);
      confession.likesCount += 1;
      action = "liked";

      // Create notification for the confession author (only when liking)
      try {
        const confessionAuthor = await User.findOne({
          username: confession.username,
        });

        if (
          confessionAuthor &&
          confessionAuthor._id.toString() !== req.user._id.toString()
        ) {
          await createAndEmitNotification({
            recipient: confessionAuthor._id,
            sender: req.user._id,
            type: "confession_like",
            title: "New Like on Confession",
            message: `Someone liked your confession`,
            relatedConfession: confession._id,
            actionUrl: `/confessions/${confession._id}`,
          });
        }
      } catch (notifError) {
        console.error(
          `Error creating like notification: ${notifError.message}`
        );
        // Don't fail the request if notification creation fails
      }
    }

    await confession.save();

    return res.status(200).json({
      success: true,
      message: `Confession ${action}`,
      data: {
        likesCount: confession.likesCount,
        hasLiked: !hasLiked, // Return the new state
      },
    });
  } catch (error) {
    console.error(`Error liking confession: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error liking confession",
      error: error.message,
    });
  }
};

export const commentOnConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    // Check if user's domain matches confession's domain
    const userEmail = req.user.email;
    const emailDomain = userEmail.split("@")[1]?.toLowerCase();

    const userAllowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (
      !userAllowedDomain ||
      confession.allowedDomain.toString() !== userAllowedDomain._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot comment on confessions from other domains",
      });
    }

    confession.comments.push({
      user: userId,
      text: text.trim(),
    });

    await confession.save();

    const populatedConfession = await Confession.findById(confessionId)
      .populate("comments.user", "username name image")
      .lean();

    // Create notification for the confession author
    try {
      const confessionAuthor = await User.findOne({
        username: confession.username,
      });

      if (
        confessionAuthor &&
        confessionAuthor._id.toString() !== userId.toString()
      ) {
        await createAndEmitNotification({
          recipient: confessionAuthor._id,
          sender: userId,
          type: "confession_comment",
          title: "New Comment on Confession",
          message: `${req.user.username} commented on your confession`,
          relatedConfession: confession._id,
          actionUrl: `/confessions/${confession._id}`,
        });
      }
    } catch (notifError) {
      console.error(
        `Error creating comment notification: ${notifError.message}`
      );
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comments: populatedConfession.comments,
        commentsCount: populatedConfession.comments.length,
      },
    });
  } catch (error) {
    console.error(`Error adding comment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

// Like/unlike comment
export const likeComment = async (req, res) => {
  try {
    const { confessionId, commentId } = req.params;
    const userId = req.user._id;

    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    const comment = confession.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user has already liked this comment
    const hasLiked = comment.likedBy
      ? comment.likedBy.some((id) => id.toString() === userId.toString())
      : false;
    let action = "";

    // Initialize likedBy array if it doesn't exist
    if (!comment.likedBy) {
      comment.likedBy = [];
    }

    if (hasLiked) {
      // Unlike: remove user from likedBy array and decrement count
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      action = "unliked";
    } else {
      // Like: add user to likedBy array and increment count
      comment.likedBy.push(userId);
      comment.likesCount += 1;
      action = "liked";
    }

    await confession.save();

    return res.status(200).json({
      success: true,
      message: `Comment ${action}`,
      data: {
        likesCount: comment.likesCount,
        hasLiked: !hasLiked,
      },
    });
  } catch (error) {
    console.error(`Error liking comment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error liking comment",
      error: error.message,
    });
  }
};

// Reply to comment
export const replyToComment = async (req, res) => {
  try {
    const { confessionId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    const comment = confession.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user's domain matches confession's domain
    const userEmail = req.user.email;
    const emailDomain = userEmail.split("@")[1]?.toLowerCase();

    const userAllowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (
      !userAllowedDomain ||
      confession.allowedDomain.toString() !== userAllowedDomain._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Cannot reply to comments from other domains",
      });
    }

    comment.replies.push({
      user: userId,
      text: text.trim(),
    });

    await confession.save();

    const populatedConfession = await Confession.findById(confessionId)
      .populate("comments.user", "username name image")
      .populate("comments.replies.user", "username name image")
      .lean();

    const populatedComment = populatedConfession.comments.find(
      (c) => c._id.toString() === commentId
    );

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: {
        replies: populatedComment.replies,
        repliesCount: populatedComment.replies.length,
      },
    });
  } catch (error) {
    console.error(`Error adding reply: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error adding reply",
      error: error.message,
    });
  }
};

// Like/unlike reply
export const likeReply = async (req, res) => {
  try {
    const { confessionId, commentId, replyId } = req.params;
    const userId = req.user._id;

    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    const comment = confession.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: "Reply not found",
      });
    }

    // Check if user has already liked this reply
    const hasLiked = reply.likedBy
      ? reply.likedBy.some((id) => id.toString() === userId.toString())
      : false;
    let action = "";

    // Initialize likedBy array if it doesn't exist
    if (!reply.likedBy) {
      reply.likedBy = [];
    }

    if (hasLiked) {
      // Unlike: remove user from likedBy array and decrement count
      reply.likedBy = reply.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      reply.likesCount = Math.max(0, reply.likesCount - 1);
      action = "unliked";
    } else {
      // Like: add user to likedBy array and increment count
      reply.likedBy.push(userId);
      reply.likesCount += 1;
      action = "liked";
    }

    await confession.save();

    return res.status(200).json({
      success: true,
      message: `Reply ${action}`,
      data: {
        likesCount: reply.likesCount,
        hasLiked: !hasLiked,
      },
    });
  } catch (error) {
    console.error(`Error liking reply: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error liking reply",
      error: error.message,
    });
  }
};

// Get all comments (for admin)
export const getAllCommentsAdmin = async (req, res) => {
  try {
    const confessions = await Confession.find({})
      .populate("allowedDomain", "institutionName domain")
      .populate("comments.user", "username name")
      .populate("comments.replies.user", "username name")
      .sort({ createdAt: -1 })
      .lean();

    // Return all confessions with their comments (including empty ones)
    const confessionsWithComments = confessions.map((confession) => {
      const community =
        confession.allowedDomain?.institutionName || "Unknown community";

      const formattedComments = (confession.comments || []).map((comment) => ({
        _id: comment._id,
        username: comment.user?.username || comment.user?.name || "Anonymous",
        userId: comment.user?._id,
        text: comment.text,
        createdAt: comment.createdAt,
        likesCount: comment.likesCount || 0,
        replies: (comment.replies || []).map((reply) => ({
          _id: reply._id,
          text: reply.text,
          createdAt: reply.createdAt,
          username: reply.user?.username || reply.user?.name || "Anonymous",
          userId: reply.user?._id,
          likesCount: reply.likesCount || 0,
        })),
        repliesCount: comment.replies ? comment.replies.length : 0,
      }));

      return {
        _id: confession._id,
        confession: confession.confession,
        username: confession.username,
        community,
        likesCount: confession.likesCount || 0,
        commentsCount: confession.comments?.length || 0,
        comments: formattedComments,
        createdAt: confession.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: confessionsWithComments.length,
      data: {
        confessions: confessionsWithComments,
      },
    });
  } catch (error) {
    console.error(`Error fetching all comments: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Delete comment (for admin)
export const deleteCommentAdmin = async (req, res) => {
  try {
    const { confessionId, commentId } = req.params;

    const confession = await Confession.findById(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    const comment = confession.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.deleteOne();
    await confession.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting comment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// Automatic cleanup function to delete confessions older than 10 days
export const cleanupOldConfessions = async () => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const result = await Confession.deleteMany({
      createdAt: { $lt: tenDaysAgo },
    });
    console.log(
      `Cleaned up ${result.deletedCount} confessions older than 10 days`
    );
    return result.deletedCount;
  } catch (error) {
    console.error(`Error cleaning up old confessions: ${error.message}`);
    throw error;
  }
};

// Manual cleanup endpoint (for testing or manual triggers)
export const manualCleanup = async (req, res) => {
  try {
    const deletedCount = await cleanupOldConfessions();

    res.status(200).json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} old confessions`,
      deletedCount,
    });
  } catch (error) {
    console.error(`Error in manual cleanup: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error during cleanup",
      error: error.message,
    });
  }
};

// Get all confessions (for admin)
export const getAllConfessionsAdmin = async (req, res) => {
  try {
    const confessions = await Confession.find({})
      .populate("allowedDomain", "institutionName domain")
      .populate("comments.user", "username name")
      .sort({ createdAt: -1 })
      .lean();

    const formattedConfessions = confessions.map((confession) => ({
      _id: confession._id,
      confession: confession.confession,
      username: confession.username,
      community: confession.allowedDomain?.institutionName || "N/A",
      domain: confession.allowedDomain?.domain || "N/A",
      likesCount: confession.likesCount,
      commentsCount: confession.comments?.length || 0,
      createdAt: confession.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedConfessions.length,
      data: {
        confessions: formattedConfessions,
      },
    });
  } catch (error) {
    console.error(`Error fetching all confessions: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching confessions",
      error: error.message,
    });
  }
};

// Delete confession (for admin)
export const deleteConfessionAdmin = async (req, res) => {
  try {
    const { confessionId } = req.params;

    const confession = await Confession.findByIdAndDelete(confessionId);

    if (!confession) {
      return res.status(404).json({
        success: false,
        message: "Confession not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Confession deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting confession: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting confession",
      error: error.message,
    });
  }
};
