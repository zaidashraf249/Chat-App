// import { useContext, useEffect, useRef, useState } from "react";
// import assets from "../assets/assets";
// import { formatMessageTime } from "../Lib/utils";
// import { ChatContext } from "../../Context/ChatContext";
// import { AuthContext } from "../../Context/AuthContext";
// import { toast } from "react-toastify";
// import { FiChevronDown } from "react-icons/fi";

// function ChatContainer() {
//   const chatContainerRef = useRef();
//   const scrollEnd = useRef();
//   const prevMsgCountRef = useRef(0); // <-- Track previous messages length

//   const { messages = [], selectedUser, setSelectedUser, getMessages, sendMessage } =
//     useContext(ChatContext);
//   const { authUser, onlineUsers } = useContext(AuthContext);

//   const [input, setInput] = useState("");
//   const [isAtBottom, setIsAtBottom] = useState(true);
//   const [newMessageCount, setNewMessageCount] = useState(0);

//   // Fetch messages on selected user change
//   useEffect(() => {
//     if (selectedUser) {
//       getMessages(selectedUser._id);
//       prevMsgCountRef.current = 0;
//       setNewMessageCount(0);
//     }
//   }, [selectedUser, getMessages]);

//   // Auto-scroll to bottom if user is near bottom
//   useEffect(() => {
//     if (isAtBottom && scrollEnd.current) {
//       scrollEnd.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isAtBottom]);

//   // Track scroll position
//   const onScroll = () => {
//     if (!chatContainerRef.current) return;
//     const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
//     const atBottom = scrollHeight - scrollTop - clientHeight < 50;
//     setIsAtBottom(atBottom);
//     if (atBottom) setNewMessageCount(0);
//   };

//   // New message counter (WhatsApp-style)
//   useEffect(() => {
//     if (messages.length > prevMsgCountRef.current) {
//       const lastMsg = messages[messages.length - 1];
//       const isFromOther =
//         String(lastMsg.senderId?._id || lastMsg.senderId) !== String(authUser?._id);

//       if (!isAtBottom && isFromOther) {
//         setNewMessageCount((prev) => prev + 1);
//       }

//       if (isAtBottom) setNewMessageCount(0);
//     }

//     prevMsgCountRef.current = messages.length;
//   }, [messages, isAtBottom, authUser?._id]);

//   const handleScrollToBottom = () => {
//     if (scrollEnd.current) {
//       scrollEnd.current.scrollIntoView({ behavior: "smooth" });
//       setIsAtBottom(true);
//       setNewMessageCount(0);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     if (e) e.preventDefault();
//     if (!input.trim()) return;
//     await sendMessage({ text: input.trim() });
//     setInput("");
//   };

//   const handleSendImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !file.type.startsWith("image/")) {
//       toast.error("Please select a valid image file");
//       return;
//     }
//     const reader = new FileReader();
//     reader.onloadend = async () => {
//       await sendMessage({ image: reader.result });
//       e.target.value = "";
//     };
//     reader.readAsDataURL(file);
//   };

//   if (!selectedUser) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full text-white/60 backdrop-blur-xl max-md:hidden">
//         <img src={assets.logo_icon} alt="Logo" className="w-16 mb-4" />
//         <p className="text-lg font-medium">Chat anytime, Anywhere</p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full w-full relative bg-[#000000]/10 backdrop-blur-2xl rounded-lg overflow-hidden flex flex-col">
//       {/* Header */}
//       <div className="flex items-center justify-between px-5 py-3 border-b border-white/20 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <img
//             src={selectedUser.profilePic || assets.avatar_icon}
//             alt="Profile"
//             className="w-10 h-10 rounded-full"
//           />
//           <p className="text-white font-semibold flex items-center gap-2">
//             {selectedUser.fullName}
//             {onlineUsers?.includes(String(selectedUser._id)) && (
//               <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//             )}
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <img
//             onClick={() => setSelectedUser(null)}
//             src={assets.arrow_icon}
//             alt="Back"
//             className="md:hidden w-6 cursor-pointer"
//           />
//           <img src={assets.help_icon} alt="Help" className="hidden md:block w-5" />
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div
//         ref={chatContainerRef}
//         onScroll={onScroll}
//         className="flex flex-col overflow-y-auto p-3 space-y-5 relative"
//         style={{ flexGrow: 1, maxHeight: "calc(100% - 120px)", scrollbarWidth: "thin" }}
//       >
//         {messages.map((msg) => {
//           const senderIdStr = String(msg.senderId?._id || msg.senderId);
//           const isMe = senderIdStr === String(authUser?._id);

