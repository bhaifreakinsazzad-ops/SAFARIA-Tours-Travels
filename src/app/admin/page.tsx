"use client";

import dynamic from "next/dynamic";

const AdminTriageClient = dynamic(() => import("@/components/admin-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#031412] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c5a059] border-t-transparent" />
    </div>
  ),
});

export default function AdminPage() {
  return <AdminTriageClient />;
}
