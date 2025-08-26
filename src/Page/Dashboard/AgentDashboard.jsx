import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
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
import toast from "react-hot-toast";
import PageLoader from "../../Loading/PageLoader";

/** set your API here */
const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

/** small hook to choose chart height by breakpoint */
const useChartHeight = () => {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  if (w < 640) return 220; // <sm
  if (w < 1024) return 260; // sm–md
  if (w < 1280) return 300; // lg
  return 340; // xl+
};

const AgentDashboard = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // data
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const chartHeight = useChartHeight();

  // fetch agent data
  const fetchAgentData = async (showRefreshLoader = false) => {
    try {
      setError(null);
      showRefreshLoader ? setRefreshing(true) : setLoading(true);
      if (!user?.uid) throw new Error("User not authenticated");

      const { data } = await axios.get(`${API_BASE}/bookings`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch bookings");
      }

      const all = data.data || [];
      // only my assignments
      const mine = all.filter(
        (b) =>
          b?.deliveryAgent &&
          (b.deliveryAgent.email === user?.email ||
            b.deliveryAgent.name === (userData?.name || user?.displayName))
      );

      setAssignedBookings(mine);

      const totalAssigned = mine.length;
      const pending = mine.filter((b) => b.status === "pending").length;
      const pickedUp = mine.filter((b) => b.status === "PickedUp").length;
      const inTransit = mine.filter((b) => b.status === "in-transit").length;
      const delivered = mine.filter((b) => b.status === "delivered").length;
      const failed = mine.filter((b) => b.status === "faild").length;
      const totalEarnings = mine
        .filter((b) => b.status === "delivered")
        .reduce((s, b) => s + (b.totalCharge || 0) * 0.1, 0);

      setStats({
        totalAssigned,
        pending,
        pickedUp,
        inTransit,
        delivered,
        failed,
        totalEarnings,
        successRate: totalAssigned
          ? ((delivered / totalAssigned) * 100).toFixed(1)
          : 0,
      });
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load agent data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchAgentData();
  }, [user]);

  // status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PickedUp":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "faild":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="w-4 h-4" />;
      case "in-transit":
        return <FiTruck className="w-4 h-4" />;
      case "PickedUp":
        return <FiPackage className="w-4 h-4" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "faild":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
    }
  };

  // charts data
  const chartData = useMemo(() => {
    const daily = {};
    assignedBookings.forEach((b) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!daily[date])
        daily[date] = { date, assigned: 0, delivered: 0, earnings: 0 };
      daily[date].assigned += 1;
      if (b.status === "delivered") {
        daily[date].delivered += 1;
        daily[date].earnings += (b.totalCharge || 0) * 0.1;
      }
    });
    return Object.values(daily).slice(-7);
  }, [assignedBookings]);

  const pieData = useMemo(
    () =>
      [
        { name: "Delivered", value: stats.delivered || 0, color: "#10b981" },
        { name: "Pending", value: stats.pending || 0, color: "#f59e0b" },
        { name: "In Transit", value: stats.inTransit || 0, color: "#3b82f6" },
        { name: "Picked Up", value: stats.pickedUp || 0, color: "#8b5cf6" },
        { name: "Failed", value: stats.failed || 0, color: "#ef4444" },
      ].filter((i) => i.value > 0),
    [stats]
  );

  // filters
  const filteredBookings = useMemo(() => {
    return assignedBookings.filter((b) => {
      const okStatus = statusFilter === "all" || b.status === statusFilter;
      const okDate = dateFilter
        ? new Date(b.createdAt).toISOString().split("T")[0] === dateFilter
        : true;
      return okStatus && okDate;
    });
  }, [assignedBookings, statusFilter, dateFilter]);

  // update status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(bookingId);
      const { data } = await axios.patch(
        `${API_BASE}/bookings/${bookingId}/deliveryStatus`,
        { deliveryStatus: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );
      if (!data?.success)
        throw new Error(data?.message || "Failed to update status");
      toast.success(`Booking status updated to ${newStatus}`);
      await fetchAgentData(true);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update booking status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // loading
  if (loading) {
    return <PageLoader message="Loading your Agent dashboard..." />;
  }

  // error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center py-10">
              <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Failed to Load Data
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">
                {error}
              </p>
              <button
                onClick={() => fetchAgentData(true)}
                className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
      {/* header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              🚚 Agent Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {userData?.name || user?.displayName || "Agent"}!
              Manage your assigned deliveries and track your performance.
            </p>
          </div>
          <button
            onClick={() => fetchAgentData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          {
            k: "totalAssigned",
            label: "Total Assigned",
            iconBg: "bg-blue-100 dark:bg-blue-900",
            Icon: FiPackage,
          },
          {
            k: "pending",
            label: "Pending",
            iconBg: "bg-yellow-100 dark:bg-yellow-900",
            Icon: FiClock,
          },
          {
            k: "pickedUp",
            label: "Picked Up",
            iconBg: "bg-purple-100 dark:bg-purple-900",
            Icon: FiTruck,
          },
          {
            k: "delivered",
            label: "Delivered",
            iconBg: "bg-green-100 dark:bg-green-900",
            Icon: FiCheckCircle,
          },
          {
            k: "totalEarnings",
            label: "Earnings",
            iconBg: "bg-emerald-100 dark:bg-emerald-900",
            Icon: FiDollarSign,
            money: true,
          },
        ].map(({ k, label, iconBg, Icon, money }) => (
          <div
            key={k}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {money ? `৳${(stats[k] || 0).toFixed(0)}` : stats[k] || 0}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${iconBg}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-current" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Daily Performance (Last 7 Days)
          </h3>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="assigned"
                  fill="#3b82f6"
                  name="Assigned"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="delivered"
                  fill="#10b981"
                  name="Delivered"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No performance data available
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Delivery Status Distribution
          </h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={chartHeight * 0.18}
                  outerRadius={chartHeight * 0.32}
                  paddingAngle={4}
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No delivery data available
            </div>
          )}
        </div>
      </div>

      {/* filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="PickedUp">Picked Up</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="faild">Failed</option>
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* list/table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Assigned Deliveries ({filteredBookings.length})
          </h2>
        </div>

        {/* mobile cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredBookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <FiTruck className="w-10 h-10 mx-auto mb-3 opacity-60" />
              No assigned deliveries found.
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div key={b._id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {getStatusIcon(b.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm break-all">
                        {b.bookingId}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                          b.status
                        )}`}
                      >
                        {b.status.replace("-", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {b.parcelType}
                    </p>

                    <div className="grid grid-cols-1 gap-2 text-xs mt-3">
                      <div className="flex items-center">
                        <FiUser className="w-3 h-3 mr-1 text-gray-400" />
                        {b.pickupContactName} •{" "}
                        <FiPhone className="w-3 h-3 mx-1 text-gray-400" />
                        {b.pickupPhone}
                      </div>
                      <div className="flex items-start">
                        <FiMapPin className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                        <span className="break-words">{b.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ৳{b.totalCharge}
                        </span>
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400"
                        >
                          <FiEye className="w-4 h-4" /> Details
                        </button>
                      </div>
                    </div>

                    {b.status !== "delivered" && b.status !== "faild" && (
                      <div className="mt-3">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            updateBookingStatus(b._id, e.target.value)
                          }
                          disabled={updatingStatus === b._id}
                          className="w-full text-xs px-2 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="PickedUp">Picked Up</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="faild">Failed</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  "Booking ID",
                  "Status",
                  "Customer Info",
                  "Delivery Address",
                  "Amount",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
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
                    <FiTruck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No assigned deliveries found with current filters.
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
                          {getStatusIcon(b.status)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white break-all">
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          b.status
                        )}`}
                      >
                        {b.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center mb-1">
                          <FiUser className="w-3 h-3 mr-1 text-gray-400" />
                          {b.pickupContactName}
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="w-3 h-3 mr-1 text-gray-400" />
                          {b.pickupPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-start">
                          <FiMapPin className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-xs">{b.deliveryAddress}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ৳{b.totalCharge}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Earn: ৳{((b.totalCharge || 0) * 0.1).toFixed(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {b.status !== "delivered" && b.status !== "faild" && (
                          <div className="relative">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                updateBookingStatus(b._id, e.target.value)
                              }
                              disabled={updatingStatus === b._id}
                              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="PickedUp">Picked Up</option>
                              <option value="in-transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="faild">Failed</option>
                            </select>
                            {updatingStatus === b._id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-800/60 rounded">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* details modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Delivery Details
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <FiXCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Booking Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Weight:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBooking.parcelWeight} kg
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Status:
                    </span>
                    <p className="mt-1">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedBooking.status
                        )}`}
                      >
                        {selectedBooking.status.replace("-", " ")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Pickup Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="break-words">
                      {selectedBooking.pickupContactName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="break-all">
                      {selectedBooking.pickupPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="break-words">
                      {selectedBooking.pickupAddress}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Delivery Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="break-words">
                      {selectedBooking.deliveryContactName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="break-all">
                      {selectedBooking.deliveryPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="break-words">
                      {selectedBooking.deliveryAddress}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Total Amount:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ৳{selectedBooking.totalCharge}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Your Earnings:
                    </span>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ৳{((selectedBooking.totalCharge || 0) * 0.1).toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Payment Method:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedBooking.paymentMethod?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Booking Timeline
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      Assigned:{" "}
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        Last Updated:{" "}
                        {new Date(selectedBooking.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* quick status */}
              {selectedBooking.status !== "delivered" &&
                selectedBooking.status !== "faild" && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Update Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["PickedUp", "in-transit", "delivered", "faild"].map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => {
                              updateBookingStatus(selectedBooking._id, s);
                              setSelectedBooking(null);
                            }}
                            disabled={updatingStatus === selectedBooking._id}
                            className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                              selectedBooking.status === s
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            } disabled:opacity-50`}
                          >
                            {s.replace("-", " ")}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
