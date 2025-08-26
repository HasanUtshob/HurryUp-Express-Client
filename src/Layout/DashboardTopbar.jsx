import React, { useContext } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../Context/ThemeContext";
import useAuth from "../hooks/useAuth";
import { FiMenu, FiHome, FiChevronRight, FiSun, FiMoon } from "react-icons/fi";

const DashboardTopbar = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { darkmode, setDarkmode } = useContext(ThemeContext);
  const location = useLocation();
  const { user, userData } = useAuth();

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { label: t("topbar.breadcrumbs.home"), path: "/", icon: FiHome },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Convert segment to readable label using translations
      let label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Special cases for better labels with translations
      if (segment === "dashboard") label = t("topbar.breadcrumbs.dashboard");
      if (segment === "my-parcels") label = t("topbar.breadcrumbs.myParcels");
      if (segment === "track-parcel")
        label = t("topbar.breadcrumbs.trackParcel");
      if (segment === "book-parcel") label = t("topbar.breadcrumbs.bookParcel");
      if (segment === "admin-dashboard")
        label = t("topbar.breadcrumbs.adminDashboard");
      if (segment === "agent") label = t("topbar.breadcrumbs.agentDashboard");
      if (segment === "customer")
        label = t("topbar.breadcrumbs.customerDashboard");
      if (segment === "profile") label = t("topbar.breadcrumbs.profile");
      if (segment === "assign-delivery-agent")
        label = t("topbar.breadcrumbs.assignDeliveryAgent");
      if (segment === "agent-requests")
        label = t("topbar.breadcrumbs.agentRequests");
      if (segment === "agent-deliveries")
        label = t("topbar.breadcrumbs.agentDeliveries");
      if (segment === "BookingInfo")
        label = t("topbar.breadcrumbs.bookingInfo");

      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Menu Button & Breadcrumbs */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
            >
              <FiMenu className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
            </button>

            {/* Logo & Brand - Mobile */}
            <div className="lg:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🚚</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                HurryUp
              </span>
            </div>

            {/* Breadcrumbs - Desktop */}
            <nav className="hidden lg:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && (
                    <FiChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                  <div className="flex items-center space-x-1">
                    {crumb.icon && index === 0 && (
                      <crumb.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                    <Link
                      to={crumb.path}
                      className={`${
                        crumb.isLast
                          ? "text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      } transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Back to Home Button */}
            <Link
              to="/"
              className="md:flex hidden md:block items-center space-x-2 px-3 py-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-all duration-200 group"
              title={t("topbar.backToHome")}
            >
              <FiHome className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline text-sm font-medium">
                {t("topbar.home")}
              </span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkmode(!darkmode)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
              title={
                darkmode
                  ? t("topbar.switchToLightMode")
                  : t("topbar.switchToDarkMode")
              }
            >
              {darkmode ? (
                <FiSun className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <FiMoon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </button>

            {/* User Greeting */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="relative flex-shrink-0">
                {userData?.photoUrl || user?.photoURL ? (
                  <img
                    src={userData?.photoUrl || user?.photoURL}
                    alt={t("topbar.userAvatar")}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {(
                        userData?.name ||
                        user?.displayName ||
                        user?.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>

              {/* Desktop Greeting */}
              <div className="hidden md:block text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {t("topbar.welcome")},{" "}
                  {userData?.name || user?.displayName || "User"}!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userData?.role
                    ? t(`topbar.roles.${userData.role.toLowerCase()}`)
                    : t("topbar.roles.customer")}
                </p>
              </div>

              {/* Mobile Greeting - Compact */}
              <div className="md:hidden text-left min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {t("topbar.hi")},{" "}
                  {
                    (userData?.name || user?.displayName || "User").split(
                      " "
                    )[0]
                  }
                  !
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userData?.role
                    ? t(`topbar.roles.${userData.role.toLowerCase()}`)
                    : t("topbar.roles.customer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
