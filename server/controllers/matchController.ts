import { Request, Response } from "express";
import MatchPool from "../models/matches/MatchPool";
import Match from "../models/matches/Match";
import ChatRoom from "../models/chats/ChatRoom";
import OpeningMoveSession from "../models/matches/OpeningMove";
import Notification from "../models/preferences/Notification";

// try to match a user with another user in the pool
export const tryMatch = async (req: Request, res: Response) => {
  const me = await MatchPool.findOne({ user: req.user._id });
  if (!me) return res.status(400).json({ message: "Not in pool" });

  // find another user in the pool with the same mood
  const other = await MatchPool.findOne({
    institution: me.institution,
    mood: me.mood,
    user: { $ne: req.user._id },
  });

  // if no other user is found, return false
  if (!other) {
    return res.json({ matched: false });
  }

  // remove both users from the pool immediately
  await MatchPool.deleteMany({
    user: { $in: [me.user, other.user] },
  });

  // set expires at to 1 day
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

  // create a new match between the two users
  const match = await Match.create({
    userA: me.user,
    userB: other.user,
    institute: me.institution,
    expiresAt,
  });

  // create a new chat room between the two users
  const chat = await ChatRoom.create({
    institute: me.institution,
    users: [me.user, other.user],
    type: "personal",
    anonymous: true,
    status: "LOCKED",
    expiresAt,
  });

  // if the chat room is not created, return an error
  if (!chat) {
    return res.status(500).json({ message: "Failed to create chat" });
  }

  // create a new opening move session for the chat room
  const openingMove = await OpeningMoveSession.create({
    chatRoomId: chat._id,
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
  });

  // set the opening move session for the chat room
  chat.openingMoveSession = openingMove._id;
  await chat.save();

  // notify both users about the match
  await Notification.insertMany([
    {
      user: me.user,
      type: "match",
      title: "It’s a match 👀",
      body: "You matched with someone from your college",
      actionUrl: `/chat/${chat._id}`,
      relatedUser: other.user,
    },
    {
      user: other.user,
      type: "match",
      title: "It’s a match 👀",
      body: "You matched with someone from your college",
      actionUrl: `/chat/${chat._id}`,
      relatedUser: me.user,
    },
  ]);

  // return the chat room id
  return res.status(200).json({ matched: true, chatId: chat._id.toString() });
};
