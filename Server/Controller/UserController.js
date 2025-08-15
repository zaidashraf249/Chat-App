// import bcrypt from "bcryptjs";
// import generateToken from "../lib/utils.js";
// import cloudinary from "../lib/Cloudinary.js";
// import User from "../Models/UserModel.js";

// export const SignUp = async (req, res) => {
//   const { fullName, email, password, bio } = req.body;

//   try {
//     if (!fullName || !email || !password || !bio) {
//       return res.json({ success: false, message: "missing detail" });
//     }

//     const existingUser  = await User.findOne({ email });

//     if (existingUser ) {
//       return res.json({ success: false, message: "Account already Exist...!" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await User.create({
//       fullName,
//       email,
//       password: hashedPassword,
//       bio,
//     });

//     const token = generateToken(newUser._id);

//     res.json({
//       success: true,
//       userData: newUser,
//       token,
//       message: "Account Created Successfully...!",
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// export const logIn = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const userData = await User.findOne({ email });

//     if (!userData) {
//       return res.json({ success: false, message: "User not found." });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, userData.password);

//     if (!isPasswordCorrect) {
//       return res.json({ success: false, message: "Invalid credentials." });
//     }

//     const token = generateToken(userData._id);

//     res.json({
//       success: true,
//       userData,
//       token,
//       message: "Login Successfully...!",
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// //controller to check if the user is Authenticated

// export const checkAuth = async (req, res) => {
//   res.json({ success: true, message: req.user });
// };

// //Controller to update user profile details
// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic, bio, fullName } = req.body;

//     const userId = req.user._id;
//     let updatedUser;

//     if (!profilePic) {
//       updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { bio, fullName },
//         { new: true }
//       );
//     } else {
//       const upload = await cloudinary.uploader.upload(profilePic);

//       updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { profilePic: upload.secure_url, bio, fullName },
//         { new: true }
//       );
//     }

//     res.json({ success: true, message: updatedUser });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

import generateToken from "../lib/utils.js";
import UserModel from '../Models/UserModel.js';
import cloudinary from "../lib/Cloudinary.js";


export const SignUp = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;
    console.log("Signup data received:", req.body); // 👈 Add this
    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const newUser = await UserModel.create({ fullName, email, password, bio });
    console.log("User created:", newUser); // 👈 Add this

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      userData: newUser,
      token,
    });
  } catch (error) {
  console.error("Signup error:", error);
  const statusCode = error.name === "ValidationError" ? 400 : 500;
  res.status(statusCode).json({ success: false, message: error.message });
}
};

export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      userData: user,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const checkAuth = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("checkAuth error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};




export const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body; 
    const userId = req.user._id;

    let updatedData = { fullName, bio };

    // Agar profile pic bheji hai to Cloudinary pe upload karo
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "profilePics",
      });
      updatedData.profilePic = upload.secure_url;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("updateProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
