import React from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  FaLock,
  FaHome,
  FaArrowLeft,
  FaHeadset,
  FaTruck,
  FaShieldAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const Forbidden = () => {
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

  const handleContactSupport = () => {
    navigate("/contact");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Illustration */}
            <div className="lg:w-1/2 bg-gradient-to-br from-red-500 to-orange-600 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="relative mb-8"
                >
                  {/* Animated Truck with Lock */}
                  <div className="relative">
                    <motion.div
                      animate={{
                        x: [0, 10, 0],
                        rotate: [0, 2, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-8xl mb-4"
                    >
                      <FaTruck className="mx-auto text-white/90" />
                    </motion.div>

                    {/* Lock Icon Overlay */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                      className="absolute -bottom-2 -right-2 bg-red-600 rounded-full p-3 border-4 border-white"
                    >
                      <FaLock className="text-2xl text-white" />
                    </motion.div>
                  </div>

                  {/* Warning Animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-4 -left-4"
                  >
                    <FaExclamationTriangle className="text-3xl text-yellow-300" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-4xl font-bold mb-4"
                >
                  Access Restricted
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-red-100 text-lg leading-relaxed"
                >
                  This delivery route is secured and requires special
                  authorization to access.
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
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                      <FaShieldAlt className="text-3xl text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-2">
                    403
                  </h1>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Forbidden Access
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    You don't have permission to access this area of HurryUp
                    Express. This might be because you need different user
                    privileges or you're trying to access a restricted dashboard
                    section.
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
                    Go to Homepage
                  </button>

                  <button
                    onClick={handleGoBack}
                    className="btn btn-outline w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    <FaArrowLeft className="mr-2" />
                    Go Back
                  </button>

                  <button
                    onClick={handleContactSupport}
                    className="btn btn-ghost w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium py-3 rounded-xl transition-all duration-300"
                  >
                    <FaHeadset className="mr-2" />
                    Contact Support
                  </button>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Need Access?
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        If you believe you should have access to this area,
                        please contact your administrator or our support team
                        for assistance.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Attempted Path Info (for debugging) */}
                {location.state?.from && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Attempted to access:{" "}
                      <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                        {location.state.from.pathname}
                      </code>
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Forbidden;
