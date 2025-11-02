import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import {
  FolderPlus,
  Upload,
  User,
  LogOut,
  LogIn,
  HardDrive,
  Grid3X3,
  List,
} from "lucide-react";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
  selectedItems = new Set(),
  onSelectAll,
  allSelected = false,
  viewMode = "grid",
  onViewModeChange = () => {},
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userPicture, setUserPicture] = useState("");
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(1073741824);
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);

  const usedGB = (usedStorageInBytes / 1024 ** 3).toFixed(2);
  const totalGB = (maxStorageInBytes / 1024 ** 3).toFixed(0);
  const storagePercentage = (usedStorageInBytes / maxStorageInBytes) * 100;

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser();
        setUserName(user.name);
        setUserEmail(user.email);
        setUserPicture(
          user.picture || user.avatar || user.profilePicture || ""
        );
        setMaxStorageInBytes(user.maxStorageInBytes);
        setUsedStorageInBytes(user.usedStorageInBytes);
        setLoggedIn(true);
      } catch (err) {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setUserPicture("");
      }
    }
    loadUser();
  }, []);

  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      setUserPicture("");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      setUserPicture("");
      navigate("/login");
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Selection Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Hide icon on mobile to save space */}
            <HardDrive className="text-blue-600 hidden lg:block" size={24} />
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate max-w-[150px] lg:max-w-none">
              {directoryName}
            </h1>
          </div>

          {/* Selection info */}
          {selectedItems.size > 0 && (
            <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
              {selectedItems.size} selected
            </span>
          )}
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* View Mode Toggle - Hide on very small screens */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-blue-600"
              }`}
              title="Grid View"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-blue-600"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* New Folder - Text hidden on mobile */}
            <button
              className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Create Folder"
              onClick={onCreateFolderClick}
              disabled={disabled}
            >
              <FolderPlus size={16} />
              <span className="hidden lg:inline">New Folder</span>
            </button>

            {/* Upload - Icon only on mobile */}
            <button
              className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Upload Files"
              onClick={onUploadFilesClick}
              disabled={disabled}
            >
              <Upload size={16} />
              <span className="hidden lg:inline">Upload</span>
            </button>

            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="User Menu"
              onClick={handleUserIconClick}
            >
              {userPicture ? (
                <img
                  className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-300"
                  src={userPicture}
                  alt={userName}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={14} />
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    {userPicture ? (
                      <img
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border border-gray-300"
                        src={userPicture}
                        alt={userName}
                      />
                    ) : (
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={18} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">
                        {userName}
                      </h3>
                      <p className="text-gray-500 truncate text-xs lg:text-sm">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  {loggedIn && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {usedGB} GB of {totalGB} GB used
                        </span>
                        <span>{Math.round(storagePercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${storagePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2">
                  {loggedIn ? (
                    <>
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Logout this device
                      </button>
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={handleLogoutAll}
                      >
                        <LogOut size={16} />
                        Logout all devices
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        navigate("/login");
                        setShowUserMenu(false);
                      }}
                    >
                      <LogIn size={16} />
                      Sign in
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectoryHeader;
