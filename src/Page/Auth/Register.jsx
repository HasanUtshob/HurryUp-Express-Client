import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaUpload,
} from "react-icons/fa";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import registerAnimation from "../../assets/register.json";
import LoadingSpinner from "../../Loading/LoadingSpinner";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { CreateUser, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const password = watch("password");

  // ImgBB API key from environment variables
  const IMGBB_API_KEY =
    import.meta.env.VITE_IMGBB_API_KEY || "35d533c9830c979166daa6d60911d270";

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to ImgBB
  const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // First, upload image to ImgBB if selected
      let uploadedImageUrl = "";
      if (imageFile) {
        toast.loading("Uploading profile photo...", { id: "upload" });
        uploadedImageUrl = await uploadImageToImgBB(imageFile);
        toast.dismiss("upload");

        if (!uploadedImageUrl) {
          toast.error(
            "Failed to upload image. Registration will continue without photo."
          );
        } else {
          toast.success("Profile photo uploaded successfully!");
        }
      }

      // Create user with Firebase
      const result = await CreateUser(data.email, data.password);

      if (result?.user) {
        // Create user in database with uploaded image URL
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: data.name,
          photoUrl: uploadedImageUrl || result.user.photoURL || "",
          provider: "email",
          role: "customer",
          createdAt: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        };

        // Send user data to server
        try {
          await fetch("https://hurryup-express-server-1.onrender.com/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });
        } catch (error) {
          console.log("Error saving user to database:", error.message);
        }
      }

      toast.success("Registration successful! Welcome to HurryUp Express!");
      reset();
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Create Account
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Join HurryUp Express and start managing your deliveries
                  </p>
                </div>

                {/* Display authentication errors */}
                {authError && (
                  <div className="alert alert-error mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{authError}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setAuthError(null)}
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaUser className="inline mr-2" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${
                        errors.name ? "border-red-500" : ""
                      }`}
                      {...register("name", {
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      })}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaEnvelope className="inline mr-2" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Photo Upload Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaCamera className="inline mr-2" />
                        Profile Photo (Optional)
                      </span>
                    </label>
                    <div className="flex items-center space-x-4">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <FaUser className="text-gray-400 text-2xl" />
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className={`btn btn-outline btn-sm border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer transition-all duration-300 ${
                            isUploadingImage
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FaUpload className="mr-2" />
                          {isUploadingImage
                            ? "Uploading..."
                            : imageFile
                            ? "Change Photo"
                            : "Upload Photo"}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Max 5MB, JPG/PNG/GIF
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaLock className="inline mr-2" />
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className={`input input-bordered w-full pr-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message:
                              "Password must contain uppercase, lowercase, and number",
                          },
                        })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        <FaLock className="inline mr-2" />
                        Confirm Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`input input-bordered w-full pr-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isUploadingImage}
                    className="btn btn-primary w-full bg-gradient-to-r from-purple-500 to-pink-600 border-none text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <LoadingSpinner></LoadingSpinner>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-purple-600 dark:text-purple-400 font-semibold hover:underline transition-all duration-300"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Animation */}
            <div className="lg:w-1/2 bg-gradient-to-br from-purple-500 to-pink-600 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-80 h-80 mx-auto mb-6">
                  <Lottie
                    animationData={registerAnimation}
                    loop={true}
                    className="w-full h-full"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4">Join Our Community!</h2>
                <p className="text-purple-100 text-lg">
                  Create your account and become part of the HurryUp Express
                  family. Fast, reliable, and secure delivery management awaits
                  you.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <FaUser className="text-2xl" />
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <FaEnvelope className="text-2xl" />
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <FaLock className="text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
