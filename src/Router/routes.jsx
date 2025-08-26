import { createBrowserRouter } from "react-router";
import Mainlayout from "../Layout/Mainlayout";
import DashboardLayout from "../Layout/DashboardLayout";
import Home from "../Page/Home";
import Contact from "../Page/Contact";
import Login from "../Page/Auth/Login";
import Register from "../Page/Auth/Register";
import BookParcel from "../Page/BookParcel";
import BecomeAgent from "../Page/BecomeAgent";
import Dashboard from "../Page/Dashboard/Dashboard";
import CustomerDashboard from "../Page/Dashboard/CustomerDashboard";
import AgentDashboard from "../Page/Dashboard/AgentDashboard";
import AgentDeliveryManagement from "../Page/Dashboard/AgentDeliveryManagement";
import MyParcels from "../Page/Dashboard/MyParcels";
import Profile from "../Page/Dashboard/Profile";
import TrackParcel from "../Page/Dashboard/TrackParcel";
// import PublicTrackParcel from "../Page/PublicTrackParcel";
import AssignDeliveryAgent from "../Page/Dashboard/AssignDeliveryAgent";
import AgentRequestManagement from "../Page/Dashboard/AgentRequestManagement";
import forbidden from "../Access Restricted routes/forbidden";
import NotFound from "../Page/NotFound";
import AdminRoute from "./AdminRoute";
import AgentRoute from "./AgentRoute";
import CustomerRoute from "./CustomerRoute";
import PrivateRoutes from "./PrivateRoutes";
import BookingInfo from "../Page/Dashboard/BookingInfo";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Mainlayout,
    children: [
      {
        index: true,
        element: <Home></Home>,
      },
      {
        path: "contact",
        element: <Contact></Contact>,
      },
      {
        path: "book-parcel",
        element: (
          <CustomerRoute>
            <BookParcel></BookParcel>
          </CustomerRoute>
        ),
      },
      {
        path: "become-agent",
        element: (
          <CustomerRoute>
            <BecomeAgent></BecomeAgent>
          </CustomerRoute>
        ),
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoutes>
        <DashboardLayout></DashboardLayout>
      </PrivateRoutes>
    ),
    children: [
      {
        path: "admin-dashboard",
        element: (
          <AdminRoute>
            <Dashboard></Dashboard>
          </AdminRoute>
        ),
      },
      {
        path: "my-parcels",
        element: (
          <CustomerRoute>
            <MyParcels></MyParcels>
          </CustomerRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoutes>
            <Profile></Profile>
          </PrivateRoutes>
        ),
      },
      {
        path: "track-parcel",
        element: (
          <CustomerRoute>
            <TrackParcel></TrackParcel>
          </CustomerRoute>
        ),
      },
      {
        path: "bookingInfo",
        element: (
          <AdminRoute>
            <BookingInfo></BookingInfo>
          </AdminRoute>
        ),
      },
      {
        path: "assign-delivery-agent",
        element: (
          <AdminRoute>
            <AssignDeliveryAgent></AssignDeliveryAgent>
          </AdminRoute>
        ),
      },
      {
        path: "agent-requests",
        element: (
          <AdminRoute>
            <AgentRequestManagement></AgentRequestManagement>
          </AdminRoute>
        ),
      },
      {
        path: "customer",
        element: (
          <CustomerRoute>
            <CustomerDashboard></CustomerDashboard>
          </CustomerRoute>
        ),
      },
      {
        path: "agent",
        element: (
          <AgentRoute>
            <AgentDashboard></AgentDashboard>
          </AgentRoute>
        ),
      },
      {
        path: "agent-deliveries",
        element: (
          <AgentRoute>
            <AgentDeliveryManagement></AgentDeliveryManagement>
          </AgentRoute>
        ),
      },
      {
        path: "forbidden",
        Component: forbidden,
      },
    ],
  },
  // Catch-all route for 404 Not Found
]);
