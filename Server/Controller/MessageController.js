// Controller/MessageController.js
import mongoose from "mongoose";
import User from "../Models/UserModel.js";
import Message from "../Models/MessageModel.js";
import cloudinary from "../lib/Cloudinary.js";
import { userSocketMap } from "../Server.js"; // map built in server.js

// Get users for sidebar
export const GetUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};
    await Promise.all(
      filteredUsers.map(async (u) => {
        const msgs = await Message.find({
          senderId: u._id,
          receiverId: userId,
          seen: false,
        });
        if (msgs.length) unseenMessages[u._id] = msgs.length;
      })
    );

    return res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.error("GetUserForSidebar Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for selected user
export const GetMessages = async (req, res) => {
  try {
    const selectedUserId = req.params.id;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // chronological

    // mark incoming from selectedUser as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("GetMessages Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// mark single message as seen
export const MarkMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }
    await Message.findByIdAndUpdate(id, { seen: true });
    return res.json({ success: true });
  } catch (error) {
    console.error("MarkMessageAsSeen Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send message controller
export const SendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user && req.user._id ? req.user._id : null;

    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid receiver id" });
    }

    if (!text && !image) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    // if image is base64, upload to cloudinary (optional)
    let imageUrl = null;
    if (image) {
      // if you already upload client-side, skip. This is optional.
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse?.secure_url || null;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl || "",
    });

    // Emit to receiver if online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId && req.io) {
      req.io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Also emit back to sender socket (optional) so sender receives server message too
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId && req.io) {
      req.io.to(senderSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Delete Message Controller
export const DeleteMessage = async (req, res) => {
  const { id } = req.params;
  const { scope } = req.query; // "me" or "all"
  const userId = req.user._id;
  const io = req.io;

  try {
    // 1. Find the message first
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 2. Handle scope logic BEFORE deletion
    if (scope === "me") {
      if (!message.deletedFor) message.deletedFor = [];
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
      }
      await message.save();
    }

    if (scope === "all") {
      // Only sender can delete for everyone
      if (String(message.senderId) !== String(userId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      message.deletedForEveryone = true;
      await message.save();
    }

    // 3. Emit socket event to both sender & receiver
    io.to(message.senderId.toString()).emit("messageDeleted", { id, scope });
    io.to(message.receiverId.toString()).emit("messageDeleted", { id, scope });

    // 4. If scope=all, optionally delete from DB
    if (scope === "all") {
      await Message.findByIdAndDelete(id);
    }

    res.json({ message: "Message deleted", success: true, id, scope });
  } catch (error) {
    console.error("DeleteMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};


