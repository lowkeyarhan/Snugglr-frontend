import { Request, Response } from "express";
import User from "../../models/profile/User";
import Confession from "../../models/confessions/Confession";
import Comment from "../../models/confessions/Comment";
import Like from "../../models/confessions/Like";
import Match from "../../models/matches/Match";
import MatchPool from "../../models/matches/MatchPool";
import Notification from "../../models/preferences/Notification";

// get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    // build filter
    const filter: any = {};

    // filter by role
    if (role) {
      filter.role = role;
    }

    // filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // search by name, username, or email
    if (search && typeof search === "string") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // get users with pagination
    const users = await User.find(filter)
      .select("-password")
      .populate("institution", "institutionName domain")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // get total count
    const totalUsers = await User.countDocuments(filter);

    // return users
    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalUsers,
          totalPages: Math.ceil(totalUsers / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// get a single user by ID (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // get user
    const user = await User.findById(userId)
      .select("-password")
      .populate("institution", "institutionName domain")
      .lean();

    // check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // get user stats
    const [confessionsCount, commentsCount, matchesCount] = await Promise.all([
      Confession.countDocuments({ user: userId }),
      Comment.countDocuments({ user: userId }),
      Match.countDocuments({
        $or: [{ userA: userId }, { userB: userId }],
      }),
    ]);

    // return user with stats
    return res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          confessionsCount,
          commentsCount,
          matchesCount,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// delete a user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // prevent deletion of superadmins
    if (user.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete superadmin",
      });
    }

    // prevent self-deletion
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete yourself",
      });
    }

    // delete user's confessions
    await Confession.deleteMany({ user: userId });

    // delete user's comments
    await Comment.deleteMany({ user: userId });

    // delete user's likes
    await Like.deleteMany({ user: userId });

    // delete user's matches
    await Match.deleteMany({
      $or: [{ userA: userId }, { userB: userId }],
    });

    // delete user from match pool if they're in it
    await MatchPool.deleteOne({ user: userId });

    // delete user's notifications
    await Notification.deleteMany({ user: userId });

    // delete the user
    await User.findByIdAndDelete(userId);

    // return success
    return res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// update user status (admin only)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // check if isActive is provided
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive field is required",
      });
    }

    // update user status
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("-password");

    // check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // return updated user
    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    });
  }
};
