import React from "react";
import { motion } from "framer-motion";
import { FaTruck, FaBox, FaSpinner } from "react-icons/fa";

const Loading = ({
  size = "default",
  message = "Loading...",
  type = "default",
  fullScreen = false,
}) => {
  // Animation variants for different loading types
  const truckVariants = {
    animate: {
      x: [0, 20, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const boxVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-16 h-16",
      icon: "text-2xl",
      text: "text-sm",
    },
    default: {
      container: "w-24 h-24",
      icon: "text-4xl",
      text: "text-base",
    },
    large: {
      container: "w-32 h-32",
      icon: "text-6xl",
      text: "text-lg",
    },
  };

  const config = sizeConfig[size];

  // Loading component variants
  const renderLoadingIcon = () => {
    switch (type) {
      case "truck":
        return (
          <motion.div
            variants={truckVariants}
            animate="animate"
            className={`${config.icon} text-blue-500`}
          >
            <FaTruck />
          </motion.div>
        );
      case "package":
        return (
          <motion.div
            variants={boxVariants}
            animate="animate"
            className={`${config.icon} text-purple-500`}
          >
            <FaBox />
          </motion.div>
        );
      case "spinner":
        return (
          <motion.div
            variants={spinnerVariants}
            animate="animate"
            className={`${config.icon} text-blue-500`}
          >
            <FaSpinner />
          </motion.div>
        );
      default:
        return (
          <div className={`${config.container} relative`}>
            {/* Animated Dots */}
            <div className="flex space-x-1 justify-center items-center h-full">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
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
          </div>
        );
    }
  };

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {/* HurryUp Express Logo/Brand */}
            <div className="mb-6">
              <motion.div
                animate={{
                  x: [0, 30, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-8xl text-blue-500 mb-4"
              >
                <FaTruck />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HurryUp Express
              </h2>
            </div>
          </motion.div>

          {/* Loading Animation */}
          <div className="mb-6">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                  key={index}
                  className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 dark:text-gray-400 font-medium"
          >
            {message}
          </motion.p>

          {/* Progress Bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular loading component
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        {renderLoadingIcon()}

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${config.text} text-gray-600 dark:text-gray-400 mt-4 font-medium text-center`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default Loading;
