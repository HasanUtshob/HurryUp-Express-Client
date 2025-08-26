import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiCalendar,
  FiShield,
  FiUpload,
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, userData, refetchUserData } = useAuth();
  const axiosSecure = useAxios();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || user?.displayName || "",
    email: userData?.email || user?.email || "",
    phone: userData?.phone || "",
    address: userData?.address || "",
    city: userData?.city || "",
    zipCode: userData?.zipCode || "",
    dateOfBirth: userData?.dateOfBirth || "",
    photoUrl: userData?.photoUrl || user?.photoURL || "",
  });

  // Update formData when userData changes (after successful update)
  useEffect(() => {
    if (userData || user) {
      setFormData({
        name: userData?.name || user?.displayName || "",
        email: userData?.email || user?.email || "",
        phone: userData?.phone || "",
        address: userData?.address || "",
        city: userData?.city || "",
        zipCode: userData?.zipCode || "",
        dateOfBirth: userData?.dateOfBirth || "",
        photoUrl: userData?.photoUrl || user?.photoURL || "",
      });
    }
  }, [userData, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Name is required!");
        setLoading(false);
        return;
      }

      // Prepare data for update (exclude email as it cannot be changed)
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        dateOfBirth: formData.dateOfBirth,
        photoUrl: formData.photoUrl,
      };

      // Remove empty fields to avoid overwriting with empty strings
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === "" ||
          updateData[key] === null ||
          updateData[key] === undefined
        ) {
          delete updateData[key];
        }
      });

      // Send PATCH request to update user profile
      const response = await axiosSecure.patch(`users/${user.uid}`, updateData);

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);

        // Refetch user data to update the context
        if (refetchUserData) {
          await refetchUserData();
        }
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      // Handle specific error messages
      if (error.response?.status === 404) {
        toast.error("User not found. Please try logging in again.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to update this profile.");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Invalid data provided.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || user?.displayName || "",
      email: userData?.email || user?.email || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      city: userData?.city || "",
      zipCode: userData?.zipCode || "",
      dateOfBirth: userData?.dateOfBirth || "",
      photoUrl: userData?.photoUrl || user?.photoURL || "",
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageUploading(true);

    try {
      // Create FormData for ImgBB upload
      const formData = new FormData();
      formData.append("image", file);

      // ImgBB API key - you should add this to your environment variables
      const imgbbApiKey =
        import.meta.env.VITE_IMGBB_API_KEY ||
        "35d533c9830c979166daa6d60911d270"; // Replace with your actual API key

      // Upload to ImgBB
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update form data with the uploaded image URL
        setFormData((prev) => ({
          ...prev,
          photoUrl: data.data.url,
        }));
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 overflow-hidden">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (formData.name || formData.email || "U")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                {isEditing && (
                  <label
                    className={`absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer transition-colors ${
                      imageUploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {imageUploading ? (
                      <FiUpload className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiCamera className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {formData.name || "User"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {formData.email}
              </p>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="w-4 h-4" />
                <span>
                  Member since{" "}
                  {new Date(
                    user?.metadata?.creationTime || Date.now()
                  ).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiShield className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Security
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Email Verified
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {user?.emailVerified ? "Verified" : "Not Verified"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Two-Factor Auth
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Not Enabled
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last Login
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(
                    user?.metadata?.lastSignInTime || Date.now()
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiUser className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {formData.name || "Not provided"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <p className="text-gray-900 dark:text-white py-2">
                  {formData.email}
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    (Cannot be changed)
                  </span>
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiPhone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {formData.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-2" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {formData.dateOfBirth
                      ? new Date(formData.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiMapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {formData.address || "Not provided"}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your city"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {formData.city || "Not provided"}
                  </p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zip Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your zip code"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {formData.zipCode || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
