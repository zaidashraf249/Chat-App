import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: " " },
    bio: { type: String },
}, { timestamps: true });


const User = mongoose.model("User", UserSchema);

export default User;
