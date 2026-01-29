"use client";

import UserManagement from "@/src/pages/UserManagement";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <UserManagement />
    </ProtectedRoute>
  );
}
