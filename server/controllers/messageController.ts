import { Request, Response } from "express";
import Message from "../models/chats/Message";
import ChatRoom from "../models/chats/ChatRoom";

// get messages for a chatroom
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // check if the chat room exists
    const chat = await ChatRoom.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // check if the user is a participant
    const isParticipant = chat.users.some(
      (id) => id.toString() === currentUserId.toString()
    );

    // if the user is not a participant, return an error
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this chat",
      });
    }

    // get the messages
    let query = Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // if the chat room is not anonymous, populate the sender
    if (!chat.anonymous) {
      query = query.populate("sender", "name username image");
    }

    // get the messages
    const messages = await query;

    // get the total number of messages
    const totalMessages = await Message.countDocuments({ chatId });

    // return the messages
    return res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          totalMessages,
          totalPages: Math.ceil(totalMessages / limit),
        },
        chatStatus: chat.status,
        anonymous: chat.anonymous,
      },
    });
  } catch (error: any) {
    // return an error
    return res.status(500).json({
      success: false,
      message: "Error fetching messages",
    });
  }
};

// send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;

    // check if the text is provided
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // check if the chat room exists
    const chat = await ChatRoom.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // check if the user is a participant
    const isParticipant = chat.users.some(
      (id) => id.toString() === currentUserId.toString()
    );

    // if the user is not a participant, return an error
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to send messages in this chat",
      });
    }

    // check if the chat room is active
    if (chat.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Chat is locked or expired",
      });
    }

    // create a new message
    const message = await Message.create({
      chatId,
      sender: currentUserId,
      text: text.trim(),
    });

    // if the chat room is not anonymous, populate the sender
    if (!chat.anonymous) {
      await message.populate("sender", "name username image");
    }

    // return the message
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error: any) {
    // return an error
    return res.status(500).json({
      success: false,
      message: "Error sending message",
    });
  }
};
