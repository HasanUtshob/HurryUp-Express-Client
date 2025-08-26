import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { ThemeContext } from "../Context/ThemeContext";
import LanguageSwitcher from "../Page/Component/LanguageSwitcher";

const Navber = () => {
  const { t } = useTranslation();
  const { darkmode, setDarkmode } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, SignOut } = useAuth();
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const getLinkClasses = (path) => {
    const baseClasses =
      "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105";
    const activeClasses =
      "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg";
    const inactiveClasses =
      "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md";

    return `${baseClasses} ${
      isActiveLink(path) ? activeClasses : inactiveClasses
    }`;
  };

  // Get role-based dashboard URL
  const getDashboardUrl = () => {
    if (!userData?.role) return "/dashboard/customer"; // Default to customer for new users

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

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
      <div className="navbar max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="navbar-start flex items-center">
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 min-h-0 h-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>

            {/* Mobile dropdown menu */}
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-2xl bg-white dark:bg-gray-800 rounded-2xl w-64 sm:w-72 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
            >
              {/* Show Book Parcel only for customers */}
              {user && (userData?.role === "customer" || !userData?.role) && (
                <>
                  <li className="mb-2">
                    <Link
                      to="/book-parcel"
                      className={`${getLinkClasses(
                        "/book-parcel"
                      )} w-full justify-start text-sm sm:text-base`}
                    >
                      <span className="mr-3 text-base">📦</span>
                      {t("nav.bookParcel")}
                    </Link>
                  </li>

                  <li className="mb-2">
                    <Link
                      to="/become-agent"
                      className={`${getLinkClasses(
                        "/become-agent"
                      )} w-full justify-start text-sm sm:text-base`}
                    >
                      <span className="mr-3 text-base">👨‍💼</span>
                      {t("nav.becomeAgent")}
                    </Link>
                  </li>
                </>
              )}

              <li className="mb-2">
                <Link
                  to="/contact"
                  className={`${getLinkClasses(
                    "/contact"
                  )} w-full justify-start text-sm sm:text-base`}
                >
                  <span className="mr-3 text-base">📞</span>
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand/Logo */}
          <Link
            to="/"
            className="btn btn-ghost text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 ml-2 lg:ml-0 min-h-0 h-auto py-2"
          >
            <span className="text-xl sm:text-2xl mr-1 sm:mr-2">🚚</span>
            <span className="hidden xs:inline sm:inline">HurryUp Express</span>
            <span className="xs:hidden sm:hidden">HurryUp</span>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 space-x-2">
            {/* Show Book Parcel and Become Agent only for customers */}
            {user && (userData?.role === "customer" || !userData?.role) && (
              <>
                <li>
                  <Link
                    to="/book-parcel"
                    className={getLinkClasses("/book-parcel")}
                  >
                    <span className="mr-2">📦</span>
                    {t("nav.bookParcel")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/become-agent"
                    className={getLinkClasses("/become-agent")}
                  >
                    <span className="mr-2">👨‍💼</span>
                    {t("nav.becomeAgent")}
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link to="/contact" className={getLinkClasses("/contact")}>
                <span className="mr-2">📞</span>
                {t("nav.contact")}
              </Link>
            </li>

            {/* {user && (
              <li>
                <Link
                  to={getDashboardUrl()}
                  className={`${getLinkClasses(
                    getDashboardUrl()
                  )} border-0 bg-transparent`}
                >
                  <span className="mr-2">📊</span>
                  Dashboard
                </Link>
              </li>
            )} */}
          </ul>
        </div>

        {/* Right side buttons */}
        <div className="navbar-end flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          {/* Language Switcher */}
          <div className="flex-shrink-0">
            <LanguageSwitcher />
          </div>

          {/* Theme toggle button */}
          <button
            onClick={() => setDarkmode(!darkmode)}
            className="btn btn-ghost p-2 sm:p-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-purple-600 text-white hover:shadow-lg transform hover:scale-110 transition-all duration-300 border-0 min-h-0 h-8 w-8 sm:h-10 sm:w-10"
            title={
              darkmode ? t("ui.switchToLightMode") : t("ui.switchToDarkMode")
            }
          >
            <span className="text-sm sm:text-lg">{darkmode ? "☀️" : "🌙"}</span>
          </button>

          {/* Conditional Authentication UI */}
          {user ? (
            /* Avatar Dropdown for Authenticated Users */
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 min-h-0 h-8 w-8 sm:h-10 sm:w-10"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full ring-1 sm:ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2 ring-offset-base-100">
                  {userData?.photoUrl || user?.photoURL ? (
                    <img
                      alt={t("ui.userAvatar")}
                      src={userData?.photoUrl || user?.photoURL}
                      className="rounded-full w-full h-full object-cover"
                    />
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-bold">
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
                    </div>
                  )}
                </div>
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-3 sm:p-4 shadow-2xl bg-white dark:bg-gray-800 rounded-2xl w-60 sm:w-64 md:w-72 border border-gray-200 dark:border-gray-700 backdrop-blur-md"
              >
                {/* User Info Section */}
                <li className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full ring-2 ring-blue-500">
                        {userData?.photoUrl || user?.photoURL ? (
                          <img
                            alt={t("ui.userAvatar")}
                            src={userData?.photoUrl || user?.photoURL}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="avatar placeholder">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-12">
                              <span className="text-lg font-bold">
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
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {userData?.name || user?.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userData?.email || user?.email}
                      </p>
                    </div>
                  </div>
                </li>

                {/* Menu Items */}
                {/* Dashboard Link - Always show for authenticated users */}
                <li>
                  <Link
                    to={getDashboardUrl()}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                  >
                    <span className="text-lg">📊</span>
                    <span>{t("nav.dashboard")}</span>
                  </Link>
                </li>

                <div className="divider my-2"></div>

                {/* Logout Button */}
                <li>
                  <button
                    onClick={async () => {
                      try {
                        await SignOut();
                        toast.success("Logged out successfully!");
                        navigate("/");
                      } catch (error) {
                        console.error("Logout error:", error);
                        toast.error("Failed to logout. Please try again.");
                      }
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-all duration-300 w-full text-left"
                  >
                    <span className="text-lg">🚪</span>
                    <span>{t("nav.logout")}</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            /* Login Button for Non-Authenticated Users */
            <Link
              to="/login"
              className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white border-0 px-3 sm:px-4 md:px-6 py-1 sm:py-2 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm md:text-base min-h-0 h-8 sm:h-10"
            >
              <span className="mr-1 sm:mr-2 text-sm">👤</span>
              <span className="hidden xs:inline sm:inline">
                {t("nav.login")}
              </span>
              <span className="xs:hidden sm:hidden">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navber;
