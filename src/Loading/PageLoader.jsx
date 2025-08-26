import React from "react";
import { motion } from "framer-motion";
import { FaTruck, FaBox, FaRoute } from "react-icons/fa";

const PageLoader = ({
  message = "Loading your delivery dashboard...",
  showProgress = true,
  theme = "light",
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Delivery Route Animation */}
          <div className="relative mb-8">
            {/* Route Path */}
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-0 right-0 h-1"
            >
              <div
                className={`h-full rounded-full ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Start Point */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2"
            >
              <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <FaBox className="text-xs text-white" />
              </div>
            </motion.div>

            {/* Moving Truck */}
            <motion.div
              animate={{
                x: [0, 280, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-4"
            >
              <motion.div
                animate={{
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-3xl text-blue-500"
              >
                <FaTruck />
              </motion.div>
            </motion.div>

            {/* End Point */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2"
            >
              <div className="w-6 h-6 bg-purple-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <FaRoute className="text-xs text-white" />
              </div>
            </motion.div>
          </div>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h1
              className={`text-4xl font-bold mb-2 ${
                isDark
                  ? "text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              }`}
            >
              HurryUp Express
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Fast & Reliable Delivery Service
            </p>
          </motion.div>
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <p
            className={`text-xl font-medium mb-4 ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {message}
          </p>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-xs mx-auto"
          >
            <div
              className={`w-full h-2 rounded-full overflow-hidden ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className={`text-sm mt-2 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Preparing your experience...
            </motion.p>
          </motion.div>
        )}

        {/* Loading Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: "Deliveries", value: "10K+", icon: FaTruck },
            { label: "Cities", value: "50+", icon: FaRoute },
            { label: "Packages", value: "25K+", icon: FaBox },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut",
              }}
              className={`p-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white shadow-lg border border-gray-100"
              }`}
            >
              <stat.icon
                className={`text-2xl mx-auto mb-2 ${
                  isDark ? "text-blue-400" : "text-blue-500"
                }`}
              />
              <p
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {stat.value}
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PageLoader;
