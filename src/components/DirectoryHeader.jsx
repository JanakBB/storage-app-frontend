import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  DollarSign,
  Crown,
  CloudUpload,
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
          {/* Main Title with Premium Effects */}
          <div className="group flex items-center gap-2.5">
            {/* Animated HardDrive Icon */}
            <div className="relative">
              <HardDrive
                size={28}
                className="text-gradient-to-br from-blue-500 to-cyan-500 lg:block hidden group-hover:rotate-12 transition-transform duration-300"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Title with gradient text */}
            <div className="relative">
              <h1 className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 truncate max-w-[180px] lg:max-w-none animate-gradient-x">
                {directoryName || "My Files"}
              </h1>

              {/* Subtle underline effect on hover */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300 rounded-full"></div>
            </div>
          </div>

          {/* Selection Info - Premium Badge */}
          {selectedItems.size > 0 && (
            <div className="relative group">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 rounded-full shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-200">
                {/* Animated dot */}
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>

                <span>{selectedItems.size}</span>
                <span className="hidden sm:inline">selected</span>
                <span className="sm:hidden">sel</span>

                {/* Chevron indicator */}
                <ChevronRight size={12} className="opacity-80" />
              </span>

              {/* Tooltip for selection */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
                selected
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions and User Menu */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 border border-gray-200 shadow-sm">
            {/* Grid View Button - Premium Version */}
            <button
              onClick={() => onViewModeChange("grid")}
              className={`group relative p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                viewMode === "grid"
                  ? "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white shadow-lg scale-105 ring-2 ring-blue-400/30"
                  : "text-gray-600 hover:bg-gradient-to-br hover:from-blue-50 hover:via-cyan-50 hover:to-white hover:text-blue-700 hover:shadow-md hover:scale-105"
              }`}
              title="Grid View"
              disabled={disabled}
            >
              {/* Active indicator dot */}
              {viewMode === "grid" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-ping"></div>
              )}

              {/* Active glow effect */}
              {viewMode === "grid" && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl blur-sm"></div>
              )}

              <Grid3X3
                size={20}
                className={`relative z-10 ${
                  viewMode === "grid"
                    ? "animate-bounce"
                    : "group-hover:scale-110 group-hover:rotate-12"
                } transition-transform`}
              />

              {/* Hover text indicator */}
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Grid View
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300/50 mx-0.5"></div>

            {/* List View Button - Premium Version */}
            <button
              onClick={() => onViewModeChange("list")}
              className={`group relative p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                viewMode === "list"
                  ? "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white shadow-lg scale-105 ring-2 ring-purple-400/30"
                  : "text-gray-600 hover:bg-gradient-to-br hover:from-purple-50 hover:via-pink-50 hover:to-white hover:text-purple-700 hover:shadow-md hover:scale-105"
              }`}
              title="List View"
              disabled={disabled}
            >
              {/* Active indicator dot */}
              {viewMode === "list" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
              )}

              {/* Active glow effect */}
              {viewMode === "list" && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl blur-sm"></div>
              )}

              <List
                size={20}
                className={`relative z-10 ${
                  viewMode === "list"
                    ? "animate-pulse"
                    : "group-hover:scale-110 group-hover:-rotate-12"
                } transition-transform`}
              />

              {/* Hover text indicator */}
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                List View
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 lg:gap-2">
            <Link to="/pricing">
              <button
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 border-0 rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                title="View Pricing Plans"
              >
                <DollarSign size={18} className="animate-pulse" />
                <span>PRICING</span>
                <Crown size={16} />
              </button>
            </Link>
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 border-0 rounded-lg hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              title="Create New Folder"
              onClick={onCreateFolderClick}
              disabled={disabled || isLoading}
            >
              <FolderPlus size={18} className="animate-bounce" />
              <span className="hidden lg:inline font-bold">NEW FOLDER</span>
              <span className="lg:hidden">Folder</span>
            </button>

            <button
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              title="Upload Files"
              onClick={onUploadFilesClick}
              disabled={disabled || isLoading}
            >
              <Upload size={18} className="group-hover:animate-bounce" />
              <span className="hidden lg:inline font-bold">UPLOAD FILES</span>
              <span className="lg:hidden">Upload</span>
              <CloudUpload size={16} className="opacity-80" />
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
