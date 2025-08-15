import React, { useContext } from "react";
import ChatContainer from "../Component/ChatContainer";
import RightSidebar from "../Component/RightSidebar";
import Sidebar from "../Component/Sidebar";
import { ChatContext } from "../../Context/ChatContext";

const HomePage = () => {
  // yahan dono destructure karo
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen px-2 py-2 sm:px-[15%] sm:py-[5%] text-white">
      <div
        className={`backdrop-blur-xl border border-gray-600 rounded-2xl overflow-hidden h-full
          grid ${
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
              : "md:grid-cols-[1fr_2fr]"
          }`}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Chat Section */}
        <ChatContainer
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />

        {/* Right Sidebar */}
        {selectedUser && (
          <RightSidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
