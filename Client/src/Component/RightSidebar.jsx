import { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../Context/AuthContext";
import { ChatContext } from '../../Context/ChatContext';

function RightSidebar() {
  const navigate = useNavigate();

  // Contexts
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  // State for storing images
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));
    } else {
      setMsgImages([]);
    }
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate("/login?mode=login"); // Redirect to login
  };

  if (!selectedUser) return null; // If no user selected, don't render

  return (
    <div
      className={`bg-[#8185B2]/10 text-white w-full h-full py-8 px-6 
      flex flex-col justify-between max-md:hidden overflow-hidden`}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center text-center gap-2">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="User"
          className="w-20 h-20 rounded-full object-cover"
        />
        <h1 className="text-lg font-semibold flex items-center gap-2 mt-2">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          )}
          {selectedUser.fullName}
        </h1>
        <p className="text-xs text-white/70 mt-1 px-4">
        {selectedUser.bio}
        </p>
      </div>

      {/* Media Section */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-white mb-2">Media</p>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[200px] pr-1">
          {msgImages.map((url, i) => (
            <div
              key={i}
              className="rounded-md overflow-hidden cursor-pointer"
              onClick={() => window.open(url)}
            >
              <img src={url} alt={`media-${i}`} className="rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-purple-400 to-violet-600
          text-sm text-white font-normal py-2 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default RightSidebar;
