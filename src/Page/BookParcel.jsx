import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FaMapMarkerAlt,
  FaBox,
  FaMoneyBillWave,
  FaTruck,
  FaHome,
  FaPhone,
  FaUser,
  FaWeight,
  FaCalculator,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import Loading from "../Loading/Loading";

const BookParcel = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [totalCharge, setTotalCharge] = useState(0);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const watchZipCode = watch("deliveryZipCode");
  const watchWeight = watch("parcelWeight");

  // Calculate delivery charges based on zip code and weight
  useEffect(() => {
    const calculateDeliveryCharge = () => {
      let baseCharge = 0;
      let weightCharge = 0;

      // Base delivery charge based on zip code
      if (watchZipCode) {
        const zipCode = parseInt(watchZipCode);
        if (zipCode >= 1000 && zipCode <= 1399) {
          baseCharge = 100; // BDT
        } else {
          baseCharge = 160; // BDT
        }
      }

      // Additional charge for parcels over 5kg (first 5kg free)
      if (watchWeight) {
        const weight = parseFloat(watchWeight);
        if (weight > 5) {
          const extraWeight = weight - 5;
          weightCharge = Math.ceil(extraWeight) * 100; // 100 BDT per kg for weight above 5kg
        }
      }

      const total = baseCharge + weightCharge;
      setDeliveryCharge(baseCharge);
      setTotalCharge(total);
    };

    calculateDeliveryCharge();
  }, [watchZipCode, watchWeight]);

  const parcelSizes = [
    {
      value: "small",
      label: t("bookParcel.parcelSizes.small.label"),
      description: t("bookParcel.parcelSizes.small.description"),
      icon: "📦",
    },
    {
      value: "medium",
      label: t("bookParcel.parcelSizes.medium.label"),
      description: t("bookParcel.parcelSizes.medium.description"),
      icon: "📫",
    },
    {
      value: "large",
      label: t("bookParcel.parcelSizes.large.label"),
      description: t("bookParcel.parcelSizes.large.description"),
      icon: "📮",
    },
    {
      value: "extra-large",
      label: t("bookParcel.parcelSizes.extraLarge.label"),
      description: t("bookParcel.parcelSizes.extraLarge.description"),
      icon: "🗳️",
    },
  ];

  const parcelTypes = [
    {
      value: "document",
      label: t("bookParcel.parcelTypes.document"),
      icon: "📄",
    },
    {
      value: "electronics",
      label: t("bookParcel.parcelTypes.electronics"),
      icon: "📱",
    },
    {
      value: "clothing",
      label: t("bookParcel.parcelTypes.clothing"),
      icon: "👕",
    },
    { value: "food", label: t("bookParcel.parcelTypes.food"), icon: "🍕" },
    {
      value: "fragile",
      label: t("bookParcel.parcelTypes.fragile"),
      icon: "🔮",
    },
    { value: "other", label: t("bookParcel.parcelTypes.other"), icon: "📦" },
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Add calculated charges to the data
      const bookingData = {
        ...data,
        deliveryCharge,
        totalCharge,
        email: user?.email,
        uid: user?.uid,
        deliveryStatus: "pending",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
      };

      // Make API call to the backend
      const response = await fetch(
        "https://hurryup-express-server-1.onrender.com/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log("Parcel booking data:", result.data);

        const bookingId = result.data.bookingId;
        console.log(bookingId);

        toast.success(t("bookParcel.success", { bookingId }));
        reset();
      } else {
        throw new Error(result.message || "Failed to book parcel");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(t("bookParcel.error", { error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📦 {t("bookParcel.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t("bookParcel.subtitle")}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Addresses Section */}
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Pickup Address */}
                  <div className="space-y-4 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white">
                        <FaHome className="text-xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t("bookParcel.pickupAddress.title")}
                      </h3>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaUser className="inline mr-2" />
                          {t("bookParcel.pickupAddress.contactName")}
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          "bookParcel.pickupAddress.contactNamePlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 ${
                          errors.pickupContactName ? "border-red-500" : ""
                        }`}
                        {...register("pickupContactName", {
                          required: t(
                            "bookParcel.validation.contactNameRequired"
                          ),
                          minLength: {
                            value: 2,
                            message: t(
                              "bookParcel.validation.contactNameMinLength"
                            ),
                          },
                        })}
                      />
                      {errors.pickupContactName && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.pickupContactName.message}
                        </span>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaPhone className="inline mr-2" />
                          {t("bookParcel.pickupAddress.phoneNumber")}
                        </span>
                      </label>
                      <input
                        type="tel"
                        placeholder={t(
                          "bookParcel.pickupAddress.phoneNumberPlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 ${
                          errors.pickupPhone ? "border-red-500" : ""
                        }`}
                        {...register("pickupPhone", {
                          required: t("bookParcel.validation.phoneRequired"),
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: t("bookParcel.validation.phoneInvalid"),
                          },
                        })}
                      />
                      {errors.pickupPhone && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.pickupPhone.message}
                        </span>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaMapMarkerAlt className="inline mr-2" />
                          {t("bookParcel.pickupAddress.fullAddress")}
                        </span>
                      </label>
                      <textarea
                        placeholder={t(
                          "bookParcel.pickupAddress.fullAddressPlaceholder"
                        )}
                        className={`textarea textarea-bordered w-full h-24 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 ${
                          errors.pickupAddress ? "border-red-500" : ""
                        }`}
                        {...register("pickupAddress", {
                          required: t(
                            "bookParcel.validation.pickupAddressRequired"
                          ),
                          minLength: {
                            value: 10,
                            message: t(
                              "bookParcel.validation.pickupAddressMinLength"
                            ),
                          },
                        })}
                      />
                      {errors.pickupAddress && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.pickupAddress.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-4 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                        <FaTruck className="text-xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t("bookParcel.deliveryAddress.title")}
                      </h3>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaUser className="inline mr-2" />
                          {t("bookParcel.deliveryAddress.contactName")}
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          "bookParcel.deliveryAddress.contactNamePlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                          errors.deliveryContactName ? "border-red-500" : ""
                        }`}
                        {...register("deliveryContactName", {
                          required: t(
                            "bookParcel.validation.deliveryContactNameRequired"
                          ),
                          minLength: {
                            value: 2,
                            message: t(
                              "bookParcel.validation.contactNameMinLength"
                            ),
                          },
                        })}
                      />
                      {errors.deliveryContactName && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.deliveryContactName.message}
                        </span>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaPhone className="inline mr-2" />
                          {t("bookParcel.deliveryAddress.phoneNumber")}
                        </span>
                      </label>
                      <input
                        type="tel"
                        placeholder={t(
                          "bookParcel.deliveryAddress.phoneNumberPlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                          errors.deliveryPhone ? "border-red-500" : ""
                        }`}
                        {...register("deliveryPhone", {
                          required: t("bookParcel.validation.phoneRequired"),
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: t("bookParcel.validation.phoneInvalid"),
                          },
                        })}
                      />
                      {errors.deliveryPhone && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.deliveryPhone.message}
                        </span>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaMapMarkerAlt className="inline mr-2" />
                          {t("bookParcel.deliveryAddress.streetAddress")}
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          "bookParcel.deliveryAddress.streetAddressPlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                          errors.deliveryAddress ? "border-red-500" : ""
                        }`}
                        {...register("deliveryAddress", {
                          required: t(
                            "bookParcel.validation.streetAddressRequired"
                          ),
                          minLength: {
                            value: 5,
                            message: t(
                              "bookParcel.validation.streetAddressMinLength"
                            ),
                          },
                        })}
                      />
                      {errors.deliveryAddress && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.deliveryAddress.message}
                        </span>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaMapMarkerAlt className="inline mr-2" />
                          {t("bookParcel.deliveryAddress.division")}
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder={t(
                          "bookParcel.deliveryAddress.divisionPlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                          errors.deliveryDivision ? "border-red-500" : ""
                        }`}
                        {...register("deliveryDivision", {
                          required: t("bookParcel.validation.divisionRequired"),
                          minLength: {
                            value: 2,
                            message: t(
                              "bookParcel.validation.divisionMinLength"
                            ),
                          },
                        })}
                      />
                      {errors.deliveryDivision && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.deliveryDivision.message}
                        </span>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                          <FaMapMarkerAlt className="inline mr-2" />
                          {t("bookParcel.deliveryAddress.zipCode")}
                        </span>
                      </label>
                      <input
                        type="number"
                        placeholder={t(
                          "bookParcel.deliveryAddress.zipCodePlaceholder"
                        )}
                        className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                          errors.deliveryZipCode ? "border-red-500" : ""
                        }`}
                        {...register("deliveryZipCode", {
                          required: t("bookParcel.validation.zipCodeRequired"),
                          pattern: {
                            value: /^[0-9]{4}$/,
                            message: t("bookParcel.validation.zipCodeInvalid"),
                          },
                        })}
                      />
                      {errors.deliveryZipCode && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.deliveryZipCode.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parcel Details Section */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white">
                    <FaBox className="text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("bookParcel.parcelDetails.title")}
                  </h3>
                </div>

                {/* Parcel Size */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 font-medium text-lg">
                      {t("bookParcel.parcelDetails.selectParcelSize")}
                    </span>
                  </label>
                  <select
                    className={`select select-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 ${
                      errors.parcelSize ? "border-red-500" : ""
                    }`}
                    {...register("parcelSize", {
                      required: t("bookParcel.validation.parcelSizeRequired"),
                    })}
                  >
                    <option value="">
                      {t("bookParcel.parcelDetails.chooseParcelSize")}
                    </option>
                    {parcelSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.icon} {size.label} - {size.description}
                      </option>
                    ))}
                  </select>
                  {errors.parcelSize && (
                    <span className="text-red-500 text-sm mt-2">
                      {errors.parcelSize.message}
                    </span>
                  )}
                </div>

                {/* Parcel Type */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 font-medium text-lg">
                      {t("bookParcel.parcelDetails.selectParcelType")}
                    </span>
                  </label>
                  <select
                    className={`select select-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${
                      errors.parcelType ? "border-red-500" : ""
                    }`}
                    {...register("parcelType", {
                      required: t("bookParcel.validation.parcelTypeRequired"),
                    })}
                  >
                    <option value="">
                      {t("bookParcel.parcelDetails.chooseParcelType")}
                    </option>
                    {parcelTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.parcelType && (
                    <span className="text-red-500 text-sm mt-2">
                      {errors.parcelType.message}
                    </span>
                  )}
                </div>

                {/* Parcel Weight */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 font-medium text-lg">
                      <FaWeight className="inline mr-2" />
                      {t("bookParcel.parcelDetails.parcelWeight")}
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder={t(
                      "bookParcel.parcelDetails.parcelWeightPlaceholder"
                    )}
                    className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 ${
                      errors.parcelWeight ? "border-red-500" : ""
                    }`}
                    {...register("parcelWeight", {
                      required: t("bookParcel.validation.parcelWeightRequired"),
                      min: {
                        value: 0.1,
                        message: t("bookParcel.validation.parcelWeightMin"),
                      },
                      max: {
                        value: 100,
                        message: t("bookParcel.validation.parcelWeightMax"),
                      },
                    })}
                  />
                  {errors.parcelWeight && (
                    <span className="text-red-500 text-sm mt-2">
                      {errors.parcelWeight.message}
                    </span>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                      {t("bookParcel.parcelDetails.specialInstructions")}
                    </span>
                  </label>
                  <textarea
                    placeholder={t(
                      "bookParcel.parcelDetails.specialInstructionsPlaceholder"
                    )}
                    className="textarea textarea-bordered w-full h-20 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                    {...register("specialInstructions")}
                  />
                </div>
              </div>

              {/* Delivery Charge Calculation Section */}
              {(watchZipCode || watchWeight) && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white">
                      <FaCalculator className="text-xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t("bookParcel.deliveryCharges.title")}
                    </h3>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
                    <div className="space-y-4">
                      {watchZipCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {t("bookParcel.deliveryCharges.baseDeliveryCharge")}
                          </span>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {deliveryCharge} BDT
                          </span>
                        </div>
                      )}

                      {watchWeight && parseFloat(watchWeight) > 5 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            <span>
                              {t("bookParcel.deliveryCharges.freeWeight")}
                            </span>{" "}
                            <br></br>
                            {t(
                              "bookParcel.deliveryCharges.extraWeightCharge"
                            )}{" "}
                            ({Math.ceil(parseFloat(watchWeight) - 5)} kg × 100
                            BDT):
                          </span>
                          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {Math.ceil(parseFloat(watchWeight) - 5) * 100} BDT
                          </span>
                        </div>
                      )}

                      <hr className="border-purple-200 dark:border-purple-700" />

                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {t("bookParcel.deliveryCharges.totalCharge")}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {totalCharge} BDT
                        </span>
                      </div>

                      {watchZipCode && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <p>
                            📍 Zip Code: {watchZipCode}
                            {parseInt(watchZipCode) >= 1000 &&
                            parseInt(watchZipCode) <= 1399
                              ? ` (${t(
                                  "bookParcel.deliveryCharges.premiumZone"
                                )})`
                              : ` (${t(
                                  "bookParcel.deliveryCharges.standardZone"
                                )})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-full text-white">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("bookParcel.paymentMethod.title")}
                  </h3>
                </div>

                <div className="max-w-md mx-auto">
                  <label className="cursor-pointer transform hover:scale-105 transition-all duration-300 block">
                    <input
                      type="radio"
                      value="cod"
                      className="sr-only peer"
                      defaultChecked
                      {...register("paymentMethod", {
                        required: t(
                          "bookParcel.validation.paymentMethodRequired"
                        ),
                      })}
                    />
                    <div className="p-6 border-2 rounded-xl transition-all duration-300 border-green-500 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white">
                          <FaMoneyBillWave className="text-xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {t("bookParcel.paymentMethod.cod.title")}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {t("bookParcel.paymentMethod.cod.description")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <span className="text-red-500 text-sm">
                    {errors.paymentMethod.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn w-full bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white font-semibold py-4 text-lg rounded-xl hover:from-purple-600 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loading></Loading>
                      {t("bookParcel.submitButton.booking")}
                    </>
                  ) : (
                    <>
                      <FaTruck className="mr-2" />
                      {t("bookParcel.submitButton.bookNow")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: "🚀",
              title: t("bookParcel.features.fastDelivery.title"),
              description: t("bookParcel.features.fastDelivery.description"),
            },
            {
              icon: "🔒",
              title: t("bookParcel.features.secureHandling.title"),
              description: t("bookParcel.features.secureHandling.description"),
            },
            {
              icon: "📱",
              title: t("bookParcel.features.realTimeTracking.title"),
              description: t(
                "bookParcel.features.realTimeTracking.description"
              ),
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookParcel;
