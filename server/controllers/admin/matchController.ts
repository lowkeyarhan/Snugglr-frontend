import { Request, Response } from "express";
import Match from "../../models/matches/Match";
import ChatRoom from "../../models/chats/ChatRoom";

// get all matches (admin only)
export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // build filter
    const filter: any = {};

    // filter by status
    if (status) {
      filter.status = status;
    }

    // get matches with pagination
    const matches = await Match.find(filter)
      .populate("userA", "name username email")
      .populate("userB", "name username email")
      .populate("institute", "institutionName domain")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // get total count
    const totalMatches = await Match.countDocuments(filter);

    // return matches
    return res.status(200).json({
      success: true,
      data: {
        matches,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalMatches,
          totalPages: Math.ceil(totalMatches / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching matches",
      error: error.message,
    });
  }
};

// get a single match by ID (admin only)
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    // get match
    const match = await Match.findById(matchId)
      .populate("userA", "name username email profilePicture")
      .populate("userB", "name username email profilePicture")
      .populate("institute", "institutionName domain")
      .lean();

    // check if match exists
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // find associated chatroom (if exists)
    const chatroom = await ChatRoom.findOne({
      users: { $all: [match.userA, match.userB] },
      anonymous: true,
    }).lean();

    // return match with chatroom info
    return res.status(200).json({
      success: true,
      data: {
        match,
        chatroom,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching match",
      error: error.message,
    });
  }
};

// delete a match (admin only)
export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    // check if match exists
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // delete the match
    await Match.findByIdAndDelete(matchId);

    // return success
    return res.status(200).json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting match",
      error: error.message,
    });
  }
};

// get match statistics (admin only)
export const getMatchStats = async (req: Request, res: Response) => {
  try {
    // get total matches
    const totalMatches = await Match.countDocuments();

    // get matches by status
    const pendingMatches = await Match.countDocuments({ status: "PENDING" });
    const activeMatches = await Match.countDocuments({ status: "ACTIVE" });
    const expiredMatches = await Match.countDocuments({ status: "EXPIRED" });

    // get matches created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchesToday = await Match.countDocuments({
      createdAt: { $gte: today },
    });

    // get matches created this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const matchesThisWeek = await Match.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    // return stats
    return res.status(200).json({
      success: true,
      data: {
        totalMatches,
        byStatus: {
          pending: pendingMatches,
          active: activeMatches,
          expired: expiredMatches,
        },
        matchesToday,
        matchesThisWeek,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching match statistics",
      error: error.message,
    });
  }
};
