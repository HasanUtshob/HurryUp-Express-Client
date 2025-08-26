import React from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import {
  FiPackage,
  FiTruck,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import { FcBarChart } from "react-icons/fc";

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, userData, SignOut } = useAuth();
  console.log(userData);
  const isActiveLink = (path) => {
    // role-based default dashboard
    const getDefaultDashboardPath = () => {
      if (!userData?.role) return "/dashboard/customer";

      switch (userData.role) {
        case "admin":
          return "/dashboard/admin-dashboard";
        case "agent":
          return "/dashboard/agent";
        case "customer":
          return "/dashboard/customer";
        default:
          return "/dashboard/customer";
      }
    };

    if (location.pathname === "/dashboard") {
      return path === getDefaultDashboardPath();
    }

    // For exact path matching
    if (location.pathname === path) {
      return true;
    }

    // Special handling for dashboard paths to avoid conflicts
    if (path.includes("/dashboard/")) {
      return location.pathname === path;
    }

    // For non-dashboard paths, use startsWith for nested routes
    return location.pathname.startsWith(path + "/");
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        path: "/dashboard/profile",
        icon: FiUser,
        label: t("sidebar.menuItems.profile"),
        emoji: "👤",
      },
    ];

    // Admin-specific items - only show admin routes
    if (userData?.role === "admin") {
      return [
        {
          path: "/dashboard/admin-dashboard",
          icon: FcBarChart,
          label: t("sidebar.menuItems.adminDashboard"),
          emoji: "📊",
        },
        {
          path: "/dashboard/BookingInfo",
          icon: FcBarChart,
          label: t("sidebar.menuItems.userBooking"),
          emoji: "👨‍💼",
        },
        {
          path: "/dashboard/assign-delivery-agent",
          icon: FiTruck,
          label: t("sidebar.menuItems.assignDeliveryAgent"),
          emoji: "🚛",
        },
        {
          path: "/dashboard/agent-requests",
          icon: FiUser,
          label: t("sidebar.menuItems.agentRequests"),
          emoji: "👨‍💼",
        },
        ...baseItems,
      ];
    }

    // Agent-specific items - only show agent routes
    if (userData?.role === "agent") {
      return [
        {
          path: "/dashboard/agent",
          icon: FiSettings,
          label: t("sidebar.menuItems.agentDashboard"),
          emoji: "📊",
        },
        {
          path: "/dashboard/agent-deliveries",
          icon: FiTruck,
          label: t("sidebar.menuItems.myDeliveries"),
          emoji: "🚚",
        },
        ...baseItems,
      ];
    }

    // Customer items (default) - only show customer routes
    return [
      {
        path: "/dashboard/customer",
        icon: FiSettings,
        label: t("sidebar.menuItems.customerDashboard"),
        emoji: "📊",
      },
      {
        path: "/dashboard/my-parcels",
        icon: FiPackage,
        label: t("sidebar.menuItems.bookingHistory"),
        emoji: "📦",
      },
      {
        path: "/dashboard/track-parcel",
        icon: FiTruck,
        label: t("sidebar.menuItems.trackParcel"),
        emoji: "🚚",
      },
      ...baseItems,
      {
        path: "/book-parcel",
        icon: FiPackage,
        label: t("sidebar.menuItems.bookNewParcel"),
        emoji: "➕",
      },
    ];
  };

  const menuItems = getMenuItems();

  const handleSignOut = async () => {
    try {
      await SignOut();
      onClose?.();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:fixed lg:z-auto lg:flex lg:flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Back to Home Button - Top of Sidebar */}
        <div className="md:hidden -pb-0.5 border-b border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            onClick={onClose}
            className="group flex items-center justify-between w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-in-out transform text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 hover:text-green-700 dark:hover:text-green-300 hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-green-100 dark:bg-green-700 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-600 group-hover:shadow-sm group-hover:scale-110 transition-all duration-300">
                <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                  🏠
                </span>
              </div>
              <span className="text-sm font-medium">
                {t("sidebar.backToHome")}
              </span>
            </div>
            <FiChevronRight className="w-4 h-4 transition-all duration-300 text-gray-400 group-hover:text-green-500 dark:group-hover:text-green-400 group-hover:translate-x-1 group-hover:scale-110" />
          </Link>
        </div>

        {/* Sidebar Header */}
        <div className="hidden md:block flex items-center justify-between p-1.5 ml-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🚚</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("sidebar.dashboard")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("sidebar.companyName")}
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {userData?.photoUrl || user?.photoURL ? (
                <img
                  src={userData?.photoUrl || user?.photoURL}
                  alt={t("sidebar.userAvatar")}
                  className="w-12 h-12 rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                  <span className="text-white text-lg font-bold">
                    {(userData?.name || user?.displayName || user?.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {userData?.name || user?.displayName || "User"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userData?.email || user?.email}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {t("sidebar.online")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              {t("sidebar.navigation")}
            </h4>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-in-out transform ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02] hover:shadow-xl hover:scale-[1.03]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-white/20 shadow-sm"
                          : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 group-hover:shadow-sm group-hover:scale-110"
                      }`}
                    >
                      <span
                        className={`text-lg transition-transform duration-300 ${
                          !isActive ? "group-hover:scale-110" : ""
                        }`}
                      >
                        {item.emoji}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <FiChevronRight
                    className={`w-4 h-4 transition-all duration-300 ${
                      isActive
                        ? "rotate-90 text-white/80"
                        : "text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 group-hover:scale-110"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button
              onClick={handleSignOut}
              className="group flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-300 transform hover:scale-[1.01]"
            >
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/30 group-hover:scale-110 transition-all duration-300">
                <FiLogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                {t("sidebar.signOut")}
              </span>
            </button>
          </div>

          {/* Version Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              {t("sidebar.version")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
