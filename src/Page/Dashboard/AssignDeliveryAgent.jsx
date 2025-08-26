import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiPhone,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiBox,
  FiDollarSign,
  FiCheckCircle,
  FiX,
  FiUserPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";
import PageLoader from "../../Loading/PageLoader";

const AssignDeliveryAgent = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Data states
  const [pendingBookings, setPendingBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Fetch pending bookings from API
  const fetchPendingBookings = async (showRefreshLoader = false) => {
    try {
      setError(null);

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      let headers = { "Content-Type": "application/json" };

      if (user?.uid) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (authError) {
          console.warn("Authentication failed:", authError);
          setError("Authentication failed. Please login again.");
          return;
        }
      } else {
        setError("Please login to access delivery agent assignment.");
        return;
      }

      const response = await axios.get(
        "https://hurryup-express-server-1.onrender.com/bookings?status=pending",
        { headers }
      );

      if (response.data.success) {
        const bookings = response.data.data || [];
        setPendingBookings(bookings);
        setFilteredBookings(bookings);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch pending bookings"
        );
      }
    } catch (error) {
      console.error("Error fetching pending bookings:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized access. Admin privileges required.");
      } else if (error.response?.status === 403) {
        setError("Access forbidden. Please contact administrator.");
      } else if (error.code === "ECONNREFUSED") {
        setError(
          "Cannot connect to server. Please ensure the backend is running."
        );
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load pending bookings"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, [user]);

  // Filter bookings based on search term and date
  useEffect(() => {
    let filtered = pendingBookings.filter((booking) => {
      const matchesSearch =
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.pickupContactName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.deliveryContactName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.pickupAddress
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.deliveryAddress
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.parcelType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = dateFilter
        ? new Date(booking.createdAt).toISOString().split("T")[0] === dateFilter
        : true;

      return matchesSearch && matchesDate;
    });

    setFilteredBookings(filtered);
  }, [searchTerm, dateFilter, pendingBookings]);

  // Fetch available agents
  const fetchAvailableAgents = async () => {
    setLoadingAgents(true);
    try {
      let headers = { "Content-Type": "application/json" };

      if (user?.uid) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        "https://hurryup-express-server-1.onrender.com/users?role=agent",
        { headers }
      );

      if (response.data.success) {
        setAvailableAgents(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch agents");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load available agents");
      setAvailableAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Handle assign delivery agent
  const handleAssignAgent = async (agent) => {
    if (!selectedBooking || !agent) {
      toast.error("Please select an agent");
      return;
    }

    setAssigning(true);
    try {
      let headers = { "Content-Type": "application/json" };

      if (user?.uid) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const assignmentData = {
        bookingId: selectedBooking._id,
        deliveryAgent: {
          name: agent.name || "Unknown Agent",
          phone: agent.phone || "",
          email: agent.email || "",
          uid: agent.uid || "",
          assignedAt: new Date().toISOString(),
          assignedBy: user?.email || user?.uid,
        },
        status: "Assigned",
      };

      const response = await axios.patch(
        `https://hurryup-express-server-1.onrender.com/bookings/${selectedBooking._id}/assign-agent`,
        assignmentData,
        { headers }
      );

      if (response.data.success) {
        toast.success(
          `Delivery agent "${agent.name}" assigned successfully to booking ${selectedBooking.bookingId}`
        );

        setPendingBookings((prev) =>
          prev.filter((booking) => booking._id !== selectedBooking._id)
        );

        setShowAssignModal(false);
        setSelectedBooking(null);
        setSelectedAgent(null);
      } else {
        throw new Error(
          response.data.message || "Failed to assign delivery agent"
        );
      }
    } catch (error) {
      console.error("Error assigning delivery agent:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign delivery agent"
      );
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = (booking) => {
    setSelectedBooking(booking);
    setShowAssignModal(true);
    setSelectedAgent(null);
    fetchAvailableAgents();
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedBooking(null);
    setSelectedAgent(null);
    setAvailableAgents([]);
  };

  if (loading) {
    return <PageLoader message="Loading Assign Delivery Page....." />;
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="text-center py-8 sm:py-12">
            <FiAlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load Pending Bookings
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 px-4">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                fetchPendingBookings();
              }}
              disabled={loading || refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <FiRefreshCw
                className={`w-4 h-4 mr-2 ${
                  loading || refreshing ? "animate-spin" : ""
                }`}
              />
              {loading || refreshing ? "Loading..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white truncate">
              🚚 Assign Delivery Agent
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
              Assign delivery agents to pending bookings
            </p>
          </div>
          <button
            onClick={() => fetchPendingBookings(true)}
            disabled={refreshing}
            className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-xs sm:text-sm lg:text-base font-medium"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Pending Bookings
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {pendingBookings.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-shrink-0">
              <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Filtered Results
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {filteredBookings.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <FiFilter className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Total Value
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                ৳
                {filteredBookings
                  .reduce((sum, booking) => sum + (booking.totalCharge || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
              <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by booking ID, contact name, address, or parcel type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="w-full sm:w-40 lg:w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Bookings Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Pending Bookings ({filteredBookings.length})
          </h2>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <FiPackage className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              No pending bookings found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">
              {searchTerm || dateFilter
                ? "Try adjusting your search or filter criteria."
                : "All bookings have been assigned to delivery agents."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-shrink-0">
                        <FiPackage className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                          {booking.bookingId}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <FiCalendar className="w-3 h-3 mr-1" />
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          ৳{booking.totalCharge}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {booking.paymentMethod.toUpperCase()}
                        </div>
                      </div>
                      <button
                        onClick={() => openAssignModal(booking)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FiUserPlus className="w-4 h-4 mr-2" />
                        Assign Agent
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Pickup Info */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Pickup Info
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FiUser className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {booking.pickupContactName}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FiPhone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{booking.pickupPhone}</span>
                        </div>
                        <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                          <FiMapPin className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {booking.pickupAddress}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Delivery Info
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FiUser className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {booking.deliveryContactName}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FiPhone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{booking.deliveryPhone}</span>
                        </div>
                        <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                          <FiMapPin className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {booking.deliveryAddress},{" "}
                            {booking.deliveryDivision}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Parcel Details */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Parcel Details
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <FiPackage className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{booking.parcelType}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FiBox className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{booking.parcelWeight}kg</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.parcelSize}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Agent Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign Delivery Agent
                </h3>
                <button
                  onClick={closeAssignModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Booking Details
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>ID:</strong> {selectedBooking.bookingId}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>From:</strong> {selectedBooking.pickupContactName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>To:</strong> {selectedBooking.deliveryContactName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Amount:</strong> ৳{selectedBooking.totalCharge}
                </p>
              </div>

              {/* Available Agents Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Available Delivery Agents
                </h4>

                {loadingAgents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      Loading agents...
                    </span>
                  </div>
                ) : availableAgents.length === 0 ? (
                  <div className="text-center py-8">
                    <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No delivery agents available
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Please add agents with role: "agent" to the system
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Agent Info
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {availableAgents.map((agent) => (
                          <tr
                            key={agent._id || agent.uid}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              selectedAgent?._id === agent._id
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-sm font-bold">
                                    {(agent.name || "A")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {agent.name || "Unknown Agent"}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {agent.uid || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {agent.phone || "No phone"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                                {agent.email || "No email"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleAssignAgent(agent)}
                                disabled={assigning}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {assigning ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <FiCheckCircle className="w-3 h-3 mr-1" />
                                    Assign
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignDeliveryAgent;
