import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaUser, FaEnvelope, FaPhone, FaFileAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Loading from "../Loading/Loading";

const BecomeAgent = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Add user ID to the request data
      const requestData = {
        ...data,
        uid: user?.uid,
        userEmail: user?.email,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(
        "https://hurryup-express-server-1.onrender.com/agent-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(t("becomeAgent.messages.success"));
        reset();
      } else {
        toast.error(result.message || t("becomeAgent.messages.error"));
      }
    } catch (error) {
      console.error("Error submitting agent request:", error);
      toast.error(t("becomeAgent.messages.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Info */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-6">
                  <FaUser className="text-6xl mx-auto mb-4 opacity-80" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  {t("becomeAgent.title")}
                </h2>
                <p className="text-blue-100 text-lg mb-6">
                  {t("becomeAgent.subtitle")}
                </p>
                <div className="space-y-4 text-left">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>{t("becomeAgent.benefits.flexibleHours")}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>
                      {t("becomeAgent.benefits.competitiveCompensation")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>
                      {t("becomeAgent.benefits.professionalTraining")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    <span>{t("becomeAgent.benefits.growthOpportunities")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("becomeAgent.form.title")}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("becomeAgent.form.subtitle")}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Full Name Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaUser className="inline mr-2" />
                        {t("becomeAgent.form.fullName.label")}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("becomeAgent.form.fullName.placeholder")}
                      className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      {...register("name", {
                        required: t("becomeAgent.validation.nameRequired"),
                        minLength: {
                          value: 2,
                          message: t("becomeAgent.validation.nameMinLength"),
                        },
                      })}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaPhone className="inline mr-2" />
                        {t("becomeAgent.form.phone.label")}
                      </span>
                    </label>
                    <input
                      type="tel"
                      placeholder={t("becomeAgent.form.phone.placeholder")}
                      className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      {...register("phone", {
                        required: t("becomeAgent.validation.phoneRequired"),
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: t("becomeAgent.validation.phoneInvalid"),
                        },
                        minLength: {
                          value: 10,
                          message: t("becomeAgent.validation.phoneMinLength"),
                        },
                      })}
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaEnvelope className="inline mr-2" />
                        {t("becomeAgent.form.email.label")}
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder={t("becomeAgent.form.email.placeholder")}
                      className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      {...register("email", {
                        required: t("becomeAgent.validation.emailRequired"),
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: t("becomeAgent.validation.emailInvalid"),
                        },
                      })}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Experience Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaFileAlt className="inline mr-2" />
                        {t("becomeAgent.form.experience.label")}
                      </span>
                    </label>
                    <textarea
                      placeholder={t("becomeAgent.form.experience.placeholder")}
                      className="textarea textarea-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 h-24"
                      {...register("experience")}
                    />
                  </div>

                  {/* Vehicle Type Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        {t("becomeAgent.form.vehicleType.label")}
                      </span>
                    </label>
                    <select
                      className={`select select-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                        errors.vehicleType ? "border-red-500" : ""
                      }`}
                      {...register("vehicleType", {
                        required: t(
                          "becomeAgent.validation.vehicleTypeRequired"
                        ),
                      })}
                    >
                      <option value="">
                        {t("becomeAgent.form.vehicleType.placeholder")}
                      </option>
                      <option value="bicycle">
                        {t("becomeAgent.form.vehicleType.options.bicycle")}
                      </option>
                      <option value="motorcycle">
                        {t("becomeAgent.form.vehicleType.options.motorcycle")}
                      </option>
                      <option value="car">
                        {t("becomeAgent.form.vehicleType.options.car")}
                      </option>
                      <option value="van">
                        {t("becomeAgent.form.vehicleType.options.van")}
                      </option>
                      <option value="other">
                        {t("becomeAgent.form.vehicleType.options.other")}
                      </option>
                    </select>
                    {errors.vehicleType && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.vehicleType.message}
                      </span>
                    )}
                  </div>

                  {/* Availability Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        {t("becomeAgent.form.availability.label")}
                      </span>
                    </label>
                    <select
                      className={`select select-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                        errors.availability ? "border-red-500" : ""
                      }`}
                      {...register("availability", {
                        required: t(
                          "becomeAgent.validation.availabilityRequired"
                        ),
                      })}
                    >
                      <option value="">
                        {t("becomeAgent.form.availability.placeholder")}
                      </option>
                      <option value="morning">
                        {t("becomeAgent.form.availability.options.morning")}
                      </option>
                      <option value="afternoon">
                        {t("becomeAgent.form.availability.options.afternoon")}
                      </option>
                      <option value="evening">
                        {t("becomeAgent.form.availability.options.evening")}
                      </option>
                      <option value="flexible">
                        {t("becomeAgent.form.availability.options.flexible")}
                      </option>
                      <option value="fulltime">
                        {t("becomeAgent.form.availability.options.fulltime")}
                      </option>
                    </select>
                    {errors.availability && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.availability.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full bg-gradient-to-r from-blue-500 to-indigo-600 border-none text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loading></Loading>
                    ) : (
                      t("becomeAgent.form.submitButton.submit")
                    )}
                  </button>
                </form>

                {/* Additional Info */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("becomeAgent.messages.reviewTime")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeAgent;
