// import React, { useContext, useState } from "react";
// import assets from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../Context/AuthContext";

// const ProfilePage = () => {
//   const { authUser, updateProfile } = useContext(AuthContext);

//   const [selectedImg, setSelectedImg] = useState(null);
//   const navigate = useNavigate();
//   const [name, setName] = useState(authUser.fullName);
//   const [bio, setBio] = useState(authUser.bio);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedImg(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // If no new image selected
//     if (!selectedImg) {
//       await updateProfile({ fullName: name, bio });
//       navigate("/");
//       return;
//     }

//     // If image selected, convert to base64
//     const reader = new FileReader();
//     reader.readAsDataURL(selectedImg);
//     reader.onload = async () => {
//       const base64Image = reader.result;
//       await updateProfile({ profilePic: base64Image, fullName: name, bio });
//       navigate("/");
//     };
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 bg-[#8185B2]/10 backdrop-blur-md relative overflow-hidden">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-[#8185B2]/10 border border-gray-600 backdrop-blur-2xl text-white p-8 rounded-xl shadow-2xl w-full max-w-xl flex flex-col sm:flex-row justify-between items-center gap-6"
//       >
//         {/* Left Section */}
//         <div className="flex-1 w-full">
//           <h2 className="text-sm text-gray-300 mb-4">Profile details</h2>

//           {/* Profile Picture */}
//           <div className="flex items-center gap-4 mb-6">
//             <label htmlFor="profilePic" className="flex items-center gap-3 cursor-pointer">
//               <img
//                 src={
//                   selectedImg
//                     ? URL.createObjectURL(selectedImg)
//                     : authUser?.profilePic || assets.avatar_icon
//                 }
//                 alt="Profile"
//                 className={`w-12 h-12 ${selectedImg && rounded-full} object-cover`}
//               />
//             </label>
//             <label
//               htmlFor="profilePic"
//               className="text-sm text-gray-400 cursor-pointer hover:underline"
//             >
//               Upload profile image
//             </label>
//             <input
//               id="profilePic"
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               className="hidden"
//             />
//           </div>

//           {/* Name */}
//           <input
//             type="text"
//             required
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             placeholder="Full Name"
//             className="w-full mb-4 p-3 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />

//           {/* Bio */}
//           <textarea
//             rows={4}
//             value={bio}
//             required
//             onChange={(e) => setBio(e.target.value)}
//             placeholder="Write a short bio..."
//             className="w-full mb-4 p-3 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//           ></textarea>

//           {/* Save Button */}
//           <button
//             type="submit"
//             className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 transition-opacity text-white font-semibold"
//           >
//             Save
//           </button>
//         </div>

//         {/* Right Section */}
//         <div className="hidden sm:block">
//           <img src={assets.logo_icon} alt="Logo" className={`max-w-44 aspect-square rounded-full mx-10
//             max-sm:mt-10 w-12 h-12 ${selectedImg && rounded-full} object-cover `} />
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProfilePage;




import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImg(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImg) {
      await updateProfile({
        name: fullName,
        bio,
        profilePic: null,
      });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await updateProfile({
        name: fullName,
        bio,
        profilePic: base64Image,
      });
      navigate("/");
    };
    reader.readAsDataURL(selectedImg);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 bg-[#8185B2]/10 backdrop-blur-md relative overflow-hidden">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium shadow-md transition-colors"
      >
        ← Back
      </button>

      {/* Center Form */}
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-[#8185B2]/10 border border-gray-600 backdrop-blur-2xl text-white p-8 rounded-xl shadow-2xl w-full max-w-xl flex flex-col sm:flex-row justify-between items-center gap-6"
        >
          {/* Left Section */}
          <div className="flex-1 w-full">
            <h2 className="text-sm text-gray-300 mb-4">Profile details</h2>

            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="profilePic" className="flex items-center gap-3 cursor-pointer">
                <img
                  src={
                    selectedImg
                      ? URL.createObjectURL(selectedImg)
                      : authUser?.profilePic || assets.avatar_icon
                  }
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              </label>
              <label
                htmlFor="profilePic"
                className="text-sm text-gray-400 cursor-pointer hover:underline"
              >
                Upload profile image
              </label>
              <input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Full Name */}
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full mb-4 p-3 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Bio */}
            <textarea
              rows={4}
              value={bio}
              required
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio..."
              className="w-full mb-4 p-3 bg-transparent border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 transition-opacity text-white font-semibold"
            >
              Save
            </button>
          </div>

          {/* Right Section */}
          <div className="hidden sm:block">
            <img
              src={authUser?.profilePic || assets.logo_icon}
              alt=" "
              className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
