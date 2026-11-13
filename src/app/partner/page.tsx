"use client";

import dynamic from "next/dynamic";

const PartnerDeskClient = dynamic(() => import("@/components/partner-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#031412] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c5a059] border-t-transparent" />
    </div>
  ),
});

export default function PartnerPage() {
  return <PartnerDeskClient />;
}
