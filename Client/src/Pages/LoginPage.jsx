import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import assets from "../assets/assets";
import { AuthContext } from "../../Context/AuthContext";
import { useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode");

  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (mode === "login") {
      setCurrState("Login");
      setIsDataSubmitted(false);
    } else {
      setCurrState("Sign Up");
      setIsDataSubmitted(false);
    }
  }, [mode]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    if (currState === "Sign Up" && isDataSubmitted) {
      if (!bio.trim()) return toast.error("Please fill out your bio.");

      if (!agreeTerms) return toast.error("You must agree to the terms.");
      

      const signupData = { fullName, email, password, bio };
      try {
        await login("signup", signupData);
      } catch (error) {
        toast.error("Signup failed.");
        console.error("Signup error:", error);
      }
    }

    if (currState === "Login") {
      try {
        await login("login", { email, password });
      } catch (error) {
        toast.error("Login failed.");
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#8185B2]/10 backdrop-blur-md">
      {/* Left Side (Logo) */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2">
        <img src={assets.logo_icon} alt="Logo" className="w-[80px]" />
        <h1 className="text-white text-3xl font-semibold mt-4">Quick Chat</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmitHandler}
        className="bg-[#8185B2]/10 bg-opacity-80 backdrop-blur-md border border-gray-600 text-white rounded-xl px-6 py-8 w-full max-w-sm shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">{currState}</h2>
          {currState === "Sign Up" && isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className="w-5 cursor-pointer hover:opacity-80 transition-opacity"
            />
          )}
        </div>

        {/* Sign Up First Step */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Full Name"
            className="mb-4 w-full p-3 bg-transparent border border-gray-500 rounded-md"
          />
        )}

        {/* Email */}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="mb-4 w-full p-3 bg-transparent border border-gray-500 rounded-md"
            />

            {/* Password with Eye Toggle */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full p-3 bg-transparent border border-gray-500 rounded-md pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </>
        )}

        {/* Bio Step */}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="mb-4 w-full p-3 bg-transparent border border-gray-500 rounded-md"
          ></textarea>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-md bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold"
        >
          {currState === "Sign Up" && !isDataSubmitted
            ? "Next"
            : currState === "Sign Up"
            ? "Create Account"
            : "Login Now"}
        </button>

        {/* Terms */}
        {currState === "Sign Up" && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="accent-purple-500"
            />
            <label>Agree to terms and privacy policy.</label>
          </div>
        )}

        {/* Switch */}
        <div className="flex flex-col gap-2 mt-4">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
