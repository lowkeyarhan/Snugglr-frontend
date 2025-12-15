import Confession from "../models/confessions/Confession";
import Comment from "../models/confessions/Comment";
import Like from "../models/confessions/Like";
import Notification from "../models/preferences/Notification";

// create a new confession
export const createConfession = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Confession text required" });
    }

    // create a new confession
    const confession = await Confession.create({
      user: req.user._id,
      institution: req.user.institution,
      confession: text.trim(),
    });

    // return the created confession
    res.status(201).json({
      success: true,
      data: confession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get all confessions
export const getConfessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // get all confessions for the user's institution
    const confessions = await Confession.find({
      institution: req.user.institution,
    })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * limit)
      .lean();

    // get the total number of confessions for the user's institution
    const total = await Confession.countDocuments({
      institution: req.user.institution,
    });

    // return the confessions
    res.status(200).json({
      success: true,
      data: {
        confessions,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalConfessions: total,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Error fetching confessions",
    });
  }
};

// like a confession (notifications)
export const likeConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const userId = req.user._id;

    // check if the confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if the confession does not exist, return an error
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // check if the user has already liked the confession
    const existingLike = await Like.findOne({
      user: userId,
      targetId: confessionId,
      targetType: "confession",
    });

    // if the user has already liked the confession, remove the like
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Confession.findByIdAndUpdate(confessionId, {
        $inc: { likesCount: -1 },
      });

      return res.status(200).json({ success: true, liked: false });
    }

    // create a new like
    await Like.create({
      user: userId,
      targetId: confessionId,
      targetType: "confession",
    });

    // update the confession likes count
    await Confession.findByIdAndUpdate(confessionId, {
      $inc: { likesCount: 1 },
    });

    // notify confession owner (no self-notify)
    if (confession.user.toString() !== userId.toString()) {
      await Notification.create({
        user: confession.user,
        type: "like",
        title: "Your post is getting attention",
        body: "Someone liked your confession",
        actionUrl: `/confession/${confessionId}`,
        relatedUser: userId,
        relatedPost: confessionId,
      });
    }

    // return the success response
    return res.status(200).json({ success: true, liked: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error liking confession",
    });
  }
};

// comment on a confession (notifications)
export const commentOnConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    // check if the confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if the confession does not exist, return an error
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // create a new comment
    const comment = await Comment.create({
      confession: confessionId,
      user: req.user._id,
      text: text.trim(),
      parentComment: null,
    });

    // notify confession owner
    if (confession.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: confession.user,
        type: "comment",
        title: "New reply",
        body: "Someone replied to your confession",
        actionUrl: `/confession/${confessionId}`,
        relatedUser: req.user._id,
        relatedPost: confessionId,
      });
    }

    // return the created comment
    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding comment",
    });
  }
};

// reply to a comment on a confession (notifications)
export const replyToComment = async (req, res) => {
  try {
    const { confessionId, commentId } = req.params;
    const { text } = req.body;

    // check if the reply text is provided
    if (!text?.trim()) {
      return res.status(400).json({ message: "Reply text required" });
    }

    // check if the confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if the confession does not exist, return an error
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // check if the parent comment exists
    const parentComment = await Comment.findOne({
      _id: commentId,
      confession: confessionId,
    });

    // if the parent comment does not exist, return an error
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // create a new reply
    const reply = await Comment.create({
      confession: confessionId,
      user: req.user._id,
      text: text.trim(),
      parentComment: commentId,
    });

    // notify parent comment owner
    if (parentComment.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: parentComment.user,
        type: "comment",
        title: "New reply",
        body: "Someone replied to your comment",
        actionUrl: `/confession/${confessionId}`,
        relatedUser: req.user._id,
        relatedPost: confessionId,
      });
    }

    // return the created reply
    return res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error replying to comment",
    });
  }
};

// like a comment (notifications)
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // check if the user has already liked the comment
    const existingLike = await Like.findOne({
      user: userId,
      targetId: commentId,
      targetType: "comment",
    });

    // if the user has already liked the comment, remove the like
    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(commentId, {
        $inc: { likesCount: -1 },
      });

      return res.status(200).json({ success: true, liked: false });
    }

    // create a new like
    await Like.create({
      user: userId,
      targetId: commentId,
      targetType: "comment",
    });

    // update the comment likes count
    await Comment.findByIdAndUpdate(commentId, {
      $inc: { likesCount: 1 },
    });

    // notify comment owner (no self-notify)
    if (comment.user.toString() !== userId.toString()) {
      await Notification.create({
        user: comment.user,
        type: "like",
        title: "Your comment got a like",
        body: "Someone liked your comment",
        actionUrl: `/confession/${comment.confession}`,
        relatedUser: userId,
        relatedPost: comment.confession,
      });
    }

    // return the success response
    return res.status(200).json({ success: true, liked: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error liking comment",
    });
  }
};

// get all comments for a confession
export const getCommentsForConfession = async (req, res) => {
  try {
    const { confessionId } = req.params;

    // check if the confession exists
    const confession = await Confession.findOne({
      _id: confessionId,
      institution: req.user.institution,
    });

    // if the confession does not exist, return an error
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // get all comments for the confession
    const comments = await Comment.find({ confession: confessionId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: 1 })
      .lean();

    // return the comments
    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};
