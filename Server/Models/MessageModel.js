// import mongoose from "mongoose";

// const MessageSchema = new mongoose.Schema(
//   {
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     receiverId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: { type: String },
//     image: { type: String },
//     seen: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// const Message = mongoose.model("Message", MessageSchema);

// export default Message;



import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Content
    text: { type: String },
    image: { type: String },
    file: { type: String }, // docs, pdf, etc.
    audio: { type: String },
    video: { type: String },

    // Message Type
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },

    // Reply Feature
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Status (sent, delivered, seen)
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // Delete flags
    deletedForEveryone: { type: Boolean, default: false },
    deletedForUser: {
      type: Map,
      of: Boolean, // { userId: true }
      default: {},
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
