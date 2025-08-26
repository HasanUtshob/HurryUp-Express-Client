import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCar,
  FaClock,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import PageLoader from "../../Loading/PageLoader";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

const AgentRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Fetch agent requests
  const fetchAgentRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/agent-requests`);
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
        setFilteredRequests(result.data);
      } else {
        toast.error("Failed to fetch agent requests");
      }
    } catch (error) {
      console.error("Error fetching agent requests:", error);
      toast.error("Failed to fetch agent requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentRequests();
  }, []);

  // Filter requests by status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter((request) => request.status === statusFilter)
      );
    }
  }, [statusFilter, requests]);

  // Handle status update (approve/reject)
  const handleStatusUpdate = async (requestId, newStatus, reviewNotes = "") => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE}/agent-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            reviewedBy: user?.email || "admin",
            reviewNotes: reviewNotes,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`Agent request ${newStatus} successfully!`);
        fetchAgentRequests(); // Refresh the list
        setSelectedRequest(null); // Close modal
      } else {
        toast.error(result.message || `Failed to ${newStatus} request`);
      }
    } catch (error) {
      console.error(`Error ${newStatus}ing request:`, error);
      toast.error(`Failed to ${newStatus} request`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "badge badge-warning";
      case "approved":
        return "badge badge-success";
      case "rejected":
        return "badge badge-error";
      default:
        return "badge badge-neutral";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <PageLoader message="Loading your Agent Request Page..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Agent Request Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage agent applications
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Status:
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`btn btn-sm ${
              statusFilter === "all" ? "btn-primary" : "btn-outline"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`btn btn-sm ${
              statusFilter === "pending" ? "btn-warning" : "btn-outline"
            }`}
          >
            Pending ({requests.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`btn btn-sm ${
              statusFilter === "approved" ? "btn-success" : "btn-outline"
            }`}
          >
            Approved ({requests.filter((r) => r.status === "approved").length})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`btn btn-sm ${
              statusFilter === "rejected" ? "btn-error" : "btn-outline"
            }`}
          >
            Rejected ({requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="text-left">Applicant</th>
                <th className="text-left">Contact</th>
                <th className="text-left">Vehicle</th>
                <th className="text-left">Availability</th>
                <th className="text-left">Status</th>
                <th className="text-left">Applied Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No agent requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                            <span className="text-sm">
                              {request.name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{request.name}</div>
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <FaPhone className="text-gray-400" />
                          {request.phone}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <FaEnvelope className="text-gray-400" />
                          {request.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <FaCar className="text-gray-400" />
                        <span className="capitalize">
                          {request.vehicleType}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        <span className="capitalize">
                          {request.availability}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="btn btn-sm btn-ghost"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(request._id, "approved")
                              }
                              className="btn btn-sm btn-success"
                              disabled={isProcessing}
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(request._id, "rejected")
                              }
                              className="btn btn-sm btn-error"
                              disabled={isProcessing}
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Agent Request Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <span>{selectedRequest.name}</span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  <span>{selectedRequest.email}</span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Phone</span>
                </label>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  <span>{selectedRequest.phone}</span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Vehicle Type</span>
                </label>
                <div className="flex items-center gap-2">
                  <FaCar className="text-gray-400" />
                  <span className="capitalize">
                    {selectedRequest.vehicleType}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Availability</span>
                </label>
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400" />
                  <span className="capitalize">
                    {selectedRequest.availability}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Status</span>
                </label>
                <span className={getStatusBadge(selectedRequest.status)}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {selectedRequest.experience && (
              <div className="mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Experience</span>
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm">{selectedRequest.experience}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Applied Date</span>
                </label>
                <span className="text-sm">
                  {formatDate(selectedRequest.createdAt)}
                </span>
              </div>

              {selectedRequest.reviewedAt && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Reviewed Date
                    </span>
                  </label>
                  <span className="text-sm">
                    {formatDate(selectedRequest.reviewedAt)}
                  </span>
                </div>
              )}
            </div>

            {selectedRequest.reviewNotes && (
              <div className="mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Review Notes</span>
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm">{selectedRequest.reviewNotes}</p>
                </div>
              </div>
            )}

            <div className="modal-action">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedRequest._id, "approved")
                    }
                    className="btn btn-success"
                    disabled={isProcessing}
                  >
                    <FaCheck className="mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedRequest._id, "rejected")
                    }
                    className="btn btn-error"
                    disabled={isProcessing}
                  >
                    <FaTimes className="mr-2" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedRequest(null)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentRequestManagement;
