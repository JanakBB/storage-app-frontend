import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, loginWithGitHub } from "./api/authApi"; // ← GitHub added
import { sendOtp, verifyOtp } from "./api/authApi";
import { registerUser } from "./api/userApi";
import {
  HardDrive,
  Shield,
  Mail,
  Lock,
  User,
  CheckCircle,
  Clock,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "John Trump",
    email: "example@gmail.com",
    password: "abcdefgh",
  });
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return setOtpError("Please enter your email first.");
    try {
      setIsSending(true);
      await sendOtp(formData.email);
      setOtpSent(true);
      setCountdown(60);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setOtpError("Please enter OTP.");
    try {
      setIsVerifying(true);
      await verifyOtp(formData.email, otp);
      setOtpVerified(true);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setOtpError("Please verify your email with OTP.");
    try {
      await registerUser({ ...formData, otp });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-1">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <HardDrive className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 text-sm">
          Join Storage Drive and get started
        </p>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="text-[10px] w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Email + OTP */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`text-[10px] w-full pl-10 pr-24 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  serverError ? "border-red-300" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending || countdown > 0 || otpVerified}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white text-[10px]  px-1 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <Clock size={14} className="animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : otpVerified ? (
                  <CheckCircle size={14} />
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          </div>

          {/* OTP Field */}
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="w-full pl-4 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpVerified}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifying ? (
                    <Clock size={14} className="animate-spin" />
                  ) : otpVerified ? (
                    <CheckCircle size={14} />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              {otpError && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <Shield size={16} />
                  <span>{otpError}</span>
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="text-[10px] w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!otpVerified || isSuccess}
            className="text-sm w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSuccess ? (
              <>
                <CheckCircle size={18} />
                Registration Successful!
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* Professional Auth Buttons */}
        <div className="space-y-4 max-w-sm mx-auto">
          {/* Google Login */}
          <div className="flex align-middle justify-center ml-2.5">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-[320px] transform transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      await loginWithGoogle(credentialResponse.credential);
                      navigate("/");
                    } catch (err) {
                      console.error("Google login failed:", err);
                    }
                  }}
                  onError={() => console.log("Google Login Failed")}
                  theme="filled_blue"
                  size="large"
                  width="300"
                  shape="rectangular"
                  text="continue_with"
                  logo_alignment="left"
                />
              </div>
            </div>
          </div>

          {/* GitHub Login */}
          <div className="flex justify-center w-full">
            <button
              onClick={loginWithGitHub}
              className="w-full max-w-[320px] flex items-center justify-center cursor-pointer gap-3 px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium text-[15px] rounded-lg border border-gray-700 dark:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm truncate transition-all duration-200 group-hover:font-medium">
                Sign in with GitHub
              </span>
            </button>
          </div>

          {/* Security Note */}
          <div className="text-center mt-6">
            <p className="text-[8px] text-gray-400 dark:text-gray-500">
              Your data is securely encrypted and protected
            </p>
          </div>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 hover:text-green-700 font-medium transition-colors text-[12px]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
