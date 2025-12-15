import Notification from "../models/preferences/Notification";
import MatchPool from "../models/matches/MatchPool";
import { Request, Response } from "express";

// user joins/creates a match pool
export const joinMatchPool = async (req: Request, res: Response) => {
  const { mood, description } = req.body;

  // check if mood is provided
  if (!mood) {
    return res.status(400).json({ message: "Mood is required" });
  }

  // set expires at to 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // join / update match pool
  // if the user is already in the pool, update the pool
  // if the user is not in the pool, create a new pool
  await MatchPool.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      institution: req.user.institution,
      mood,
      description: description || null,
      expiresAt,
    },
    { upsert: true, new: true }
  );

  // find someone else in same match pool
  const candidate = await MatchPool.findOne({
    institution: req.user.institution,
    mood,
    user: { $ne: req.user._id },
  }).lean();

  if (candidate) {
    // prevent spam: check recent system notifications
    const alreadyNotified = await Notification.findOne({
      user: candidate.user,
      type: "system",
      createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    });

    if (!alreadyNotified) {
      // create a new system notification
      await Notification.create({
        user: candidate.user,
        type: "system",
        title: "Someone from your college 👀",
        body: "Someone from your college is in the same mood 👀 Want to make the first move?",
        actionUrl: "/mood-match",
        relatedUser: req.user._id,
      });
    }
  }

  return res.status(200).json({ message: "Joined match pool" });
};
