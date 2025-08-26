import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiAlertCircle,
} from "react-icons/fi";
import LoadingSpinner from "../../Loading/LoadingSpinner";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL ||
  "https://hurryup-express-server-1.onrender.com";

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

const getStatusColor = (status) => {
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

const getStatusIcon = (status) => {
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
      return <FiPackage className="w-4 h-4" />;
    default:
      return <FiPackage className="w-4 h-4" />;
  }
};

const MyParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  // map DB booking -> UI parcel
  const mapBookingToParcel = (b) => {
    const status = normalizeStatus(b.deliveryStatus || b.status);
    const bookingId = b.bookingId || b._id;
    return {
      id: bookingId,
      recipient: b.deliveryContactName || "N/A",
      recipientPhone: b.deliveryPhone || "N/A",
      pickupAddress: b.pickupAddress || "N/A",
      deliveryAddress: b.deliveryAddress || "N/A",
      deliveryPhone: b.deliveryPhone || "N/A", // <-- used in UI
      status,
      bookingDate: b.createdAt
        ? new Date(b.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      deliveryDate: b.deliveredAt
        ? new Date(b.deliveredAt).toISOString().split("T")[0]
        : null,
      amount: Number(b.totalCharge || b.deliveryCharge || 0),
      weight: Number(b.parcelWeight || 0),
      trackingNumber: bookingId ? bookingId : `HE${Date.now()}`,
      paymentMethod: (b.paymentMethod || "N/A").toLowerCase(),
    };
  };

  useEffect(() => {
    const fetchUserParcels = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const res = await axios.get(`${API_BASE}/bookings/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const mapped = raw.map(mapBookingToParcel);
        setParcels(mapped);
      } catch (e) {
        console.error("Error fetching user parcels:", e);
        setError(
          e.response?.data?.message ||
            e.message ||
            "Failed to load your parcels"
        );
        setParcels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserParcels();
  }, [user]);

  const filteredParcels = parcels.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.id?.toLowerCase().includes(q) ||
      p.recipient?.toLowerCase().includes(q) ||
      p.trackingNumber?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q) ||
      p.recipientPhone?.toLowerCase().includes(q) ||
      p.deliveryAddress?.toLowerCase().includes(q) ||
      p.pickupAddress?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: parcels.length,
    pending: parcels.filter((p) => p.status === "pending").length,
    "picked-up": parcels.filter((p) => p.status === "picked-up").length,
    "in-transit": parcels.filter((p) => p.status === "in-transit").length,
    delivered: parcels.filter((p) => p.status === "delivered").length,
    failed: parcels.filter((p) => p.status === "failed").length,
  };

  if (loading) return <LoadingSpinner />;

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
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Please Sign In
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You need to be signed in to view your parcels.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Parcels
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all your parcel bookings
          </p>
        </div>
        <Link
          to="/book-parcel"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <FiPackage className="w-4 h-4 mr-2" />
          Book New Parcel
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { key: "all", label: "Total", color: "bg-blue-500" },
          { key: "pending", label: "Pending", color: "bg-yellow-500" },
          { key: "picked-up", label: "Picked Up", color: "bg-purple-500" },
          { key: "in-transit", label: "In Transit", color: "bg-blue-600" },
          { key: "delivered", label: "Delivered", color: "bg-green-500" },
          { key: "failed", label: "Failed", color: "bg-red-500" },
        ].map(({ key, label, color }) => (
          <div
            key={key}
            className={`p-4 rounded-lg text-white ${color} cursor-pointer hover:opacity-90 transition-opacity ${
              statusFilter === key ? "ring-2 ring-white ring-opacity-50" : ""
            }`}
            onClick={() => setStatusFilter(key)}
          >
            <div className="text-2xl font-bold">{statusCounts[key]}</div>
            <div className="text-sm opacity-90">{label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Parcel ID, Recipient, Phone, Address or Tracking Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="picked-up">Picked Up</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parcels List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Parcels ({filteredParcels.length})
          </h2>
        </div>

        {filteredParcels.length === 0 ? (
          <div className="p-12 text-center">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No parcels found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "You haven't booked any parcels yet."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link
                to="/book-parcel"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <FiPackage className="w-4 h-4 mr-2" />
                Book Your First Parcel
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredParcels.map((p) => (
              <div
                key={p.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getStatusIcon(p.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {p.id}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tracking: {p.trackingNumber}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          p.status
                        )}`}
                      >
                        {p.status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                          <FiMapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium">To:</span>
                        </div>
                        <p className="text-gray-900 dark:text-white ml-6">
                          {p.recipient}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 ml-6">
                          {p.deliveryAddress}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 ml-6">
                          {p.deliveryPhone}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                          <FiCalendar className="w-4 h-4 mr-2" />
                          <span className="font-medium">Booked:</span>
                        </div>
                        <p className="text-gray-900 dark:text-white ml-6">
                          {new Date(p.bookingDate).toLocaleDateString()}
                        </p>
                        {p.deliveryDate && (
                          <p className="text-green-600 dark:text-green-400 ml-6">
                            Delivered:{" "}
                            {new Date(p.deliveryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <span className="w-4 h-4 mr-1">৳</span>
                        <span className="font-semibold text-lg text-gray-900 dark:text-white">
                          {p.amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Weight: {p.weight}kg
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Payment Method :</span>
                      {p.paymentMethod === "cod" ? (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-default">
                          COD
                        </span>
                      ) : (
                        <button className="btn btn-primary">Pay</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyParcels;
