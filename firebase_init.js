import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Firebase configuration with environment variable support
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyD3AffE5-SZ3psuA0ZY3TXBwPIsQLlV2Ac",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "hurryup-e4338.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hurryup-e4338",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "hurryup-e4338.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "446010453132",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:446010453132:web:4126f9c74ea75342b71fa9",
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing Firebase configuration fields: ${missingFields.join(", ")}`
    );
  }

  // Basic validation for API key format
  if (!config.apiKey.startsWith("AIza")) {
    console.warn("Firebase API key format appears to be invalid");
  }

  return true;
};

let app;
let auth;

try {
  // Validate configuration before initializing
  validateFirebaseConfig(firebaseConfig);

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication
  auth = getAuth(app);

  // Connect to Auth emulator in development if specified
  if (
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true" &&
    import.meta.env.DEV
  ) {
    try {
      connectAuthEmulator(auth, "http://localhost:9099");
      // console.log("Connected to Firebase Auth emulator");
    } catch (error) {
      console.warn(
        "Failed to connect to Firebase Auth emulator:",
        error.message
      );
    }
  }

  // console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);

  // Provide helpful error messages
  if (error.message.includes("API key")) {
    console.error("Please check your Firebase API key configuration");
  } else if (error.message.includes("project")) {
    console.error("Please check your Firebase project configuration");
  }

  // Create a mock auth object to prevent app crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () =>
      Promise.reject(new Error("Firebase not initialized")),
    createUserWithEmailAndPassword: () =>
      Promise.reject(new Error("Firebase not initialized")),
    signInWithPopup: () =>
      Promise.reject(new Error("Firebase not initialized")),
    signOut: () => Promise.reject(new Error("Firebase not initialized")),
  };
}

export { auth };
export default app;
