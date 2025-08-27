import React, { useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import { auth } from "../../../firebase_init";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Helper function to handle Firebase errors
  const handleFirebaseError = (error) => {
    console.error("Firebase Auth Error:", error);
    setAuthError(error.message);

    // Map Firebase error codes to user-friendly messages
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled. Please try again.";
      case "auth/invalid-api-key":
        return "Firebase configuration error. Please check your setup.";
      case "auth/app-deleted":
        return "Firebase app has been deleted. Please refresh the page.";
      default:
        return (
          error.message || "An authentication error occurred. Please try again."
        );
    }
  };

  // SignUp User
  const CreateUser = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return result;
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // SignIn Account
  const SignInUser = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign With Google
  const provider = new GoogleAuthProvider();
  const SignWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Observer with comprehensive error handling
  useEffect(() => {
    let unSubscribe;

    try {
      unSubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          try {
            setUser(currentUser);
            setAuthError(null);

            if (currentUser?.uid) {
              setLoading(true);
              try {
                const token = await currentUser.getIdToken();
                const res = await axios.get(
                  `https://hurryup-express-server-1.onrender.com/users?uid=${currentUser.uid}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                // Handle the server response structure
                const users = res.data.data || res.data || [];
                setUserData(users[0] || {});
              } catch (err) {
                console.warn(
                  "Failed to fetch user data from server:",
                  err.message
                );
                setUserData(null);
              }
            } else {
              setUserData(null);
            }

            // console.log("Auth state changed:", currentUser);
            setLoading(false);
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setAuthError("Failed to update authentication state");
            setLoading(false);
          }
        },
        (error) => {
          // Error callback for onAuthStateChanged
          console.error("Auth state change error:", error);
          const errorMessage = handleFirebaseError(error);
          setAuthError(errorMessage);
          setUser(null);
          setUserData(null);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Failed to set up auth observer:", error);
      setAuthError(
        "Failed to initialize authentication. Please refresh the page."
      );
      setLoading(false);
    }

    return () => {
      if (unSubscribe) {
        try {
          unSubscribe();
        } catch (error) {
          console.error("Error unsubscribing from auth observer:", error);
        }
      }
    };
  }, []);

  // SignOut Section
  const SignOut = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Add refetchUserData function
  const refetchUserData = async () => {
    if (!user?.uid) {
      console.warn("No user UID available for refetching data");
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await axios.get(
        `https://hurryup-express-server-1.onrender.com/users?uid=${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Handle the server response structure
      const users = res.data.data || res.data || [];
      setUserData(users[0] || {});
      // console.log("User data refetched successfully");
    } catch (err) {
      console.warn("Failed to refetch user data:", err.message);
      // Don't throw error to avoid breaking the UI
    } finally {
      setLoading(false);
    }
  };

  const userInfo = {
    CreateUser,
    SignInUser,
    SignOut,
    setLoading,
    loading,
    user,
    userData,
    SignWithGoogle,
    authError,
    setAuthError,
    refetchUserData, // FIXED: Add refetchUserData to context
  };

  return <AuthContext value={userInfo}>{children}</AuthContext>;
};

export default AuthProvider;
