import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { socket } from "../../socket";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiMapPin,
  FiPhone,
  FiUser,
  FiSearch,
  FiFilter,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import PageLoader from "../../Loading/PageLoader";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

const AgentDeliveryManagement = () => {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [assignedParcels, setAssignedParcels] = useState([]);
  const [filteredParcels, setFilteredParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Failure modal states
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [failingParcelId, setFailingParcelId] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // GPS tracking states
  const [trackingParcels, setTrackingParcels] = useState(new Set());

  // ---- INTERNAL REFS FOR ROBUST GPS ----
  const watchIdsRef = useRef(new Map()); // parcelId -> watchId
  const retryTimersRef = useRef(new Map()); // parcelId -> timeoutId
  const permListenerSetRef = useRef(false); // set once for geolocation permission

  // Status configuration with standardized names
  const statusConfig = {
    pending: {
      label: "Pending",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: FiClock,
      bgColor: "bg-yellow-500",
    },
    "picked-up": {
      label: "Picked Up",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      icon: FiPackage,
      bgColor: "bg-purple-500",
    },
    "in-transit": {
      label: "In Transit",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: FiTruck,
      bgColor: "bg-blue-500",
    },
    delivered: {
      label: "Delivered",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: FiCheckCircle,
      bgColor: "bg-green-500",
    },
    failed: {
      label: "Failed",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: FiXCircle,
      bgColor: "bg-red-500",
    },
  };

  const normalizeStatus = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .replace(/[\s_]+/g, "-");

  // Fetch agent's assigned parcels
  const fetchAssignedParcels = async (showRefreshLoader = false) => {
    try {
      setError(null);
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      if (!user?.uid) throw new Error("User not authenticated");

      const res = await axios.get(`${API_BASE}/bookings`, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.success) {
        const allBookings = res.data.data || [];

        // Filter bookings assigned to this agent
        const agentParcels = allBookings.filter(
          (b) =>
            b.deliveryAgent &&
            (b.deliveryAgent.email === user?.email ||
              b.deliveryAgent.name === (userData?.name || user?.displayName))
        );

        // Normalize status (handles pickedUp -> picked-up, in_transit -> in-transit etc.)
        const standardizedParcels = agentParcels.map((p) => ({
          ...p,
          status: normalizeStatus(p.deliveryStatus || p.status || "pending"),
        }));

        setAssignedParcels(standardizedParcels);
        setFilteredParcels(standardizedParcels);
      } else {
        throw new Error(res.data?.message || "failed to fetch parcels");
      }
    } catch (e) {
      console.error("Error fetching assigned parcels:", e);
      setError(
        e.response?.data?.message ||
          e.message ||
          "failed to load assigned parcels"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.uid) fetchAssignedParcels();
  }, [user]);

  // Filter & search
  useEffect(() => {
    let filtered = [...assignedParcels];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.bookingId?.toLowerCase().includes(q) ||
          p.deliveryContactName?.toLowerCase().includes(q) ||
          p.pickupContactName?.toLowerCase().includes(q) ||
          p.deliveryAddress?.toLowerCase().includes(q) ||
          p.parcelType?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "amount":
          return (b.totalCharge || 0) - (a.totalCharge || 0);
        default:
          return 0;
      }
    });

    setFilteredParcels(filtered);
  }, [assignedParcels, searchTerm, statusFilter, sortBy]);

  // Failure button
  const handleFailureClick = (parcelId) => {
    setFailingParcelId(parcelId);
    setFailureReason("");
    setShowFailureModal(true);
  };

  // Submit failure
  const submitFailure = async () => {
    if (!failureReason.trim()) {
      toast.error("Please provide a failure reason");
      return;
    }
    await updateParcelStatus(failingParcelId, "failed", failureReason.trim());
    setShowFailureModal(false);
    setFailureReason("");
    setFailingParcelId(null);
  };

  // ------- ROBUST GPS: helpers -------
  const clearRetryTimer = (parcelId) => {
    const t = retryTimersRef.current.get(parcelId);
    if (t) {
      clearTimeout(t);
      retryTimersRef.current.delete(parcelId);
    }
  };

  const scheduleRetry = (parcelId, fn, delay = 5000) => {
    clearRetryTimer(parcelId);
    const t = setTimeout(() => {
      retryTimersRef.current.delete(parcelId);
      fn();
    }, delay);
    retryTimersRef.current.set(parcelId, t);
  };

  const clearWatch = (parcelId) => {
    const watchId = watchIdsRef.current.get(parcelId);
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId);
      watchIdsRef.current.delete(parcelId);
    }
  };

  const onGeoError = (parcelId, errorObj) => {
    // Show one concise message; then auto-retry
    let msg = "Failed to get location. ";
    switch (errorObj?.code) {
      case errorObj?.PERMISSION_DENIED:
        msg += "Please allow location access.";
        break;
      case errorObj?.POSITION_UNAVAILABLE:
        msg += "Location unavailable. Check GPS.";
        break;
      case errorObj?.TIMEOUT:
        msg += "Request timed out. Retrying…";
        break;
      default:
        msg += "Please check GPS settings.";
    }
    toast.error(msg);

    // stop current watch & retry after some time
    clearWatch(parcelId);
    scheduleRetry(parcelId, () => startWatchForParcel(parcelId), 5000);
  };

  const startWatchForParcel = (parcelId) => {
    const parcel = assignedParcels.find((p) => p._id === parcelId);
    if (!parcel) return;

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    const bookingId = parcel.bookingId;
    socket.emit("join:order", bookingId);

    // start watchPosition
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("loc", {
          bookingId,
          lat: latitude,
          lng: longitude,
          ts: Date.now(),
          agentName: userData?.name || user?.displayName || "Agent",
        });
        // console.log("GPS OK:", bookingId, latitude, longitude);
      },
      (err) => onGeoError(parcelId, err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    watchIdsRef.current.set(parcelId, watchId);
    setTrackingParcels((prev) => {
      const next = new Set(prev);
      next.add(parcelId);
      return next;
    });
    toast.success("GPS tracking started for " + bookingId);
  };

  // One-time permission change listener (if supported)
  useEffect(() => {
    if (permListenerSetRef.current) return;

    if (navigator?.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((perm) => {
          perm.onchange = () => {
            if (perm.state === "granted") {
              // Try to resume all parcels that were in tracking state but lost GPS
              trackingParcels.forEach((parcelId) => {
                // if no active watch, start again
                if (!watchIdsRef.current.has(parcelId)) {
                  startWatchForParcel(parcelId);
                }
              });
            }
          };
          permListenerSetRef.current = true;
        })
        .catch(() => {
          // ignore
        });
    }
  }, [trackingParcels]);

  // Start GPS tracking for a parcel (public API used by buttons)
  const startGPSTracking = (parcel) => {
    clearRetryTimer(parcel._id);
    startWatchForParcel(parcel._id);
  };

  // Stop GPS tracking for a parcel
  const stopGPSTracking = (parcelId) => {
    clearRetryTimer(parcelId);
    clearWatch(parcelId);

    setTrackingParcels((prev) => {
      const next = new Set(prev);
      next.delete(parcelId);
      return next;
    });

    const parcel = assignedParcels.find((p) => p._id === parcelId);
    if (parcel) {
      toast.success("GPS tracking stopped for " + parcel.bookingId);
    }
  };

  // Update parcel status
  const updateParcelStatus = async (
    parcelId,
    newStatus,
    failureReason = ""
  ) => {
    try {
      setUpdatingStatus(parcelId);

      // Handle GPS tracking based on status
      if (newStatus === "in-transit") {
        const parcel = assignedParcels.find((p) => p._id === parcelId);
        if (parcel) startGPSTracking(parcel);
      } else if (newStatus === "delivered" || newStatus === "failed") {
        stopGPSTracking(parcelId);
      }

      const body = { deliveryStatus: newStatus };
      if (newStatus === "failed" && failureReason)
        body.failureReason = failureReason;

      const res = await axios.patch(
        `${API_BASE}/bookings/${parcelId}/deliveryStatus`,
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data?.success)
        throw new Error(res.data?.message || "failed to update status");

      toast.success(
        `Parcel status updated to ${
          statusConfig[newStatus]?.label || newStatus
        }`
      );
      fetchAssignedParcels(true);
    } catch (e) {
      console.error("Error updating parcel status:", e);
      toast.error(
        e.response?.data?.message ||
          e.message ||
          "failed to update parcel status"
      );

      // If status update failed, stop GPS tracking if it was started
      if (newStatus === "in-transit") {
        stopGPSTracking(parcelId);
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Cleanup GPS tracking on component unmount
  useEffect(() => {
    return () => {
      // clear all timers + watches
      retryTimersRef.current.forEach((t) => clearTimeout(t));
      retryTimersRef.current.clear();

      watchIdsRef.current.forEach((id) => {
        navigator.geolocation.clearWatch(id);
      });
      watchIdsRef.current.clear();
    };
  }, []);

  // Stats
  const getStatusStats = () => {
    const stats = {
      total: assignedParcels.length,
      pending: 0,
      "picked-up": 0,
      "in-transit": 0,
      delivered: 0,
      failed: 0,
    };
    assignedParcels.forEach((p) => {
      if (Object.prototype.hasOwnProperty.call(stats, p.status))
        stats[p.status]++;
    });
    return stats;
  };
  const stats = getStatusStats();

  // Quick status update buttons
  const QuickStatusButtons = ({ parcel }) => {
    const order = Object.keys(statusConfig);
    const idx = order.indexOf(parcel.status);
    const next = order.slice(idx + 1);

    if (parcel.status === "delivered" || parcel.status === "failed") {
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Final Status
        </span>
      );
    }

    return (
      <div className="flex gap-1">
        {next.map((status) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() =>
                status === "failed"
                  ? handleFailureClick(parcel._id)
                  : updateParcelStatus(parcel._id, status)
              }
              disabled={updatingStatus === parcel._id}
              className={`p-1.5 rounded-lg text-white text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 ${cfg.bgColor}`}
              title={`Mark as ${cfg.label}`}
            >
              <Icon className="w-3 h-3" />
            </button>
          );
        })}
      </div>
    );
  };

  // ---------- Render ----------
  if (loading) {
    return <PageLoader message="Loading your Delivery Management..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load Parcels
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchAssignedParcels(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Try Again
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              📦 My Deliveries
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your assigned parcels and update delivery status
            </p>
          </div>
          <button
            onClick={() => fetchAssignedParcels(true)}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Status Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
              key={status}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {cfg.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats[status] || 0}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${cfg.bgColor}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search parcels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([status, cfg]) => (
                <option key={status} value={status}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">By Status</option>
            <option value="amount">By Amount</option>
          </select>
        </div>
      </div>

      {/* Parcels List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assigned Parcels ({filteredParcels.length})
          </h2>
        </div>

        {filteredParcels.length === 0 ? (
          <div className="p-12 text-center">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No parcels found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You don't have any assigned parcels yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredParcels.map((parcel) => {
              const statusInfo =
                statusConfig[parcel.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={parcel._id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Parcel Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
                          <StatusIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {parcel.bookingId}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* Pickup Info */}
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Pickup:
                              </p>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <FiUser className="w-3 h-3 mr-2 text-gray-400" />
                                  <span className="text-gray-900 dark:text-white">
                                    {parcel.pickupContactName}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <FiPhone className="w-3 h-3 mr-2 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {parcel.pickupPhone}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Delivery:
                              </p>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <FiUser className="w-3 h-3 mr-2 text-gray-400" />
                                  <span className="text-gray-900 dark:text-white">
                                    {parcel.deliveryContactName}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <FiMapPin className="w-3 h-3 mr-2 text-gray-400 mt-0.5" />
                                  <span className="text-gray-600 dark:text-gray-300 text-xs">
                                    {parcel.deliveryAddress?.substring(0, 50)}
                                    ...
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {parcel.parcelType} • {parcel.parcelWeight}kg
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ৳{parcel.totalCharge}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedParcel(parcel)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* GPS Tracking Indicator */}
                      {trackingParcels.has(parcel._id) && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          GPS Active
                        </div>
                      )}

                      {updatingStatus === parcel._id ? (
                        <div className="flex items-center justify-center w-20 h-8">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <QuickStatusButtons parcel={parcel} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Failure Reason Modal */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delivery Failed
                </h3>
                <button
                  onClick={() => {
                    setShowFailureModal(false);
                    setFailureReason("");
                    setFailingParcelId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Please provide the reason for delivery failure:
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="e.g., Customer not available, Wrong address, Package damaged..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFailureModal(false);
                    setFailureReason("");
                    setFailingParcelId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFailure}
                  disabled={
                    !failureReason.trim() || updatingStatus === failingParcelId
                  }
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus === failingParcelId
                    ? "Updating..."
                    : "Mark as failed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parcel Details Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Parcel Details - {selectedParcel.bookingId}
                </h3>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Current Status
                </h4>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusConfig[selectedParcel.status]?.color
                    }`}
                  >
                    {statusConfig[selectedParcel.status]?.label ||
                      selectedParcel.status}
                  </span>
                </div>
              </div>

              {/* Show failure reason if failed */}
              {selectedParcel.status === "failed" &&
                selectedParcel.failureReason && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Failure Reason
                    </h4>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {selectedParcel.failureReason}
                      </p>
                      {selectedParcel.failedAt && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Failed at:{" "}
                          {new Date(selectedParcel.failedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {/* Parcel Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Parcel Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Type:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedParcel.parcelType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Weight:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedParcel.parcelWeight} kg
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Amount:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ৳{selectedParcel.totalCharge}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pickup Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Pickup Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {selectedParcel.pickupContactName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedParcel.pickupPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedParcel.pickupAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Delivery Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {selectedParcel.deliveryContactName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedParcel.deliveryPhone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedParcel.deliveryAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDeliveryManagement;
