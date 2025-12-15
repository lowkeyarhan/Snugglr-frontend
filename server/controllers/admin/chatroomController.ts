import { Request, Response } from "express";
import ChatRoom from "../../models/chats/ChatRoom";
import Message from "../../models/chats/Message";

// get all chatrooms (admin only)
export const getAllChatrooms = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, status, anonymous } = req.query;

    // build filter
    const filter: any = {};

    // filter by type
    if (type) {
      filter.type = type;
    }

    // filter by status
    if (status) {
      filter.status = status;
    }

    // filter by anonymous
    if (anonymous !== undefined) {
      filter.anonymous = anonymous === "true";
    }

    // get chatrooms with pagination
    const chatrooms = await ChatRoom.find(filter)
      .populate("users", "name username email")
      .populate("institute", "institutionName domain")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // get message count for each chatroom
    const chatroomsWithStats = await Promise.all(
      chatrooms.map(async (chatroom) => {
        const messageCount = await Message.countDocuments({
          chatId: chatroom._id,
        });
        return {
          ...chatroom,
          messageCount,
        };
      })
    );

    // get total count
    const totalChatrooms = await ChatRoom.countDocuments(filter);

    // return chatrooms
    return res.status(200).json({
      success: true,
      data: {
        chatrooms: chatroomsWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalChatrooms,
          totalPages: Math.ceil(totalChatrooms / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching chatrooms",
      error: error.message,
    });
  }
};

// get a single chatroom by ID (admin only)
export const getChatroomById = async (req: Request, res: Response) => {
  try {
    const { chatroomId } = req.params;

    // get chatroom
    const chatroom = await ChatRoom.findById(chatroomId)
      .populate("users", "name username email profilePicture")
      .populate("institute", "institutionName domain")
      .lean();

    // check if chatroom exists
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: "Chatroom not found",
      });
    }

    // get message count
    const messageCount = await Message.countDocuments({
      chatId: chatroomId,
    });

    // get last message
    const lastMessage = await Message.findOne({ chatId: chatroomId })
      .sort({ createdAt: -1 })
      .lean();

    // return chatroom with stats
    return res.status(200).json({
      success: true,
      data: {
        chatroom,
        stats: {
          messageCount,
          lastMessage,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching chatroom",
      error: error.message,
    });
  }
};

// delete a chatroom (admin only)
export const deleteChatroom = async (req: Request, res: Response) => {
  try {
    const { chatroomId } = req.params;

    // check if chatroom exists
    const chatroom = await ChatRoom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: "Chatroom not found",
      });
    }

    // delete all messages in the chatroom
    const deletedMessages = await Message.deleteMany({ chatId: chatroomId });

    // delete the chatroom
    await ChatRoom.findByIdAndDelete(chatroomId);

    // return success
    return res.status(200).json({
      success: true,
      message: "Chatroom deleted successfully",
      data: {
        deletedMessagesCount: deletedMessages.deletedCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting chatroom",
      error: error.message,
    });
  }
};

// get chatroom statistics (admin only)
export const getChatroomStats = async (req: Request, res: Response) => {
  try {
    // get total chatrooms
    const totalChatrooms = await ChatRoom.countDocuments();

    // get chatrooms by type
    const personalChatrooms = await ChatRoom.countDocuments({
      type: "personal",
    });
    const groupChatrooms = await ChatRoom.countDocuments({ type: "group" });

    // get chatrooms by status
    const lockedChatrooms = await ChatRoom.countDocuments({ status: "LOCKED" });
    const activeChatrooms = await ChatRoom.countDocuments({ status: "ACTIVE" });
    const expiredChatrooms = await ChatRoom.countDocuments({
      status: "EXPIRED",
    });

    // get anonymous chatrooms
    const anonymousChatrooms = await ChatRoom.countDocuments({
      anonymous: true,
    });

    // get total messages
    const totalMessages = await Message.countDocuments();

    // return stats
    return res.status(200).json({
      success: true,
      data: {
        totalChatrooms,
        byType: {
          personal: personalChatrooms,
          group: groupChatrooms,
        },
        byStatus: {
          locked: lockedChatrooms,
          active: activeChatrooms,
          expired: expiredChatrooms,
        },
        anonymous: anonymousChatrooms,
        totalMessages,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching chatroom statistics",
      error: error.message,
    });
  }
};
