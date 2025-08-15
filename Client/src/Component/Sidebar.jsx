import React, { useContext, useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../Context/AuthContext";
import { ChatContext } from "../../Context/ChatContext";

function Sidebar() {
  const { logout, onlineUsers } = useContext(AuthContext);
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessage,
    setUnseenMessage,
    messages,
  } = useContext(ChatContext);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const isOnline = (id) => onlineUsers.includes(String(id));

  // Memoized sorting to avoid recalculations
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const lastMsgA = messages
        .filter((m) => m.senderId === a._id || m.receiverId === a._id)
        .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))[0];
      const lastMsgB = messages
        .filter((m) => m.senderId === b._id || m.receiverId === b._id)
        .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))[0];
      return (lastMsgB?.createdAt ? new Date(lastMsgB.createdAt) : 0) -
             (lastMsgA?.createdAt ? new Date(lastMsgA.createdAt) : 0);
    });
  }, [users, messages]);

  // Filtered + sorted list
  const filteredUsers = useMemo(() => {
    if (!input) return sortedUsers;
    const search = input.toLowerCase();
    return sortedUsers.filter((u) => u.fullName.toLowerCase().includes(search));
  }, [sortedUsers, input]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch users on mount & when online status changes
  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white 
        w-full min-w-[250px] max-w-[800px] transition-all duration-300
        scrollbar-thin scrollbar-thumb-[#4a4a6a] scrollbar-track-transparent
        ${selectedUser ? "max-md:hidden" : "block"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <img src={assets.logo} alt="Logo" className="max-w-36" />

        {/* Dropdown Menu */}
        <div ref={dropdownRef} className="relative py-2">
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="max-h-5 cursor-pointer hover:opacity-80 transition"
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && (
            <div className="absolute top-full right-0 z-20 w-40 p-3 rounded-md bg-[#282142] border border-gray-600 shadow-lg animate-fadeIn">
              <p
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="cursor-pointer text-sm hover:text-blue-400 py-1"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-gray-500" />
              <p
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="cursor-pointer text-sm hover:text-red-400 py-1"
              >
                Logout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
        <img src={assets.search_icon} alt="Search" className="w-3" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search User..."
          className="bg-transparent outline-none text-white text-xs placeholder:text-[#c8c8c8] flex-1"
        />
      </div>

      {/* User List */}
      <div className="flex flex-col mt-5 space-y-1">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">No users found</p>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const unseen = unseenMessage[user._id] || 0;
            return (
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  setUnseenMessage((prev) => ({ ...prev, [user._id]: 0 }));
                }}
                className={`relative flex items-center gap-3 p-2 pl-4 rounded-lg cursor-pointer transition-colors duration-200
                  ${isSelected ? "bg-[#282142]/50" : "hover:bg-[#282142]/30"}`}
              >
                <div className="relative">
                  <img
                    src={user?.profilePic || assets.avatar_icon}
                    alt={user.fullName}
                    className="w-[36px] h-[36px] rounded-full object-cover"
                  />
                  {isOnline(user._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E1E2D]"></span>
                  )}
                </div>
                <div className="flex flex-col leading-5 flex-1">
                  <p className="font-medium truncate">{user.fullName}</p>
                  <span className={`text-xs ${isOnline(user._id) ? "text-green-400" : "text-neutral-400"}`}>
                    {isOnline(user._id) ? "Online" : "Offline"}
                  </span>
                </div>
                {unseen > 0 && (
                  <span className="absolute top-3 right-4 text-xs h-5 w-5 flex justify-center items-center bg-violet-500/70 rounded-full">
                    {unseen}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Sidebar;
