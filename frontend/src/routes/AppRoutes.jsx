// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Auth from "../pages/Auth";
import SoilDetection from "../pages/SoilDetection";
import CropRecommendation from "../pages/CropRecommendation";
import AdminCrops from "../pages/AdminCrops";
import AdminCropDetails from "../pages/AdminCropDetails";
import AdminCropForm from "../pages/AdminCropForm";
import AdminUsers from "../pages/AdminUsers";
import CropSearch from "../pages/CropSearch";
import AdminSoils from "../pages/AdminSoils";
import AdminSoilDetails from "../pages/AdminSoilDetails";
import AdminSoilForm from "../pages/AdminSoilForm";
import ProtectedRoute from "../components/authcomponents/ProtectedRoute";
import SuperadminRecoverySetup from "../pages/SuperadminRecoverySetup";
import SuperadminResetPassword from "../pages/SuperadminResetPassword";
import SuperadminPasswordRecovery from "../pages/SuperadminPasswordRecovery";
import CropsList from "../pages/CropsList";
import SoilsList from "../pages/SoilsList";
import CropDetails from "../pages/CropDetails";
import SoilDetails from "../pages/SoilDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />
      <Route path="/auth" element={<Auth />} />
      <Route path="/crops" element={<CropsList />} />
      <Route path="/soils" element={<SoilsList />} />
      <Route path="/crop/:cropId" element={<CropDetails />} />
      <Route path="/soil/:soilId" element={<SoilDetails />} />
      <Route path="/admin/recovery-setup" element={<SuperadminRecoverySetup />} />
      <Route path="/admin/reset-password" element={<SuperadminResetPassword />} />
      <Route path="/admin/password-recovery" element={<SuperadminPasswordRecovery />} />
      <Route
        path="/soil-detection"
        element={
          <ProtectedRoute>
            <SoilDetection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crop-recommendation"
        element={
          <ProtectedRoute>
            <CropRecommendation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/crops"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCrops />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/crops/new"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCropForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/crops/:cropId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCropDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/crops/:cropId/edit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminCropForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search/crop"
        element={
          <ProtectedRoute>
            <CropSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/soils"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSoils />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/soils/new"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSoilForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/soils/:soilId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSoilDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/soils/:soilId/edit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSoilForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
