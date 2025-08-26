import React from "react";
import { motion } from "framer-motion";
import { FaTruck, FaBox, FaSpinner } from "react-icons/fa";

const LoadingSpinner = ({
  size = "md",
  color = "blue",
  type = "spinner",
  className = "",
}) => {
  // Size configurations
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  // Color configurations
  const colorClasses = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    green: "text-green-500",
    red: "text-red-500",
    gray: "text-gray-500",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-600",
  };

  // Animation variants
  const spinVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const bounceVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const renderSpinner = () => {
    const baseClasses = `${sizeClasses[size]} ${colorClasses[color]} ${className}`;

    switch (type) {
      case "truck":
        return (
          <motion.div
            variants={bounceVariants}
            animate="animate"
            className={baseClasses}
          >
            <FaTruck className="w-full h-full" />
          </motion.div>
        );

      case "package":
        return (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className={baseClasses}
          >
            <FaBox className="w-full h-full" />
          </motion.div>
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  color === "gradient"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600"
                    : `bg-current ${colorClasses[color]}`
                }`}
                animate={{
                  scale: [1, 1.5, 1],
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
        );

      case "pulse":
        return (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className={`${baseClasses} rounded-full ${
              color === "gradient"
                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                : `bg-current`
            }`}
          />
        );

      case "spinner":
      default:
        return (
          <motion.div
            variants={spinVariants}
            animate="animate"
            className={baseClasses}
          >
            <FaSpinner className="w-full h-full" />
          </motion.div>
        );
    }
  };

  return (
    <div className="inline-flex items-center justify-center">
      {renderSpinner()}
    </div>
  );
};

export default LoadingSpinner;
