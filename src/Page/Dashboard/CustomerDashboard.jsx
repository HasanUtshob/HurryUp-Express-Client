import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import PageLoader from "../../Loading/PageLoader";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiUser,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

// normalize to: pending | picked-up | in-transit | delivered | failed
const normalizeStatus = (s = "") => {
  const x = String(s).toLowerCase().trim().replace(/\s+|_/g, "-");
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

const statusBadge = (status) => {
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

const statusIcon = (status) => {
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

const CustomerDashboard = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchCustomerData = async (showRefreshLoader = false) => {
    try {
      setError(null);
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      if (!user?.uid) throw new Error("User not authenticated");

      // IMPORTANT: customer endpoint is /bookings/:uid (NOT ?uid=)
      const res = await axios.get(`${API_BASE}/bookings/${user.uid}`, {
        headers: { "Content-Type": "application/json" },
      });

      // server returns array directly for this endpoint
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = raw.map((b) => ({
        ...b,
        status: normalizeStatus(b.deliveryStatus || b.status),
      }));
      setBookings(normalized);

      const totalBookings = normalized.length;
      const totalSpent = normalized.reduce(
        (sum, b) => sum + (b.totalCharge || 0),
        0
      );
      const delivered = normalized.filter(
        (b) => b.status === "delivered"
      ).length;
      const pending = normalized.filter((b) => b.status === "pending").length;
      const inTransit = normalized.filter(
        (b) => b.status === "in-transit"
      ).length;
      const pickedUp = normalized.filter(
        (b) => b.status === "picked-up"
      ).length;
      const failed = normalized.filter((b) => b.status === "failed").length;

      setStats({
        totalBookings,
        totalSpent,
        delivered,
        pending,
        inTransit,
        pickedUp,
        failed,
        successRate: totalBookings
          ? ((delivered / totalBookings) * 100).toFixed(1)
          : 0,
      });
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Failed to load customer data"
      );
      setBookings([]);
      setStats({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchCustomerData();
  }, [user]);

  // Filters apply on normalized statuses
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesDate = dateFilter
      ? new Date(b.createdAt).toISOString().split("T")[0] === dateFilter
      : true;
    return matchesStatus && matchesDate;
  });

  const monthlyChartData = (() => {
    const monthly = {};
    bookings.forEach((b) => {
      const month = new Date(b.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthly[month]) monthly[month] = { month, bookings: 0, spent: 0 };
      monthly[month].bookings += 1;
      monthly[month].spent += b.totalCharge || 0;
    });
    return Object.values(monthly).slice(-6);
  })();

  const pieData = [
    { name: "Delivered", value: stats.delivered || 0, color: "#10b981" },
    { name: "Pending", value: stats.pending || 0, color: "#f59e0b" },
    { name: "In Transit", value: stats.inTransit || 0, color: "#3b82f6" },
    { name: "Picked Up", value: stats.pickedUp || 0, color: "#8b5cf6" },
    { name: "Failed", value: stats.failed || 0, color: "#ef4444" },
  ].filter((i) => i.value > 0);

  if (loading)
    return <PageLoader message="Loading your customer dashboard..." />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load Data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchCustomerData(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const barHeight = 200;
  const pieHeight = 200;
  const barHeightLg = 260;
  const pieHeightLg = 260;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              📦 My Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 break-words">
              Welcome back, {userData?.name || user?.displayName || "Customer"}!
              <span className="hidden sm:inline">
                {" "}
                Track your bookings and delivery status.
              </span>
            </p>
          </div>
          <button
            onClick={() => fetchCustomerData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: "Total Bookings",
            value: stats.totalBookings || 0,
            icon: (
              <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            ),
            bg: "bg-blue-100 dark:bg-blue-900",
          },
          {
            title: "Total Spent",
            value: `৳${(stats.totalSpent || 0).toLocaleString()}`,
            icon: (
              <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            ),
            bg: "bg-green-100 dark:bg-green-900",
          },
          {
            title: "Delivered",
            value: stats.delivered || 0,
            icon: (
              <FiCheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ),
            bg: "bg-purple-100 dark:bg-purple-900",
          },
          {
            title: "Success Rate",
            value: `${stats.successRate || 0}%`,
            icon: (
              <FiTrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            ),
            bg: "bg-yellow-100 dark:bg-yellow-900",
          },
        ].map((c, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {c.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {c.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${c.bg}`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Monthly Booking Trends
          </h3>
          {monthlyChartData.length > 0 ? (
            <div className="w-full overflow-hidden">
              <div className="sm:hidden">
                <ResponsiveContainer width="100%" height={barHeight}>
                  <BarChart
                    data={monthlyChartData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="bookings"
                      fill="#3b82f6"
                      name="Bookings"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="spent"
                      fill="#8b5cf6"
                      name="Spent (৳)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="hidden sm:block">
                <ResponsiveContainer width="100%" height={barHeightLg}>
                  <BarChart
                    data={monthlyChartData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="bookings"
                      fill="#3b82f6"
                      name="Bookings"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="spent"
                      fill="#8b5cf6"
                      name="Spent (৳)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
              No booking data available
            </div>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Delivery Status Distribution
          </h3>
          {pieData.length > 0 ? (
            <div className="w-full overflow-hidden">
              <div className="sm:hidden">
                <ResponsiveContainer width="100%" height={pieHeight}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="hidden sm:block">
                <ResponsiveContainer width="100%" height={pieHeightLg}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
              No delivery data available
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="picked-up">Picked Up</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">
            <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
            No bookings found with current filters.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                  {statusIcon(b.status)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {b.bookingId}
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(
                        b.status
                      )}`}
                    >
                      {b.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {b.parcelType} • ৳{b.totalCharge}
                  </div>
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <div className="flex">
                      <FiMapPin className="w-3 h-3 mr-1 text-green-500 mt-0.5 shrink-0" />
                      <span className="break-words">{b.pickupAddress}</span>
                    </div>
                    <div className="flex">
                      <FiMapPin className="w-3 h-3 mr-1 text-red-500 mt-0.5 shrink-0" />
                      <span className="break-words">{b.deliveryAddress}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                    >
                      <FiEye className="w-4 h-4" /> View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Bookings ({filteredBookings.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  "Booking ID",
                  "Status",
                  "From → To",
                  "Amount",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <FiPackage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No bookings found with current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                          {statusIcon(b.status)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {b.bookingId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {b.parcelType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(
                          b.status
                        )}`}
                      >
                        {b.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center mb-1">
                          <FiMapPin className="w-3 h-3 mr-1 text-green-500" />
                          <span className="truncate max-w-[260px]">
                            {b.pickupAddress}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="w-3 h-3 mr-1 text-red-500" />
                          <span className="truncate max-w-[260px]">
                            {b.deliveryAddress}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ৳{b.totalCharge}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {b.paymentMethod?.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Booking Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  aria-label="Close"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Booking Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Booking Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Booking ID:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white break-all">
                      {selectedBooking.bookingId}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Status:
                    </span>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(
                          selectedBooking.status
                        )}`}
                      >
                        {selectedBooking.status.replace("-", " ")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Parcel Type:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBooking.parcelType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Weight:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBooking.parcelWeight} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Pickup */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Pickup Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="break-words">
                      {selectedBooking.pickupContactName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="break-all">
                      {selectedBooking.pickupPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      {selectedBooking.pickupAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Delivery Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="break-words">
                      {selectedBooking.deliveryContactName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="break-all">
                      {selectedBooking.deliveryPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      {selectedBooking.deliveryAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Total Amount:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ৳{selectedBooking.totalCharge}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Payment Method:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBooking.paymentMethod?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Agent */}
              {selectedBooking.deliveryAgent && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Delivery Agent
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="break-words">
                        {selectedBooking.deliveryAgent.name}
                      </span>
                    </div>
                    {selectedBooking.deliveryAgent.phone && (
                      <div className="flex items-center">
                        <FiPhone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="break-all">
                          {selectedBooking.deliveryAgent.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Booking Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      Created:{" "}
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div className="flex items-start">
                      <FiCalendar className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="break-words">
                        Last Updated:{" "}
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

export default CustomerDashboard;
