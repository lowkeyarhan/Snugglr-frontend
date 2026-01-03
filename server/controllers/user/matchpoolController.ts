import { Request, Response } from "express";
import MatchPool from "../../models/matches/MatchPool";
import Match from "../../models/matches/Match";
import ChatRoom from "../../models/chats/ChatRoom";
import OpeningMoveSession from "../../models/matches/OpeningMove";
import Notification from "../../models/preferences/Notification";

/**
 * Get current user's match pool entry (if any)
 */
export const getMyMatchPool = async (req: Request, res: Response) => {
  const entry = await MatchPool.findOne({
    user: req.user._id,
  }).lean();

  return res.status(200).json({ entry });
};

/**
 * Join or update match pool
 * NOTE: This does NOT create matches or send notifications
 */
export const joinMatchPool = async (req: Request, res: Response) => {
  const { mood, description } = req.body;

  if (!mood) {
    return res.status(400).json({ message: "Mood is required" });
  }

  // short TTL = spontaneous + clean pool
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

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

  return res.status(200).json({ message: "Joined match pool" });
};

/**
 * Leave match pool
 */
export const leaveMatchPool = async (req: Request, res: Response) => {
  await MatchPool.deleteOne({ user: req.user._id });
  return res.status(200).json({ message: "Left match pool" });
};

/**
 * Try to match with someone from the pool
 * THIS is the only place that creates:
 * - Match
 * - ChatRoom
 * - OpeningMoveSession
 */
export const tryMatch = async (req: Request, res: Response) => {
  const me = await MatchPool.findOne({ user: req.user._id });

  if (!me) {
    return res.status(400).json({ message: "Not in pool" });
  }

  const candidate = await MatchPool.findOne({
    institution: me.institution,
    mood: me.mood,
    user: { $ne: me.user },
  });

  if (!candidate) {
    return res.status(200).json({ matched: false });
  }

  // remove both users from pool atomically
  await MatchPool.deleteMany({
    user: { $in: [me.user, candidate.user] },
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h chat

  // create match record
  const match = await Match.create({
    userA: me.user,
    userB: candidate.user,
    institute: me.institution,
    expiresAt,
  });

  // create locked anonymous chat
  const chat = await ChatRoom.create({
    institute: me.institution,
    users: [me.user, candidate.user],
    type: "personal",
    anonymous: true,
    status: "LOCKED",
    expiresAt,
  });

  // create opening move session
  const openingMove = await OpeningMoveSession.create({
    chatRoomId: chat._id,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins to choose
  });

  chat.openingMoveSession = openingMove._id;
  await chat.save();

  // notify both users AFTER match exists
  await Notification.insertMany([
    {
      user: me.user,
      type: "system",
      title: "It’s a match 👀",
      body: "Someone from your college is in the same mood 👀 Want to make the first move?",
      actionUrl: `/chats/${chat._id}`,
    },
    {
      user: candidate.user,
      type: "system",
      title: "It’s a match 👀",
      body: "Someone from your college is in the same mood 👀 Want to make the first move?",
      actionUrl: `/chats/${chat._id}`,
    },
  ]);

  return res.status(200).json({
    matched: true,
    chatId: chat._id,
  });
};
