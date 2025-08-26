/* global google */
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { socket } from "../../socket";
import axios from "axios";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiPhone,
  FiUser,
  FiBox,
  FiNavigation,
  FiAlertCircle,
  FiInfo,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";
import PageLoader from "../../Loading/PageLoader";
import LoadingSpinner from "../../Loading/LoadingSpinner";
import Loading from "../../Loading/Loading";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const MAPS_KEY =
  import.meta.env.VITE_MAPS_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const TrackParcel = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for maps
  const mapRef = useRef(null);

  // Google
  const mapObjRef = useRef(null);
  const markerRef = useRef(null);

  // Leaflet
  const lMapRef = useRef(null);
  const lMarkerRef = useRef(null);

  // Engine flag
  const mapEngineRef = useRef("google");

  const [mapLoading, setMapLoading] = useState(false);

  // Realtime
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);

  // -------- Optimized Leaflet Loader --------
  const loadLeafletFromCDN = async () => {
    if (window.L) return;
    await Promise.all([
      new Promise((resolve) => {
        if (document.getElementById("leaflet-css")) {
          resolve();
          return;
        }
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.onload = resolve;
        document.head.appendChild(link);
      }),
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      }),
    ]);
  };

  const initLeafletMap = async () => {
    setMapLoading(true);
    try {
      await loadLeafletFromCDN();
      const defaultCenter = [23.8103, 90.4125];
      const map = window.L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const m = window.L.marker(defaultCenter).addTo(map);

      lMapRef.current = map;
      lMarkerRef.current = m;
      mapEngineRef.current = "leaflet";

      setTimeout(() => {
        map.addControl(window.L.control.zoom());
        map.addControl(window.L.control.attribution());
      }, 100);
    } finally {
      setMapLoading(false);
    }
  };

  // -------- Optimized Google Maps Init --------
  const initializeMap = async () => {
    // Prefer Leaflet if key missing or explicitly selected
    if (
      !MAPS_KEY ||
      (import.meta.env.VITE_MAP_ENGINE || "").toLowerCase() === "leaflet"
    ) {
      await initLeafletMap();
      return;
    }

    setMapLoading(true);
    try {
      let Loader;
      if (window.googleMapsLoader) {
        Loader = window.googleMapsLoader;
      } else {
        const module = await import("@googlemaps/js-api-loader");
        Loader = module.Loader;
        window.googleMapsLoader = Loader;
      }

      const loader = new Loader({
        apiKey: MAPS_KEY,
        version: "weekly",
        libraries: [],
      });

      await loader.load();

      const defaultCenter = { lat: 23.8103, lng: 90.4125 };

      const map = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeId: "roadmap",
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: "cooperative",
      });
      mapObjRef.current = map;

      markerRef.current = new google.maps.Marker({
        position: defaultCenter,
        map,
        title: "Delivery Agent Location",
      });

      mapEngineRef.current = "google";

      setTimeout(() => {
        map.setOptions({
          zoomControl: true,
          scaleControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        markerRef.current.setIcon({
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        });

        google.maps.event.trigger(map, "resize");
      }, 200);
    } catch (err) {
      console.error("Google Maps loading error, using Leaflet:", err);
      await initLeafletMap();
    } finally {
      setMapLoading(false);
    }
  };

  // -------- Marker Update --------
  const updateMarkerPosition = (lat, lng, ts) => {
    const engine = mapEngineRef.current;
    if (engine === "google") {
      const map = mapObjRef.current;
      const marker = markerRef.current;
      if (!map || !marker) return;
      const pos = { lat, lng };
      marker.setPosition(pos);
      map.panTo(pos);
    } else {
      const map = lMapRef.current;
      const marker = lMarkerRef.current;
      if (!map || !marker) return;
      const pos = [lat, lng];
      marker.setLatLng(pos);
      map.panTo(pos);
    }
    setIsTracking(true);
    setLastLocation({ lat, lng, timestamp: new Date(ts || Date.now()) });
  };

  // -------- Socket Join & Reconnect --------
  useEffect(() => {
    if (!trackingData?.bookingId) return;

    const roomId = trackingData.bookingId;
    const join = () => socket.emit("join:order", roomId);
    join();

    const onConnect = () => join();
    const onLoc = (p) => {
      if (p.bookingId !== roomId) return;
      // no toast spam here—UI badge + map movement যথেষ্ট
      updateMarkerPosition(p.lat, p.lng, p.ts);
    };

    socket.on("connect", onConnect);
    socket.on("loc", onLoc);

    return () => {
      socket.off("connect", onConnect);
      socket.off("loc", onLoc);
    };
  }, [trackingData?.bookingId]);

  // -------- Auto-load if URL had id --------
  useEffect(() => {
    if (trackingId) handleTrack();
    // eslint-disable-next-line
  }, []);

  // -------- Init Map after Data --------
  useEffect(() => {
    const needMap =
      trackingData?.status === "in-transit" &&
      mapRef.current &&
      !mapObjRef.current &&
      !lMapRef.current;
    if (needMap) initializeMap();
  }, [trackingData]);

  // যদি ম্যাপ পরে ইনিশিয়াল হয় এবং ইতিমধ্যে lastLocation থাকে, সেটাও প্লট করে দেই
  useEffect(() => {
    if (!lastLocation) return;
    // map object তৈরি হয়ে গেলে আবার বসাও
    if (mapObjRef.current || lMapRef.current) {
      updateMarkerPosition(
        lastLocation.lat,
        lastLocation.lng,
        lastLocation.timestamp
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapObjRef.current, lMapRef.current]);

  // — Status normalizer
  const normalizeStatus = (s = "") => {
    const x = String(s).toLowerCase().trim();
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

  // -------- Fetch API --------
  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError("Please enter a tracking number");
      return;
    }
    setLoading(true);
    setError("");
    setTrackingData(null);
    setLastLocation(null);
    setIsTracking(false);

    try {
      const res = await axios.get(`${API_BASE}/bookings/public/${trackingId}`);
      if (!res.data?.success) throw new Error(res.data?.message || "Not found");
      const raw = res.data.data;
      const status = normalizeStatus(raw.deliveryStatus || raw.status);
      const data = { ...raw, status, deliveryStatus: status };
      setTrackingData(data);

      if (status === "in-transit") {
        setIsTracking(true);
        socket.emit("join:order", data.bookingId);
        // toast.success("Real-time tracking activated!");
      } else {
        // toast.success("Parcel information loaded!");
      }
    } catch (e) {
      console.error(e);
      setTrackingData(null);
      setError(
        e.response?.status === 404
          ? "Tracking number not found. Please check and try again."
          : "Failed to fetch tracking information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
      case "booked":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "picked-up":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FiCheckCircle className="w-5 h-5" />;
      case "in-transit":
        return <FiTruck className="w-5 h-5" />;
      case "pending":
      case "booked":
        return <FiClock className="w-5 h-5" />;
      case "picked-up":
        return <FiPackage className="w-5 h-5" />;
      case "failed":
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiPackage className="w-5 h-5" />;
    }
  };

  const getTimelineIcon = (status, completed) => {
    const iconClass = `w-4 h-4 ${completed ? "text-white" : "text-gray-400"}`;
    switch (status) {
      case "pending":
        return <FiPackage className={iconClass} />;
      case "picked-up":
        return <FiCheckCircle className={iconClass} />;
      case "in-transit":
        return <FiTruck className={iconClass} />;
      case "delivered":
        return <FiCheckCircle className={iconClass} />;
      case "failed":
        return <FiAlertCircle className={iconClass} />;
      default:
        return <FiClock className={iconClass} />;
    }
  };

  // -------- JSX --------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
              <FiPackage className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Track Your Parcel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Enter your tracking number to get real-time updates and location
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter tracking number (e.g., HurryUp123456)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200"
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[140px]"
            >
              {loading ? <Loading></Loading> : "Track Parcel"}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                <p className="text-red-700 dark:text-red-400 font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && <Loading />}

        {/* Tracking Results */}
        {trackingData && !loading && (
          <div className="space-y-6">
            {/* Parcel Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl">
                    {getStatusIcon(trackingData.status)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {trackingData.bookingId}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Tracking ID: {trackingData.bookingId}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      trackingData.status
                    )}`}
                  >
                    {trackingData.status.replace("-", " ").toUpperCase()}
                  </span>
                  {isTracking && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <FiNavigation className="w-3 h-3" />
                      Live Tracking
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiMapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">Pickup Address</span>
                  </div>
                  <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                    {trackingData.pickupAddress || "Not specified"}
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiMapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">Delivery Address</span>
                  </div>
                  <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                    {trackingData.deliveryAddress || "Not specified"}
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiBox className="w-5 h-5 mr-2" />
                    <span className="font-medium">Parcel Details</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-900 dark:text-white font-medium text-sm">
                      {trackingData.parcelType || "Standard"} •{" "}
                      {trackingData.parcelSize || "Medium"}
                    </p>
                    {trackingData.parcelWeight && (
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                        <FiBox className="w-3 h-3 mr-1" />
                        <span>{trackingData.parcelWeight} kg</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                      <FiCalendar className="w-3 h-3 mr-1" />
                      <span>
                        Booked:{" "}
                        {trackingData.createdAt
                          ? new Date(
                              trackingData.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Agent Info */}
              {trackingData.deliveryAgent && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <FiUser className="w-4 h-4 mr-2" />
                    Delivery Agent
                  </h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">
                          {trackingData.deliveryAgent.name}
                        </p>
                        <div className="flex items-center text-blue-600 dark:text-blue-300 text-sm">
                          <FiPhone className="w-3 h-3 mr-1" />
                          <span>{trackingData.deliveryAgent.phone}</span>
                        </div>
                      </div>
                    </div>
                    {trackingData.deliveryAgent.rating && (
                      <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                        <span className="mr-1">⭐</span>
                        <span>{trackingData.deliveryAgent.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Last Location Update */}
              {lastLocation && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-800 dark:text-green-200">
                      <FiNavigation className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Last Location Update
                      </span>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-300">
                      {new Date(lastLocation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiActivity className="w-5 h-5 mr-2" />
                Delivery Timeline
              </h3>

              <div className="space-y-4">
                {(() => {
                  const statusOrder = [
                    "pending",
                    "picked-up",
                    "in-transit",
                    "delivered",
                  ];
                  const currentStatusIndex = statusOrder.indexOf(
                    trackingData.status
                  );
                  const isfailed = trackingData.status === "failed";

                  let timelineItems = [
                    { status: "pending", title: "Pending", completed: true },
                    {
                      status: "picked-up",
                      title: "Picked Up",
                      completed: currentStatusIndex >= 1 || isfailed,
                    },
                    {
                      status: "in-transit",
                      title: "In Transit",
                      completed: currentStatusIndex >= 2,
                    },
                    {
                      status: "delivered",
                      title: "Delivered",
                      completed: trackingData.status === "delivered",
                    },
                  ];

                  if (isfailed) {
                    timelineItems.push({
                      status: "failed",
                      title: "Failed",
                      completed: true,
                    });
                  }

                  return timelineItems;
                })().map((item, index, array) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                          item.completed
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        {getTimelineIcon(item.status, item.completed)}
                      </div>
                      {index < array.length - 1 && (
                        <div
                          className={`w-0.5 h-8 mt-2 transition-all duration-200 ${
                            item.completed
                              ? "bg-gradient-to-b from-blue-500 to-purple-600"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pb-4">
                      <h4
                        className={`text-lg font-medium transition-all duration-200 ${
                          item.completed
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.status === trackingData.status && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          Current Status
                        </p>
                      )}
                      {item.completed &&
                        item.status !== trackingData.status && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Completed
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Map */}
            {trackingData.status === "in-transit" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <FiMapPin className="w-5 h-5 mr-2" />
                    Live Location Tracking
                  </h3>
                  {isTracking && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {mapLoading && <Loading></Loading>}
                  <div
                    ref={mapRef}
                    className="w-full h-96 rounded-xl bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Real-Time GPS Tracking Active
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        This map shows the live location of your delivery agent.
                        The marker will update automatically as the agent moves.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        {!trackingData && !loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 card-hover">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              <FiInfo className="w-5 h-5 mr-2" />
              How to Track Your Parcel
            </h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p>
                  Enter your booking ID (e.g., HurryUp123456) in the search box
                  above
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p>
                  Get real-time updates on your parcel's location and delivery
                  status
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p>View live GPS tracking when your parcel is in transit</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold">4</span>
                </div>
                <p>
                  Contact your delivery agent directly through the tracking
                  information
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackParcel;
