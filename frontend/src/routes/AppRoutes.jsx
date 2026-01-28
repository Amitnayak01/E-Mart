import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import ProductList from "../pages/public/ProductList";
import ProductDetails from "../pages/public/ProductDetails";

import DashboardHome from "../pages/dashboard/DashboardHome";
import MyListings from "../pages/dashboard/MyListings";
import AddProduct from "../pages/dashboard/AddProduct";
import EditProduct from "../pages/dashboard/EditProduct";
import Favorites from "../pages/dashboard/Favorites";
import RecentlyViewed from "../pages/dashboard/RecentlyViewed";
import MyMessages from "../pages/dashboard/MyMessages";
import Profile from "../pages/dashboard/Profile";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageProducts from "../pages/admin/ManageProducts";
import Reports from "../pages/admin/Reports";

import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoute from "../components/common/AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="my-listings" element={<MyListings />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit/:id" element={<EditProduct />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="recent" element={<RecentlyViewed />} />
          <Route path="messages" element={<MyMessages />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
