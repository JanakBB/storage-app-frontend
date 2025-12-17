import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // Use GoogleLogin component
import { loginWithGoogle, loginWithGitHub } from "./api/authApi";
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

const RegisterNew = () => {
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
      setServerError("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
    setServerError("Google authentication failed.");
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-1 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <HardDrive className="mx-auto h-7 w-auto" size={32} />

        <h1 className="mt-1 text-center text-xl/9 font-bold tracking-tight text-gray-900">
          Create Account
        </h1>
        <p className="mt-1 text-center text-xl/9 font-bold tracking-tight text-gray-900">
          Join Storage Drive and get started
        </p>
      </div>

      {/* Registration Form */}
      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="fullName"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          {/* Email + OTP */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Email Address
            </label>
            <div className="mt-2 relative">
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
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
              <label
                htmlFor="setOtp"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="setOtp"
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpVerified}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white text-[10px]  px-1 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!otpVerified || isSuccess}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Professional Auth Buttons */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-5">
              <div className="mt-0">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  type="icon"
                  size="large"
                />
              </div>

              {/* GitHub Login */}
              <button
                onClick={loginWithGitHub}
                type="button"
                className="flex  items-center justify-center rounded-md bg-white px-2.5 py-3 mt-0.5 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
              >
                <svg
                  className="h-4 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <p className="mt-2 text-center text-sm/6 text-gray-500">
        Your data is securely encrypted and protected
      </p>

      {/* Login Link */}
      <p className="mt-2 text-center text-sm/6 text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterNew;
