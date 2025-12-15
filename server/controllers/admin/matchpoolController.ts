import { Request, Response } from "express";
import MatchPool from "../../models/matches/MatchPool";

// get all match pool entries (admin only)
export const getAllMatchPoolEntries = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, mood } = req.query;

    // build filter
    const filter: any = {};

    // filter by mood
    if (mood && typeof mood === "string") {
      filter.mood = mood;
    }

    // get match pool entries with pagination
    const entries = await MatchPool.find(filter)
      .populate("user", "name username email")
      .populate("institution", "institutionName domain")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // get total count
    const totalEntries = await MatchPool.countDocuments(filter);

    // return entries
    return res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalEntries,
          totalPages: Math.ceil(totalEntries / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching match pool entries",
      error: error.message,
    });
  }
};

// get a single match pool entry by ID (admin only)
export const getMatchPoolEntryById = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;

    // get match pool entry
    const entry = await MatchPool.findById(entryId)
      .populate("user", "name username email profilePicture")
      .populate("institution", "institutionName domain")
      .lean();

    // check if entry exists
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Match pool entry not found",
      });
    }

    // return entry
    return res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching match pool entry",
      error: error.message,
    });
  }
};

// delete a match pool entry (admin only)
export const deleteMatchPoolEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;

    // check if entry exists
    const entry = await MatchPool.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Match pool entry not found",
      });
    }

    // delete the entry
    await MatchPool.findByIdAndDelete(entryId);

    // return success
    return res.status(200).json({
      success: true,
      message: "Match pool entry deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting match pool entry",
      error: error.message,
    });
  }
};

// get match pool statistics (admin only)
export const getMatchPoolStats = async (req: Request, res: Response) => {
  try {
    // get total entries
    const totalEntries = await MatchPool.countDocuments();

    // get entries by mood
    const moodGroups = await MatchPool.aggregate([
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // get entries created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entriesToday = await MatchPool.countDocuments({
      createdAt: { $gte: today },
    });

    // get entries expiring soon (within 24 hours)
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const expiringSoon = await MatchPool.countDocuments({
      expiresAt: { $lte: tomorrow },
    });

    // return stats
    return res.status(200).json({
      success: true,
      data: {
        totalEntries,
        byMood: moodGroups,
        entriesToday,
        expiringSoon,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching match pool statistics",
      error: error.message,
    });
  }
};
