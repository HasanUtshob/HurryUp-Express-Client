import "./i18n.js";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./Router/routes.jsx";
import ThemeProvider from "./Context/Provider/ThemeProvider.jsx";
import AuthProvider from "./Context/Provider/AuthProvider.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./Loading/PageLoader.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <Suspense fallback={<PageLoader message="Loading Home Page...." />}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              className: "",
              duration: 4000,
              style: { background: "#363636", color: "#fff" },
              success: {
                duration: 3000,
                theme: { primary: "green", secondary: "black" },
              },
              error: { duration: 4000 },
            }}
          />
        </AuthProvider>
      </Suspense>
    </ThemeProvider>
  </StrictMode>
);
