// export const userSocketMap = {}; // { userId: socketId }

// export default function initSocket(io) {
//   io.on("connection", (socket) => {
//     console.log("🔌 User connected:", socket.id);

//     const userId = socket.handshake.query?.userId?.toString();
//     if (userId) {
//       userSocketMap[userId] = socket.id;
//       console.log(`📌 Mapped User ${userId} -> Socket ${socket.id}`);
//       io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     }

//     socket.on("disconnect", () => {
//       console.log("❌ User disconnected:", socket.id);
//       const disconnectedUserId = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === socket.id
//       );
//       if (disconnectedUserId) {
//         delete userSocketMap[disconnectedUserId];
//         console.log(`🗑️ Removed User ${disconnectedUserId} from map`);
//       }
//       io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     });
//   });
// }




// socket.js
export const userSocketMap = {}; // { userId: socketId }

export default function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // Extract userId from handshake
    const userId = socket.handshake.query?.userId?.toString();

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`📌 Mapped User ${userId} -> Socket ${socket.id}`);

      // Send updated online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    // Listen for message send
    socket.on("sendMessage", (messageData) => {
      const { receiverId } = messageData;
      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        // Send message instantly to receiver
        io.to(receiverSocketId).emit("receiveMessage", messageData);
      }
    });

    // Mark messages as seen
    socket.on("markAsSeen", ({ senderId }) => {
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { by: userId });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      const disconnectedUserId = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === socket.id
      );
      if (disconnectedUserId) {
        delete userSocketMap[disconnectedUserId];
        console.log(`🗑️ Removed User ${disconnectedUserId} from map`);
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}
