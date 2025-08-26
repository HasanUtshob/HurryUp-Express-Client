import React from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  FaHome,
  FaArrowLeft,
  FaSearch,
  FaTruck,
  FaMapMarkerAlt,
  FaCompass,
  FaQuestionCircle,
  FaRoute,
} from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleSearchHelp = () => {
    navigate("/contact");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Illustration */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="relative mb-8"
                >
                  {/* Lost Delivery Truck Animation */}
                  <div className="relative">
                    {/* Winding Road */}
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg
                        width="200"
                        height="100"
                        viewBox="0 0 200 100"
                        className="opacity-30"
                      >
                        <motion.path
                          d="M20,50 Q60,20 100,50 T180,50"
                          stroke="white"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="10,5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </svg>
                    </motion.div>

                    {/* Lost Truck */}
                    <motion.div
                      animate={{
                        x: [0, 20, -10, 15, 0],
                        y: [0, -5, 5, -3, 0],
                        rotate: [0, 5, -3, 2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-8xl mb-4 relative z-10"
                    >
                      <FaTruck className="mx-auto text-white/90" />
                    </motion.div>

                    {/* Question Mark */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 border-4 border-white"
                    >
                      <FaQuestionCircle className="text-2xl text-yellow-800" />
                    </motion.div>

                    {/* Floating Map Markers */}
                    {[
                      { x: -20, y: -20, delay: 0 },
                      { x: 30, y: -30, delay: 0.5 },
                      { x: -30, y: 20, delay: 1 },
                      { x: 25, y: 25, delay: 1.5 },
                    ].map((marker, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: marker.delay,
                          ease: "easeInOut",
                        }}
                        className="absolute text-red-300"
                        style={{
                          left: `calc(50% + ${marker.x}px)`,
                          top: `calc(50% + ${marker.y}px)`,
                        }}
                      >
                        <FaMapMarkerAlt className="text-xl" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-4xl font-bold mb-4"
                >
                  Route Not Found
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-blue-100 text-lg leading-relaxed"
                >
                  Our delivery truck seems to have taken a wrong turn. Let's get
                  you back on the right path!
                </motion.p>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                      <FaCompass className="text-3xl text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    404
                  </h1>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    The page you're looking for doesn't exist in our delivery
                    network. It might have been moved, deleted, or you entered
                    the wrong address.
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleGoHome}
                    className="btn w-full bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                  >
                    <FaHome className="mr-2" />
                    Return to Homepage
                  </button>

                  <button
                    onClick={handleGoBack}
                    className="btn btn-outline w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    <FaArrowLeft className="mr-2" />
                    Go Back
                  </button>

                  <button
                    onClick={handleSearchHelp}
                    className="btn btn-ghost w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium py-3 rounded-xl transition-all duration-300"
                  >
                    <FaSearch className="mr-2" />
                    Get Help Finding Your Way
                  </button>
                </motion.div>

                {/* Popular Destinations */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <FaRoute className="mr-2 text-blue-500" />
                    Popular Destinations
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        name: "Track Your Parcel",
                        path: "/dashboard/track-parcel",
                      },
                      { name: "Book New Delivery", path: "/book-parcel" },
                      { name: "My Parcels", path: "/dashboard/my-parcels" },
                      { name: "Become an Agent", path: "/become-agent" },
                    ].map((destination, index) => (
                      <motion.button
                        key={destination.name}
                        onClick={() => navigate(destination.path)}
                        whileHover={{ x: 5 }}
                        className="block w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      >
                        → {destination.name}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Current Path Info (for debugging) */}
                {location.pathname && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Lost route:{" "}
                      <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-mono">
                        {location.pathname}
                      </code>
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Still Lost?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our support team is here to help you navigate back to where you
              need to be.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/contact")}
                className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none"
              >
                Contact Support
              </button>
              <button
                onClick={() =>
                  (window.location.href = "mailto:support@hurryupexpress.com")
                }
                className="btn btn-sm btn-outline border-green-500 text-green-600 hover:bg-green-50"
              >
                Email Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
