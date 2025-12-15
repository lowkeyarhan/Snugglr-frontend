import { Request, Response } from "express";
import Chat from "../models/chats/ChatRoom";
import User from "../models/profile/User";

// validate that all users belong to the same institution
const validateSameInstitution = async (userIds: string[]): Promise<string> => {
  // find the users by their IDs
  const users = await User.find({
    _id: { $in: userIds },
  }).select("institution");

  // check if the users exist
  if (users.length !== userIds.length) {
    throw new Error("Invalid users provided");
  }

  // check if the users belong to the same institution
  const instituteSet = new Set(users.map((u) => u.institution?.toString()));

  if (instituteSet.size !== 1) {
    throw new Error("Users must belong to the same institution");
  }

  return users[0]?.institution?.toString();
};

// create a new personal chat
export const createPersonalChat = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;

    // check if userIds is an array and has exactly 2 users
    if (!Array.isArray(userIds) || userIds.length !== 2) {
      return res
        .status(400)
        .json({ message: "Personal chat requires exactly 2 users" });
    }

    // validate that all users belong to the same institution
    const institution = await validateSameInstitution(userIds);

    // sort users for consistency
    const sortedUsers = [...userIds].sort((a, b) => a.localeCompare(b));

    // check if chat already exists
    const existingChat = await Chat.findOne({
      type: "personal",
      institute: institution,
      users: sortedUsers,
    });

    // if chat already exists, return it
    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // create new chat room
    const chat = await Chat.create({
      type: "personal",
      institute: institution,
      users: sortedUsers,
    });

    return res.status(201).json(chat);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// create a new group chat
export const createGroupChat = async (req: Request, res: Response) => {
  try {
    const { userIds, groupName } = req.body;

    // check if userIds is an array and has at least 3 users
    if (!Array.isArray(userIds) || userIds.length < 3) {
      return res
        .status(400)
        .json({ message: "Group chat needs at least 3 users" });
    }

    if (!groupName?.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // validate that all users belong to the same institution
    const institution = await validateSameInstitution(userIds);

    // create new chat room
    const chat = await Chat.create({
      type: "group",
      institute: institution,
      users: userIds,
      groupName,
    });

    return res.status(201).json(chat);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// get all chatrooms for logged-in user
export const getMyChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // get all chatrooms for the logged-in user
    const chats = await Chat.find({
      users: userId,
    })
      .populate("users", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json(chats);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// get a single chatroom by ID
export const getChatById = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // get the chatroom by ID
    const chat = await Chat.findOne({
      _id: chatId,
      users: userId,
    }).populate("users", "name");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(chat);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// add a user to a group chat
export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const { chatId, userIdToAdd } = req.body;

    // get the chatroom by ID
    const chat = await Chat.findById(chatId);

    // check if the chat exists and is a group chat
    if (!chat || chat.type !== "group") {
      return res.status(400).json({ message: "Invalid group chat" });
    }

    // check if the user is already in the chat
    if (chat.users.some((id) => id.toString() === userIdToAdd)) {
      return res.status(400).json({ message: "User already in group" });
    }

    // validate that the user belongs to the same institution
    const userToAdd = await User.findById(userIdToAdd).select("institution");

    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if the user belongs to the same institution
    if (userToAdd.institution?.toString() !== chat.institute?.toString()) {
      return res.status(400).json({
        message: "User belongs to a different institution",
      });
    }

    // add the user to the chat
    chat.users.push(userIdToAdd);
    await chat.save();

    return res.status(200).json(chat);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// remove a user from a group chat
export const removeUserFromGroup = async (req: Request, res: Response) => {
  try {
    const { chatId, userIdToRemove } = req.body;

    // get the chatroom by ID
    const chat = await Chat.findById(chatId);

    // check if the chat exists and is a group chat

    if (!chat || chat.type !== "group") {
      return res.status(400).json({ message: "Invalid group chat" });
    }

    // check if the chat has at least 2 users
    if (chat.users.length <= 1) {
      return res.status(400).json({
        message: "Cannot remove the last user from group",
      });
    }

    // remove the user from the chat
    chat.users = chat.users.filter((id) => id.toString() !== userIdToRemove);

    await chat.save();

    return res.status(200).json(chat);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
