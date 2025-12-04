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
  Camera,
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
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(16106127360); // 15 GB in bytes
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const usedGB = (usedStorageInBytes / 1024 ** 3).toFixed(2);
  const totalGB = (maxStorageInBytes / 1024 ** 3).toFixed(0);
  const storagePercentage = Math.min(
    (usedStorageInBytes / maxStorageInBytes) * 100,
    100
  );

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const user = await fetchUser();
        setUserName(user.name || "Janak Bahadur Bohara");
        setUserEmail(user.email || "janakcustomx@gmail.com");
        setUserPicture(
          user.picture || user.avatar || user.profilePicture || ""
        );
        setMaxStorageInBytes(user.maxStorageInBytes || 16106127360);
        setUsedStorageInBytes(user.usedStorageInBytes || 0);
        setLoggedIn(true);
      } catch (err) {
        console.log("User not logged in or error fetching user:", err);
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        setUserPicture("");
        setUsedStorageInBytes(0);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleProfilePictureHover = (hovering) => {
    if (loggedIn && userPicture) {
      setShowProfileOverlay(hovering);
    }
  };

  const handleChangeProfilePicture = () => {
    if (loggedIn) {
      // Implement profile picture change functionality
      console.log("Change profile picture clicked");
      // You can trigger a file input for profile picture upload
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Handle profile picture upload here
          console.log("Profile picture selected:", file);
        }
      };
      fileInput.click();
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      setUserPicture("");
      setUsedStorageInBytes(0);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to logout from all devices? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await logoutAllSessions();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      setUserPicture("");
      setUsedStorageInBytes(0);
      navigate("/login");
    } catch (err) {
      console.error("Logout all error:", err);
      alert("Logout from all devices failed. Please try again.");
    } finally {
      setIsLoading(false);
      setShowUserMenu(false);
    }
  };

  const handleLoginRedirect = () => {
    setShowUserMenu(false);
    navigate("/login");
  };

  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
        setShowProfileOverlay(false);
      }
    }

    function handleEscapeKey(e) {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setShowProfileOverlay(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 mt-10">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Selection Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="text-blue-600 hidden lg:block" size={24} />
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate max-w-[150px] lg:max-w-none">
              {directoryName || "My Files"}
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
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-blue-600"
              }`}
              title="Grid View"
              disabled={disabled}
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
              disabled={disabled}
            >
              <List size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 lg:gap-2">
            <button
              className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Create Folder"
              onClick={onCreateFolderClick}
              disabled={disabled || isLoading}
            >
              <FolderPlus size={16} />
              <span className="hidden lg:inline">New Folder</span>
            </button>

            <button
              className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Upload Files"
              onClick={onUploadFilesClick}
              disabled={disabled || isLoading}
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
              multiple
              disabled={disabled}
            />
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              className={`flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors ${
                showUserMenu ? "bg-gray-100" : ""
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              title={isLoading ? "Loading..." : "User Menu"}
              onClick={handleUserIconClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : userPicture ? (
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
              <div className="absolute right-0 top-full mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border border-gray-300 ${
                        loggedIn && userPicture
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                      onMouseEnter={() => handleProfilePictureHover(true)}
                      onMouseLeave={() => handleProfilePictureHover(false)}
                      onClick={handleChangeProfilePicture}
                    >
                      {isLoading ? (
                        <div className="w-full h-full bg-gray-200 animate-pulse" />
                      ) : userPicture ? (
                        <>
                          <img
                            className="w-full h-full object-cover"
                            src={userPicture}
                            alt={userName}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          {showProfileOverlay && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200">
                              <Camera className="text-white" size={18} />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                      )}
                    </div>

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
                      {usedGB === "0.00" && (
                        <p className="text-xs text-green-600 text-center mt-1">
                          Your storage is empty. Start uploading files!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-2">
                  {loggedIn ? (
                    <>
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleLogout}
                        disabled={isLoading}
                      >
                        <LogOut size={16} />
                        {isLoading ? "Logging out..." : "Logout this device"}
                      </button>
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleLogoutAll}
                        disabled={isLoading}
                      >
                        <LogOut size={16} />
                        {isLoading ? "Logging out..." : "Logout all devices"}
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={handleLoginRedirect}
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
