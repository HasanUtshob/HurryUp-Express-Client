import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import loginAnimation from "../../assets/Login.json";
import LoadingSpinner from "../../Loading/LoadingSpinner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { SignInUser, SignWithGoogle, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await SignInUser(data.email, data.password);
      toast.success("Login successful! Welcome back!");
      reset();
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await SignWithGoogle();
      if (result.user) {
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          photoUrl: result.user.photoURL,
          provider: "google",
          role: "user",
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
          console.log("User might already exist in database:", error.message);
        }
      }
      toast.success("Google sign-in successful!");
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      const errorMessage =
        error.message || "Google sign-in failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Animation */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-80 h-80 mx-auto mb-6">
                  <Lottie
                    animationData={loginAnimation}
                    loop={true}
                    className="w-full h-full"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-blue-100 text-lg">
                  Sign in to access your HurryUp Express dashboard and manage
                  your deliveries.
                </p>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Sign In
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your credentials to access your account
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
                  {/* Email Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
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

                  {/* Password Field */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`input input-bordered w-full pr-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <LoadingSpinner></LoadingSpinner> : "Sign In"}
                  </button>
                </form>

                {/* Divider */}
                <div className="divider my-8 text-gray-500 dark:text-gray-400">
                  OR
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="btn btn-outline w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaGoogle className="text-red-500 mr-2" />
                  Continue with Google
                </button>

                {/* Sign Up Link */}
                <div className="text-center mt-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all duration-300"
                    >
                      Sign up here
                    </Link>
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

export default Login;
