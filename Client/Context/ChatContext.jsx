// // Context/ChatContext.jsx
// import { useContext, useState, createContext, useEffect, useRef } from "react";
// import { AuthContext } from "./AuthContext";
// import { toast } from "react-toastify";

// export const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [messagesCache, setMessagesCache] = useState({}); // ✅ userId -> messages[]
//   const [messages, setMessages] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [unseenMessage, setUnseenMessage] = useState({});

//   const { socket, axios, authUser } = useContext(AuthContext);

//   // ✅ Get users
//   const getUsers = async () => {
//     try {
//       const { data } = await axios.get("/api/messages/users");
//       if (data.success) {
//         setUsers(data.users || []);
//         setUnseenMessage(data.unseenMessages || {});
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || err.message);
//     }
//   };

//   // ✅ Get messages (with caching)
//   const getMessages = async (userId) => {
//     if (!userId) return;

//     // Agar messages cache me already hain, toh wahi load karo
//     if (messagesCache[userId]) {
//       setMessages(messagesCache[userId]);
//       return;
//     }

//     try {
//       const { data } = await axios.get(`/api/messages/${userId}`);
//       if (data.success) {
//         setMessages(data.messages || []);
//         setMessagesCache((prev) => ({
//           ...prev,
//           [userId]: data.messages || [],
//         }));
//       } else {
//         setMessages([]);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || err.message);
//     }
//   };

//   // ✅ Send message with optimistic update + cache update
//   const sendMessage = async (messageData) => {
//     if (!selectedUser || !authUser) return;

//     const tempId = Date.now().toString();
//     const tempMessage = {
//       ...messageData,
//       _id: tempId,
//       senderId: authUser._id,
//       receiverId: selectedUser._id,
//       createdAt: new Date().toISOString(),
//       seen: false,
//       isTemp: true,
//     };

//     // State update
//     setMessages((prev) => [...prev, tempMessage]);
//     setMessagesCache((prev) => ({
//       ...prev,
//       [selectedUser._id]: [...(prev[selectedUser._id] || []), tempMessage],
//     }));

//     try {
//       const { data } = await axios.post(
//         `/api/messages/send/${selectedUser._id}`,
//         {
//           ...messageData,
//           senderId: authUser._id,
//           receiverId: selectedUser._id,
//         }
//       );

//       if (data.success && data.NewMessage) {
//         setMessages((prev) =>
//           prev.map((msg) => (msg._id === tempId ? data.NewMessage : msg))
//         );
//         setMessagesCache((prev) => ({
//           ...prev,
//           [selectedUser._id]: (prev[selectedUser._id] || []).map((msg) =>
//             msg._id === tempId ? data.NewMessage : msg
//           ),
//         }));
//         toast.success("Message sent successfully!");
//       } else {
//         throw new Error(data.message || "Failed to send message");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message);
//       // rollback
//       setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
//       setMessagesCache((prev) => ({
//         ...prev,
//         [selectedUser._id]: (prev[selectedUser._id] || []).filter(
//           (msg) => msg._id !== tempId
//         ),
//       }));
//     }
//   };

//   // ✅ Socket listener
//   useEffect(() => {
//     if (!socket) return;

//     const handler = (newMessage) => {
//       const sId = newMessage.senderId?._id || newMessage.senderId;
//       const rId = newMessage.receiverId?._id || newMessage.receiverId;
//       const sIdStr = String(sId);
//       const rIdStr = String(rId);
//       const selectedIdStr = selectedUser ? String(selectedUser._id) : null;

//       if (
//         selectedIdStr &&
//         (sIdStr === selectedIdStr || rIdStr === selectedIdStr)
//       ) {
//         // ✅ Add to current messages
//         setMessages((prev) => {
//           const exists = prev.some(
//             (m) => String(m._id) === String(newMessage._id)
//           );
//           if (exists) return prev;
//           return [...prev, newMessage];
//         });

//         // ✅ Add to cache
//         setMessagesCache((prev) => {
//           const currentMsgs = prev[selectedIdStr] || [];
//           const exists = currentMsgs.some(
//             (m) => String(m._id) === String(newMessage._id)
//           );
//           if (exists) return prev;
//           return {
//             ...prev,
//             [selectedIdStr]: [...currentMsgs, newMessage],
//           };
//         });

//         // mark as seen
//         if (sIdStr === selectedIdStr) {
//           axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
//         }
//       } else {
//         // increment unseen count
//         setUnseenMessage((prev) => ({
//           ...prev,
//           [sIdStr]: (prev[sIdStr] || 0) + 1,
//         }));
//       }
//     };

//     socket.on("newMessage", handler);
//     return () => socket.off("newMessage", handler);
//   }, [socket, selectedUser, axios]);

//   const value = {
//     messages,
//     setMessages,
//     users,
//     selectedUser,
//     setSelectedUser,
//     unseenMessage,
//     setUnseenMessage,
//     getUsers,
//     getMessages,
//     sendMessage,
//   };

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };






import { useContext, useState, createContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessage, setUnseenMessage] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  // Fetch all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessage(data.unseenMessages || {});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Fetch messages with a specific user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages || []);
      else setMessages([]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Send message with optimistic UI
  const sendMessage = async (messageData) => {
    if (!selectedUser || !authUser) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      ...messageData,
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
      seen: false,
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      // Adjust according to backend key
      const newMsg = data.NewMessage || data.newMessage;

      if (data.success && newMsg) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? newMsg : msg))
        );
        toast.success("Message sent successfully!");
      } else {
        toast.error(data.message || "Failed to send message");
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || error.message);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  // Socket listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handler = (newMessage) => {
      const sId = newMessage.senderId?._id || newMessage.senderId;
      const rId = newMessage.receiverId?._id || newMessage.receiverId;
      const selectedIdStr = selectedUser ? String(selectedUser._id) : null;

      if (
        selectedIdStr &&
        (String(sId) === selectedIdStr || String(rId) === selectedIdStr)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => String(m._id) === String(newMessage._id));
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Mark seen if from selected user
        if (String(sId) === selectedIdStr) {
          axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
        }
      } else {
        setUnseenMessage((prev) => ({
          ...prev,
          [String(sId)]: (prev[String(sId)] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedUser, axios]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessage,
        setUnseenMessage,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
