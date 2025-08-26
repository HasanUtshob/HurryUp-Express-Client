import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import {
  FiUsers,
  FiPackage,
  FiEye,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiX,
} from "react-icons/fi";
import LoadingSpinner from "../../Loading/LoadingSpinner";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL ||
  "https://hurryup-express-server-1.onrender.com";

/** make all statuses consistent */
const normalizeStatus = (s = "") => {
  const x = String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace("_", "-");
  const map = {
    booked: "pending",
    pending: "pending",
    pickup: "picked-up",
    pickedup: "picked-up",
    "picked-up": "picked-up",
    intransit: "in-transit",
    "in-transit": "in-transit",
    deliverd: "delivered",
    delivered: "delivered",
    faild: "failed",
    failed: "failed",
  };
  return map[x] || "pending";
};

const getStatusColor = (rawStatus) => {
  const status = normalizeStatus(rawStatus);
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "in-transit":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "picked-up":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const getStatusIcon = (rawStatus) => {
  const status = normalizeStatus(rawStatus);
  switch (status) {
    case "delivered":
      return <FiCheckCircle className="w-4 h-4" />;
    case "in-transit":
      return <FiTruck className="w-4 h-4" />;
    case "picked-up":
      return <FiPackage className="w-4 h-4" />;
    case "pending":
      return <FiClock className="w-4 h-4" />;
    case "failed":
      return <FiXCircle className="w-4 h-4" />;
    default:
      return <FiPackage className="w-4 h-4" />;
  }
};

const BookingInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users and bookings data from API
  const fetchData = async (showRefreshLoader = false) => {
    try {
      setError(null);
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      await new Promise((r) => setTimeout(r, 80)); // tiny delay so loader is visible

      // Prepare headers (token optional; backend doesn't require it but keep if present)
      const headers = { "Content-Type": "application/json" };
      if (user?.uid && user?.getIdToken) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (authErr) {
          console.warn("Token fetch failed, continuing without it:", authErr);
        }
      }

      const res = await axios.get(`${API_BASE}/bookings`, { headers });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch bookings");
      }

      const bookings = (res.data.data || []).map((b) => ({
        ...b,
        status: normalizeStatus(b.deliveryStatus || b.status),
      }));
      setAllBookings(bookings);

      // Extract unique users from bookings
      const userMap = new Map();
      bookings.forEach((b) => {
        // try to use explicit user fields if present, else fallback to pickup info
        const uid = b.uid || b.userUid || b.userID || null;
        if (!uid) return;
        if (!userMap.has(uid)) {
          userMap.set(uid, {
            uid,
            name: b.userName || b.pickupContactName || "Unknown User",
            email: b.userEmail || b.email || "No email",
            phone: b.pickupPhone || b.phone || "No phone",
            createdAt: b.createdAt,
          });
        }
      });
      setUsers(Array.from(userMap.values()));
    } catch (e) {
      console.error("Error fetching admin data:", e);
      const msg =
        e.response?.data?.message || e.message || "Failed to load admin data";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Filter functions - simplified
  const filteredUsers = users;

  const getFilteredBookings = (userUid = null) => {
    return allBookings.filter((booking) =>
      userUid ? booking.uid === userUid : true
    );
  };

  // Modal functions
  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  // Toggle user expansion
  const toggleUserExpansion = (userUid) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userUid)) next.delete(userUid);
      else next.add(userUid);
      return next;
    });
  };

  const totalUsers = users.length;
  const totalBookings = allBookings.length;

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load Admin Data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchData(true);
              }}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Loading..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              👥 User & Bookings Info
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              View all users and monitor all bookings
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBookings}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FiPackage className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Users and Bookings List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users & Their Bookings
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers.map((userData) => {
            const userBookings = getFilteredBookings(userData.uid);
            const isExpanded = expandedUsers.has(userData.uid);

            return (
              <div
                key={userData.uid || userData.email || Math.random()}
                className="p-4 sm:p-6"
              >
                {/* User Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 sm:p-4 rounded-lg transition-colors gap-4 sm:gap-0"
                  onClick={() => toggleUserExpansion(userData.uid)}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-base sm:text-lg font-bold">
                        {(userData.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {userData.name || "Unknown User"}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center min-w-0">
                          <FiMail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {userData.email || "No email"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span>{userData.phone || "No phone"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="text-center sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Bookings
                        </p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {userBookings.length}
                        </p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Total Spent
                        </p>
                        <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400">
                          ৳
                          {userBookings
                            .reduce((sum, b) => sum + (b.totalCharge || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* User Bookings Table (Expanded) */}
                {isExpanded && (
                  <div className="mt-4 ml-0 sm:ml-4">
                    {userBookings.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">
                        No bookings found for this user.
                      </p>
                    ) : (
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Booking ID
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                  From
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                  To
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                  Weight
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                                  Date
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {userBookings.map((booking) => (
                                <tr
                                  key={booking.bookingId}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="p-1 bg-gray-100 dark:bg-gray-600 rounded mr-2 sm:mr-3 flex-shrink-0">
                                        {getStatusIcon(booking.status)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                          {booking.bookingId}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {booking.parcelType || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                        booking.status
                                      )}`}
                                    >
                                      <span className="hidden sm:inline">
                                        {normalizeStatus(
                                          booking.status
                                        ).replace("-", " ")}
                                      </span>
                                      <span className="sm:hidden">
                                        {
                                          normalizeStatus(booking.status).split(
                                            "-"
                                          )[0]
                                        }
                                      </span>
                                    </span>
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                                    <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                      {booking.pickupContactName || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                      {booking.pickupAddress || "N/A"}
                                    </div>
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                                    <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                      {booking.deliveryContactName || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                      {booking.deliveryAddress || "N/A"}
                                    </div>
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white hidden md:table-cell">
                                    {booking.parcelWeight || 0}kg
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                    <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                      ৳{booking.totalCharge || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {(
                                        booking.paymentMethod || "N/A"
                                      ).toUpperCase()}
                                    </div>
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                    {booking.createdAt
                                      ? new Date(
                                          booking.createdAt
                                        ).toLocaleDateString()
                                      : "—"}
                                  </td>

                                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                      <button
                                        onClick={() => openModal(booking)}
                                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                        title="View Details"
                                      >
                                        <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No users have made bookings yet.
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Details
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Booking ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {selectedBooking.bookingId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {getStatusIcon(selectedBooking.status)}
                    <span className="ml-1">
                      {normalizeStatus(selectedBooking.status).replace(
                        "-",
                        " "
                      )}
                    </span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parcel Type
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedBooking.parcelType || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedBooking.parcelWeight || 0}kg
                  </p>
                </div>
              </div>

              {/* Pickup Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FiMapPin className="w-4 h-4 mr-2 text-blue-500" />
                  Pickup Details
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.pickupContactName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.pickupPhone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.pickupAddress || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FiTruck className="w-4 h-4 mr-2 text-green-500" />
                  Delivery Details
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.deliveryContactName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.deliveryPhone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.deliveryAddress || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Charges */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Charge:{" "}
                    </span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ৳{selectedBooking.totalCharge || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Method:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {(selectedBooking.paymentMethod || "N/A").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBooking.createdAt
                        ? new Date(selectedBooking.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Updated:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedBooking.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingInfo;
