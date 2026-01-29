"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import Landing from "@/src/pages/Landing";
import DashboardLayout from "@/src/components/layout/DashboardLayout";

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (session) {
    return <DashboardLayout />;
  }

  // Otherwise show landing page
  return <Landing />;
}