//           return (
//             <div key={msg._id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
//               {!isMe && (
//                 <div className="flex flex-col items-center text-[11px] text-gray-400 w-10">
//                   <img
//                     src={selectedUser?.profilePic || assets.avatar_icon}
//                     alt="Avatar"
//                     className="w-6 h-6 rounded-full"
//                   />
//                   <p>{formatMessageTime(msg.createdAt)}</p>
//                 </div>
//               )}
//               <div className="max-w-[250px] space-y-1">
//                 {msg.image ? (
//                   <img src={msg.image} alt="Sent" className="rounded-lg border border-gray-600" />
//                 ) : (
//                   <p className={`text-white text-sm p-3 rounded-xl ${isMe ? "bg-[#8f44fd]/40 rounded-br-none" : "bg-[#8f44fd]/60 rounded-bl-none"}`}>
//                     {msg.text}
//                   </p>
//                 )}
//               </div>
//               {isMe && (
//                 <div className="flex flex-col items-center text-[11px] text-gray-400 w-10">
//                   <img src={authUser?.profilePic || assets.avatar_icon} alt="Avatar" className="w-6 h-6 rounded-full" />
//                   <p>{formatMessageTime(msg.createdAt)}</p>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//         <div ref={scrollEnd} />
//       </div>

//       {/* Down Arrow */}
//       {!isAtBottom && (
//         <button
//           onClick={handleScrollToBottom}
//           className="absolute bottom-16 left-1/2 transform -translate-x-1/2 p-3 bg-purple-600 rounded-full shadow-lg text-white hover:bg-purple-700 transition relative"
//         >
//           <FiChevronDown size={24} />
//           {newMessageCount > 0 && (
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//               {newMessageCount}
//             </span>
//           )}
//         </button>
//       )}

//       {/* Input Area */}
//       <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
//         <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
//             type="text"
//             placeholder="Send a message"
//             className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
//           />
//           <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
//           <label htmlFor="image">
//             <img src={assets.gallery_icon} alt="Gallery" className="w-5 mr-2 cursor-pointer" />
//           </label>
//         </div>
//         <img onClick={handleSendMessage} src={assets.send_button} alt="Send" className="w-7 cursor-pointer" />
//       </div>
//     </div>
//   );
// }

// export default ChatContainer;





import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../Lib/utils";
import { ChatContext } from "../../Context/ChatContext";
import { AuthContext } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import { FiChevronDown, FiMoreVertical, FiTrash2, FiDownload } from "react-icons/fi";

