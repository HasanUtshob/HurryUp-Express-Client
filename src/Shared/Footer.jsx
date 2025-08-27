import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaPaperPlane,
  FaHeart,
  FaArrowUp,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t("footer.newsletter.error"));
      return;
    }

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(t("footer.newsletter.success"));
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      icon: FaFacebookF,
      key: "facebook",
      color: "hover:text-blue-500",
      url: "https://www.facebook.com/Shahriahasanutshob/",
    },
    { icon: FaTwitter, key: "twitter", color: "hover:text-sky-500", url: "#" },
    {
      icon: FaInstagram,
      key: "PortFolio",
      color: "hover:text-pink-500",
      url: "https://hasanutshob.netlify.app/",
    },
    {
      icon: FaLinkedinIn,
      key: "linkedin",
      color: "hover:text-blue-600",
      url: "https://www.linkedin.com/in/md-hasan-utshob/",
    },
    {
      icon: FaYoutube,
      key: "youtube",
      color: "hover:text-red-500",
      url: "youtube.com",
    },
  ];

  const quickLinks = [
    { key: "home", path: "/" },
    { key: "about", path: "#" },
    { key: "services", path: "#" },
    { key: "pricing", path: "#" },
    { key: "contact", path: "#" },
    { key: "careers", path: "#" },
  ];

  const services = [
    "expressDelivery",
    "standardShipping",
    "bulkShipping",
    "internationalShipping",
    "trackingService",
    "insuranceService",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const socialVariants = {
    hover: {
      scale: 1.2,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-500/5 to-orange-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <FaTruck className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t("footer.company.title")}
                </h3>
              </motion.div>

              <p className="text-gray-300 mb-4 leading-relaxed">
                {t("footer.company.description")}
              </p>

              <motion.div
                whileHover={{ x: 5 }}
                className="inline-flex items-center space-x-2 text-blue-400 font-medium"
              >
                <FaHeart className="text-red-500" />
                <span>{t("footer.company.tagline")}</span>
              </motion.div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xl font-bold mb-6 text-white">
                {t("footer.quickLinks.title")}
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <motion.li
                    key={link.key}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span>{t(`footer.quickLinks.${link.key}`)}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xl font-bold mb-6 text-white">
                {t("footer.services.title")}
              </h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <motion.li
                    key={service}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span>{t(`footer.services.${service}`)}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact & Newsletter */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xl font-bold mb-6 text-white">
                {t("footer.contact.title")}
              </h4>

              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-3 text-gray-300"
                >
                  <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-sm">{t("footer.contact.address")}</span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 text-gray-300"
                >
                  <FaPhone className="text-green-400 flex-shrink-0" />
                  <span className="text-sm">{t("footer.contact.phone")}</span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 text-gray-300"
                >
                  <FaEnvelope className="text-purple-400 flex-shrink-0" />
                  <span className="text-sm">{t("footer.contact.email")}</span>
                </motion.div>
              </div>

              {/* Newsletter */}
              <div>
                <h5 className="text-lg font-semibold mb-3 text-white">
                  {t("footer.newsletter.title")}
                </h5>
                <p className="text-gray-400 text-sm mb-4">
                  {t("footer.newsletter.description")}
                </p>

                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("footer.newsletter.placeholder")}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubscribing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSubscribing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>{t("footer.newsletter.subscribe")}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Social Media & Scroll to Top */}
          <motion.div
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-gray-700"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              {/* Social Links */}
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 mr-4">
                  {t("footer.social.title")}:
                </span>
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.key}
                      href={social.url}
                      variants={socialVariants}
                      whileHover="hover"
                      className={`p-3 bg-gray-800/50 rounded-xl text-gray-400 ${social.color} transition-all duration-300 hover:bg-gray-700/50`}
                      title={t(`footer.social.${social.key}`)}
                    >
                      <IconComponent className="text-lg" />
                    </motion.a>
                  );
                })}
              </div>

              {/* Scroll to Top */}
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white hover:shadow-lg transition-all duration-300"
                title="Scroll to top"
              >
                <FaArrowUp />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm text-center md:text-left">
                {t("footer.bottom.copyright")}
              </p>

              <div className="flex items-center space-x-6 text-sm">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                >
                  {t("footer.bottom.privacy")}
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                >
                  {t("footer.bottom.terms")}
                </Link>
                <Link
                  to="/cookies"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                >
                  {t("footer.bottom.cookies")}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
