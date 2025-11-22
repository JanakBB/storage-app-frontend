import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HardDrive,
  Star,
  Trash2,
  Users,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react";
import { fetchUser, logoutUser } from "../api/userApi";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 1073741824,
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await fetchUser();
      setUser(userData);
      setStorageInfo({
        used: userData.usedStorageInBytes || 0,
        total: userData.maxStorageInBytes || 1073741824,
      });
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "Admin";

  // Base menu items - common for all users
  const baseMenuItems = [
    {
      icon: Home,
      label: "My Drive",
      path: "/",
      active:
        location.pathname === "/" ||
        location.pathname.startsWith("/directory/"),
    },
    { icon: Star, label: "Starred", path: "/starred", disabled: true },
    { icon: Trash2, label: "Trash", path: "/trash", disabled: true },
  ];

  // Combine menu items based on user role
  const menuItems = isAdmin
    ? [
        baseMenuItems[0], // My Drive
        { icon: Users, label: "Users", path: "/users" }, // Users (only for admin)
        ...baseMenuItems.slice(1), // Starred, Trash
      ]
    : baseMenuItems; // Only My Drive, Starred, Trash for regular users

  const handleNavigation = (path, disabled = false) => {
    if (!disabled) {
      navigate(path);
      setIsMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const usedGB = (storageInfo.used / 1024 ** 3).toFixed(2);
  const totalGB = (storageInfo.total / 1024 ** 3).toFixed(0);
  const storagePercentage = (storageInfo.used / storageInfo.total) * 100;

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ zIndex: 1000 }}
        >
          <Menu size={20} />
        </button>

        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed lg:static z-40">
          {/* Header Skeleton */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Navigation Skeleton */}
          <nav className="flex-1 p-2 space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 w-full p-3">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </nav>

          {/* User Info Skeleton */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        style={{ zIndex: 1000 }}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed lg:static z-40 transform transition-transform duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        top-0 left-0
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <HardDrive className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Storage Drive
            </h1>
          </div>
          {/* Show user role badge if user is admin */}
          {isAdmin && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <Users size={12} className="mr-1" />
                Administrator
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path, item.disabled)}
                disabled={item.disabled}
                className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.disabled && (
                  <span className="text-xs text-gray-400 ml-auto">Soon</span>
                )}
                {/* Show admin badge for Users menu item */}
                {item.label === "Users" && isAdmin && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 ml-auto">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Storage Info & User */}
        <div className="p-4 border-t border-gray-200">
          {/* Storage Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {usedGB} GB of {totalGB} GB used
              </span>
              <span>{Math.round(storagePercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* User Info */}
          {user ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {user.picture ? (
                <img
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  src={user.picture}
                  alt={user.name}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                  {isAdmin && (
                    <span className="ml-1 text-purple-600 font-medium">
                      • Admin
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
