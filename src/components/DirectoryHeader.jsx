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
} from "lucide-react";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
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
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="text-blue-600" size={24} />
            <h1 className="text-xl font-semibold text-gray-900">
              {directoryName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Create Folder"
              onClick={onCreateFolderClick}
              disabled={disabled}
            >
              <FolderPlus size={16} />
              New Folder
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Upload Files"
              onClick={onUploadFilesClick}
              disabled={disabled}
            >
              <Upload size={16} />
              Upload
            </button>

            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="User Menu"
              onClick={handleUserIconClick}
            >
              {userPicture ? (
                <img
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  src={userPicture}
                  alt={userName}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    {userPicture ? (
                      <img
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        src={userPicture}
                        alt={userName}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {userName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
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