function ChatContainer() {
  const chatContainerRef = useRef(null);
  const scrollEnd = useRef(null);
  const prevMsgCountRef = useRef(0);
  const menuRef = useRef(null);

  const {
    messages = [],
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
    setMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers, axios } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openMenuForId, setOpenMenuForId] = useState(null);

  const isMe = (msg) => {
    const senderIdStr =
      typeof msg.senderId === "object"
        ? String(msg.senderId?._id)
        : String(msg.senderId || "");
    return senderIdStr === String(authUser?._id || "");
  };

  const closeMenu = () => setOpenMenuForId(null);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      prevMsgCountRef.current = 0;
      setUnreadCount(0);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (isAtBottom && scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const onScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) setUnreadCount(0);
  };

  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      const fromOther =
        String(lastMsg?.senderId?._id || lastMsg?.senderId) !==
        String(authUser?._id);

      if (!isAtBottom && fromOther) {
        setUnreadCount((prev) => prev + 1);
      }
      if (isAtBottom) setUnreadCount(0);
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, isAtBottom, authUser?._id]);

  const handleScrollToBottom = () => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
      setUnreadCount(0);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const saveTextAsFile = (text, filename = "message.txt") => {
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't save the text message");
    }
  };

  const inferImageExtFromDataUrl = (dataUrl) => {
    const match = /^data:image\/([a-zA-Z0-9+.-]+);base64,/.exec(dataUrl || "");
    return match ? `.${(match[1] || "png").split("+")[0]}` : ".png";
  };

  const saveImage = (src, createdAt) => {
    try {
      const a = document.createElement("a");
      a.href = src;
      if (src.startsWith("data:image/")) {
        const ext = inferImageExtFromDataUrl(src);
        a.download = `image-${new Date(createdAt || Date.now()).getTime()}${ext}`;
      } else {
        const urlPart = src.split("?")[0];
        const baseName = urlPart.substring(urlPart.lastIndexOf("/") + 1) || "image";
        a.download = baseName;
      }
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("Couldn't save the image");
    }
  };

  const deleteMessageOnServer = async (id, scope = "me") => {
    return axios.delete(
      `http://localhost:5000/api/messages/delete/${id}?scope=${scope}`,
      { withCredentials: true }
    );
  };

  const handleDeleteForMe = async (msg) => {
    const ok = window.confirm("Delete this message for you?");
    if (!ok) return;

    const backup = messages;
    setMessages((prev) => prev.filter((m) => String(m._id) !== String(msg._id)));
    closeMenu();

    try {
      await deleteMessageOnServer(msg._id, "me");
      toast.success("Deleted for you");
    } catch (err) {
      setMessages(backup);
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDeleteForEveryone = async (msg) => {
    if (!isMe(msg)) {
      toast.info("Only the sender can delete for everyone");
      return;
    }
    const ok = window.confirm("Delete this message for everyone?");
    if (!ok) return;

    const backup = messages;
    setMessages((prev) => prev.filter((m) => String(m._id) !== String(msg._id)));
    closeMenu();

    try {
      await deleteMessageOnServer(msg._id, "all");
      toast.success("Deleted for everyone");
    } catch (err) {
      setMessages(backup);
      toast.error(err.response?.data?.message || "Failed to delete for everyone");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 backdrop-blur-xl max-md:hidden">
        <img src={assets.logo_icon} alt="Logo" className="w-16 mb-4" />
        <p className="text-lg font-medium">Chat anytime, Anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-[#000000]/10 backdrop-blur-2xl rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <p className="text-white font-semibold flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers?.includes(String(selectedUser._id)) && (
              <span className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="Back"
            className="md:hidden w-6 cursor-pointer"
          />
          <img src={assets.help_icon} alt="Help" className="hidden md:block w-5" />
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        onScroll={onScroll}
        className="flex flex-col flex-grow overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent"
      >
        {messages.map((msg, idx) => {
          const mine = isMe(msg);
          const key = String(msg._id || idx);

          return (
            <div
              key={key}
              className={`group relative flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <div className="flex flex-col items-center text-[11px] text-gray-400 w-10">
                  <img
                    src={selectedUser?.profilePic || assets.avatar_icon}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <p>{formatMessageTime(msg.createdAt)}</p>
                </div>
              )}

              <div className="relative max-w-[260px] space-y-1">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="Sent"
                    className={`rounded-lg border border-gray-600 ${mine ? "rounded-br-none" : "rounded-bl-none"}`}
                  />
                ) : (
                  <p
                    className={`text-white text-sm p-3 rounded-xl break-words ${
                      mine
                        ? "bg-[#8f44fd]/40 rounded-br-none"
                        : "bg-[#8f44fd]/60 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}

                <button
                  aria-label="Message actions"
                  onClick={() => setOpenMenuForId((prev) => (prev === msg._id ? null : msg._id))}
                  className={`absolute -top-2 ${mine ? "-right-2" : "-left-2"} p-1 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition`}
                >
                  <FiMoreVertical />
                </button>

                {openMenuForId === msg._id && (
                  <div
                    ref={menuRef}
                    className={`absolute z-20 mt-1 min-w-[170px] text-sm rounded-lg border border-white/15 bg-[#1f1b2e]/95 shadow-xl backdrop-blur ${
                      mine ? "right-0" : "left-0"
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (msg.image) saveImage(msg.image, msg.createdAt);
                        else saveTextAsFile(
                          msg.text || "",
                          `message-${new Date(msg.createdAt || Date.now())
                            .toISOString()
                            .replace(/[:.]/g, "-")}.txt`
                        );
                        closeMenu();
                      }}
                      className="w-full px-2 py-2 flex items-center gap-2 hover:bg-white/10"
                    >
                      <FiDownload className="text-base" />
                      <span>Save as…</span>
                    </button>

                    <button
                      onClick={() => handleDeleteForMe(msg)}
                      className="w-full px-2 py-2 flex items-center gap-2 hover:bg-white/10"
                    >
                      <FiTrash2 className="text-base" />
                      <span>Delete for me</span>
                    </button>

                    {mine && !msg.isTemp && (
                      <button
                        onClick={() => handleDeleteForEveryone(msg)}
                        className="w-full px-2 py-2 flex items-center gap-2 text-red-300 hover:bg-red-500/10"
                      >
                        <FiTrash2 className="text-base" />
                        <span>Delete for everyone</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {mine && (
                <div className="flex flex-col items-center text-[11px] text-gray-400 w-10">
                  <img
                    src={authUser?.profilePic || assets.avatar_icon}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <p>{formatMessageTime(msg.createdAt)}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {!isAtBottom && (
        <button
          onClick={handleScrollToBottom}
          className="absolute bottom-20 right-4 flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-full shadow-lg text-white hover:bg-purple-700 transition"
        >
          <FiChevronDown size={20} />
          {unreadCount > 0 && (
            <span className="text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-3 p-3 border-t border-white/10 bg-[#000000]/20 flex-shrink-0">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="Gallery" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default ChatContainer;
