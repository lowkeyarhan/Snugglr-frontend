import { Request, Response } from "express";
import ChatRoom from "../models/chats/ChatRoom";
import Message from "../models/chats/Message";

// get all chats for a user
export const getUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // get chats user participates in (exclude expired)
    const chats = await ChatRoom.find({
      users: userId,
      status: { $ne: "EXPIRED" },
    })
      .sort({ updatedAt: -1 })
      .lean();

    // get the chat ids
    const chatIds = chats.map((c) => c._id);

    // get the last message per chat
    const lastMessages = await Message.aggregate([
      { $match: { chatId: { $in: chatIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // get the last message map
    const lastMessageMap = new Map(
      lastMessages.map((m) => [m._id.toString(), m.lastMessage])
    );

    // get the response
    const response = chats.map((chat) => {
      const lastMessage = lastMessageMap.get(chat._id.toString());

      let displayName: string | null = null;

      if (chat.type === "group") {
        displayName = chat.groupName || "Group";
      } else if (chat.anonymous) {
        // anonymous chats NEVER resolve real user data
        displayName = "Anonymous";
      } else {
        // normal DM -> frontend can resolve real user
        displayName = null;
      }

      // get the response
      return {
        chatId: chat._id,
        type: chat.type,
        status: chat.status,
        anonymous: chat.anonymous,
        displayName,
        lastMessage: lastMessage
          ? {
              text:
                lastMessage.type === "system"
                  ? "System message"
                  : lastMessage.text,
              createdAt: lastMessage.createdAt,
            }
          : null,
        expiresAt: chat.expiresAt,
      };
    });

    // return the response
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    // return an error
    return res.status(500).json({
      success: false,
      message: "Error fetching chats",
    });
  }
};

// get metadata for a single chat room
export const getChatRoom = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // find the chat room
    const chat = await ChatRoom.findById(chatId);

    // if the chat room does not exist, return an error
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // check if the user is a participant
    const isParticipant = chat.users.some(
      (id) => id.toString() === userId.toString()
    );

    // if the user is not a participant, return an error
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this chat",
      });
    }

    // return the chat room
    return res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        type: chat.type,
        status: chat.status,
        anonymous: chat.anonymous,
        expiresAt: chat.expiresAt,
        openingMoveSession: chat.openingMoveSession,
      },
    });
  } catch (error: any) {
    // return an error
    return res.status(500).json({
      success: false,
      message: "Error fetching chat",
    });
  }
};
