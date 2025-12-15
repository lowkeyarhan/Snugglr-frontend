import { Request, Response } from "express";
import OpeningMoveSession from "../models/matches/OpeningMove";
import ChatRoom from "../models/chats/ChatRoom";

// submit an opening move for a chat room
export const submitOpeningMove = async (req: Request, res: Response) => {
  const { chatId, choice } = req.body;

  // check if the chat room exists and is locked
  const chat = await ChatRoom.findById(chatId);
  if (!chat || chat.status !== "LOCKED") {
    return res.status(400).json({ message: "Chat not locked" });
  }

  // check if the opening move session exists
  const session = await OpeningMoveSession.findOne({
    chatRoomId: chatId,
  });

  // if the opening move session does not exist, return an error
  if (!session) {
    return res.status(404).json({ message: "Session expired" });
  }

  // get the users in the chat room
  const [userA, userB] = chat.users.map((id) => id.toString());

  // check if the user is one of the participants
  if (req.user._id.toString() === userA) {
    session.choices.userA = choice;
  } else if (req.user._id.toString() === userB) {
    session.choices.userB = choice;
  } else {
    return res.status(403).json({ message: "Not your chat" });
  }

  // save the opening move session
  await session.save();

  // if both users have submitted their moves, activate the chat room
  if (session.choices.userA && session.choices.userB) {
    chat.status = "ACTIVE";
    await chat.save();
  }

  // return success
  return res.status(200).json({ success: true });
};
