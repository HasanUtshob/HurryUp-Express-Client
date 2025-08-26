import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiClock,
  FiDownload,
  FiFileText,
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
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageLoader from "../../Loading/PageLoader";

// Initialize autoTable plugin
jsPDF.API.autoTable = autoTable;

// simple responsive chart height
const useChartHeight = () => {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  if (w < 640) return 200; // < sm
  if (w < 1024) return 240; // sm - lg
  if (w < 1280) return 260; // lg
  return 280; // xl+
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics data states
  const [dailyBookings, setDailyBookings] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({});
  const [codSummary, setCodSummary] = useState({});

  // Filter states
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const chartHeight = useChartHeight();

  // Fetch analytics data
  const fetchAnalyticsData = async (
    showRefreshLoader = false,
    customDateRange = null
  ) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const currentDateRange = customDateRange || dateRange;

      const headers = { "Content-Type": "application/json" };
      const params = {};
      if (currentDateRange.startDate)
        params.startDate = currentDateRange.startDate;
      if (currentDateRange.endDate) params.endDate = currentDateRange.endDate;

      const [dailyResponse, statsResponse, codResponse] = await Promise.all([
        axios.get(
          "https://hurryup-express-server-1.onrender.com/analytics/daily-bookings",
          {
            headers,
            params,
          }
        ),
        axios.get(
          "https://hurryup-express-server-1.onrender.com/analytics/delivery-stats",
          {
            headers,
            params,
          }
        ),
        axios.get(
          "https://hurryup-express-server-1.onrender.com/analytics/cod-summary",
          {
            headers,
            params,
          }
        ),
      ]);

      setDailyBookings(dailyResponse.data.data || []);
      setDeliveryStats(statsResponse.data.data || {});
      setCodSummary(codResponse.data.data || {});
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, dateRange.startDate, dateRange.endDate]);

  // totals
  const totalBookings = useMemo(
    () => dailyBookings.reduce((sum, d) => sum + d.count, 0),
    [dailyBookings]
  );
  const totalRevenue = useMemo(
    () => dailyBookings.reduce((sum, d) => sum + (d.totalAmount || 0), 0),
    [dailyBookings]
  );

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => fetchAnalyticsData(true);

  // trend data
  const trendData = useMemo(() => {
    if (!dailyBookings.length) return [];
    return dailyBookings.slice(-7).map((day) => ({
      date: new Date(day._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      bookings: day.count,
      revenue: day.totalAmount || 0,
    }));
  }, [dailyBookings]);

  // pie data
  const pieChartData = useMemo(() => {
    const data = [
      {
        name: "Delivered",
        value: deliveryStats.delivered || 0,
        color: "#10b981",
      },
      { name: "Pending", value: deliveryStats.pending || 0, color: "#f59e0b" },
      {
        name: "In Transit",
        value: deliveryStats.inTransit || 0,
        color: "#3b82f6",
      },
      {
        name: "Picked Up",
        value: deliveryStats.pickedUp || 0,
        color: "#8b5cf6",
      },
      { name: "Failed", value: deliveryStats.faild || 0, color: "#ef4444" },
    ].filter((s) => s.value > 0);
    return data;
  }, [deliveryStats]);

  // CSV data
  const getCSVData = () => {
    const csvData = [];
    csvData.push({
      Type: "Summary",
      Date: new Date().toLocaleDateString(),
      "Total Bookings": totalBookings,
      "Total Revenue": totalRevenue,
      "Success Rate": `${deliveryStats.successRate || 0}%`,
      "Pending COD": codSummary.pendingCOD || 0,
      "Received COD": codSummary.receivedCOD || 0,
    });
    dailyBookings.forEach((day) => {
      csvData.push({
        Type: "Daily Booking",
        Date: new Date(day._id).toLocaleDateString(),
        "Total Bookings": day.count,
        "Total Revenue": day.totalAmount || 0,
        "Success Rate": "",
        "Pending COD": "",
        "Received COD": "",
      });
    });
    pieChartData.forEach((status) => {
      csvData.push({
        Type: "Delivery Status",
        Date: new Date().toLocaleDateString(),
        "Total Bookings": status.value,
        "Total Revenue": "",
        "Success Rate":
          deliveryStats.total > 0
            ? `${((status.value / deliveryStats.total) * 100).toFixed(1)}%`
            : "0%",
        "Pending COD": "",
        "Received COD": "",
        Status: status.name,
      });
    });
    return csvData;
  };

  // PDF
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("HurryUp Express Dashboard Report", pageWidth / 2, 15, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 220);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      22,
      { align: "center" }
    );

    let currentY = 35;
    if (dateRange.startDate || dateRange.endDate) {
      const filterText = `Date Range: ${dateRange.startDate || "All"} → ${
        dateRange.endDate || "All"
      }`;
      doc.setTextColor(80, 80, 80);
      doc.text(filterText, pageWidth / 2, currentY, { align: "center" });
      currentY += 10;
    }

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text("Summary Statistics", 20, currentY);
    currentY += 5;

    const summaryData = [
      ["Metric", "Value"],
      ["Total Bookings", totalBookings.toString()],
      ["Total Revenue", `${totalRevenue.toLocaleString()} (bdt)`],
      ["Successful Deliveries", (deliveryStats.successful || 0).toString()],
      ["Failed Deliveries", (deliveryStats.faild || 0).toString()],
      ["Pending Deliveries", (deliveryStats.pending || 0).toString()],
      ["Success Rate", `${deliveryStats.successRate || 0}%`],
      ["Pending COD", `${(codSummary.pendingCOD || 0).toLocaleString()} (bdt)`],
      [
        "Received COD",
        `${(codSummary.receivedCOD || 0).toLocaleString()} (bdt)`,
      ],
    ];

    autoTable(doc, {
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: currentY + 5,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      margin: { left: 20, right: 20 },
    });

    if (dailyBookings.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(139, 92, 246);
      doc.text("Daily Bookings", 20, doc.lastAutoTable.finalY + 15);
      const dailyData = [
        ["Date", "Bookings", "Revenue (bdt)"],
        ...dailyBookings.map((day) => [
          new Date(day._id).toLocaleDateString(),
          day.count.toString(),
          (day.totalAmount || 0).toLocaleString(),
        ]),
      ];
      autoTable(doc, {
        head: [dailyData[0]],
        body: dailyData.slice(1),
        startY: doc.lastAutoTable.finalY + 20,
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 240, 255] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 },
      });
    }

    if (pieChartData.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(
        "Delivery Status Distribution",
        20,
        doc.lastAutoTable.finalY + 15
      );
      const statusData = [
        ["Status", "Count", "Percentage"],
        ...pieChartData.map((s) => [
          s.name,
          s.value.toString(),
          deliveryStats.total > 0
            ? `${((s.value / deliveryStats.total) * 100).toFixed(1)}%`
            : "0%",
        ]),
      ];
      autoTable(doc, {
        head: [statusData[0]],
        body: statusData.slice(1),
        startY: doc.lastAutoTable.finalY + 20,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        alternateRowStyles: { fillColor: [235, 255, 245] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 },
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        doc.internal.pageSize.height - 10,
        {
          align: "right",
        }
      );
      doc.text(
        "HurryUp Express • Confidential Report",
        20,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(
      `HurryUp-Express-Report-${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // Loading
  if (loading) {
    return <PageLoader message="Loading Admin dashboard..." />;
  }

  // Error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 break-words">
              {error}
            </p>
            <button
              onClick={handleRefresh}
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              📊 HurryUp Express Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Track your courier business performance and insights
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <FiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Date Range:
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                handleDateRangeChange("startDate", e.target.value)
              }
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-h-[44px]"
            />
            <span className="text-gray-500 text-sm px-1 sm:px-2">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right min-w-0">
              <p className="text-2xl font-bold text-gray-900 dark:text-white break-all">
                {totalBookings}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Bookings
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              {dailyBookings.length > 0
                ? `${dailyBookings.length} days`
                : "No data"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              in range
            </span>
          </div>
        </div>

        {/* Successful */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveryStats.successful || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Successful
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                {deliveryStats.successRate || 0}% Success Rate
              </span>
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <FiXCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveryStats.faild || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                {deliveryStats.total > 0
                  ? ((deliveryStats.faild / deliveryStats.total) * 100).toFixed(
                      1
                    )
                  : 0}
                % Failed
              </span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveryStats.pending || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                {deliveryStats.total > 0
                  ? (
                      (deliveryStats.pending / deliveryStats.total) *
                      100
                    ).toFixed(1)
                  : 0}
                % Pending
              </span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-white break-all">
                ৳{totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <FiTrendingUp className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              ৳
              {totalBookings > 0
                ? (totalRevenue / totalBookings).toFixed(0)
                : 0}{" "}
              avg
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              per booking
            </span>
          </div>
        </div>
      </div>

      {/* COD Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending COD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg mr-4">
              <FiClock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending COD
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cash on Delivery - Pending
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                ৳{(codSummary.pendingCOD || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Orders:</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {codSummary.pendingCODOrders || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    codSummary.totalCOD > 0
                      ? (codSummary.pendingCOD / codSummary.totalCOD) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Received COD */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
              <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Received COD
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cash on Delivery - Collected
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ৳{(codSummary.receivedCOD || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Orders:</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {codSummary.receivedCODOrders || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    codSummary.totalCOD > 0
                      ? (codSummary.receivedCOD / codSummary.totalCOD) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FiBarChart2 className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span className="truncate">Daily Bookings Trend</span>
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Last 7 days
            </span>
          </div>

          {trendData.length ? (
            <div className="w-full overflow-hidden">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={trendData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    className="text-gray-600 dark:text-gray-400"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    className="text-gray-600 dark:text-gray-400"
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#374151", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="bookings"
                    fill="#3b82f6"
                    name="Bookings"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#8b5cf6"
                    name="Revenue (৳)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiBarChart2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No booking data available for the selected period
              </p>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FiPieChart className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span className="truncate">Delivery Status</span>
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Distribution
            </span>
          </div>

          {pieChartData.length ? (
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="w-full max-w-xs sm:max-w-sm">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(160, chartHeight - 60)}
                >
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full space-y-2 sm:space-y-3">
                {pieChartData.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                        {s.name}
                      </span>
                    </div>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mr-2">
                        {s.value}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (
                        {deliveryStats.total > 0
                          ? ((s.value / deliveryStats.total) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiPieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No delivery data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiActivity className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 sm:gap-4">
          <CSVLink
            data={getCSVData()}
            filename={`HurryUp-Express-Report-${
              new Date().toISOString().split("T")[0]
            }.csv`}
            className="flex items-center justify-center px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors min-h-[48px] text-sm sm:text-base"
          >
            <FiDownload className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Export CSV</span>
          </CSVLink>

          <button
            onClick={generatePDFReport}
            className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors min-h-[48px] text-sm sm:text-base"
          >
            <FiFileText className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
