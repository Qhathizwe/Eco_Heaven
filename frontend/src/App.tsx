import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/landingPage/LandingPage";
import RegisterPage from "./pages/register/RegisterPage";
import LoginPage from "./pages/login/LoginPage";
import AccommodationDetails from "./pages/accomodation/AccomodationDetails";

import AdminDashboard from "./pages/dashboards/admin/AdminDashBoard";
import UserDashboard from "./pages/dashboards/user/UserDashboard";
import MyBookings from "./pages/dashboards/user/MyBookings";
import ProfilePage from './pages/profile/Profile'
import BookingSuccess from "./pages/bookings/BookingSuccess";

import ManageAccomodations from "./pages/dashboards/admin/manage_admin/ManageAccomodations";
import ManageRooms from "./pages/dashboards/admin/manage_admin/ManageRooms";
import ManageBookings from "./pages/dashboards/admin/manage_admin/ManageBookings";
import ManageUsers from "./pages/dashboards/admin/manage_admin/ManageUsers";

import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/stays" element={<LandingPage />} />
      <Route path="/stays/:id" element={<AccommodationDetails  />} />

      <Route path="/home" element={<UserDashboard />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/users/profile" element={<ProfilePage />} />
      <Route path="/payment-success" element={<BookingSuccess/>} />

      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/accommodations" element={<ManageAccomodations />} />
      <Route path="/admin/rooms" element={<ManageRooms />} />
      <Route path="/admin/bookings" element={<ManageBookings />} />
      <Route path="/admin/users" element={<ManageUsers />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}