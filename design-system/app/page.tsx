"use client";

import React, { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { JourneyAtlas } from "@/components/JourneyAtlas";
import { FlightEnquiryForm } from "@/components/FlightEnquiryForm";
import { DestinationGrid } from "@/components/DestinationGrid";
import { ServiceCatalog } from "@/components/ServiceCatalog";
import { B2BAgencySection } from "@/components/B2BAgencySection";
import { FlightRadarCard } from "@/components/FlightRadarCard";
import { SiteFooter } from "@/components/SiteFooter";
import { AtlasRoute, Airport } from "@/lib/config/siteConfig";

export default function BengaliHomePage() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>("DAC");
  const [selectedDestination, setSelectedDestination] = useState<string>("DXB");

  const handleRouteSelect = (route: AtlasRoute) => {
    setSelectedOrigin(route.originIata);
    setSelectedDestination(route.destIata);
    const formEl = document.getElementById("flight-quote");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDestinationSelect = (airport: Airport) => {
    setSelectedOrigin("DAC");
    setSelectedDestination(airport.iata);
    const formEl = document.getElementById("flight-quote");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      {/* 1. Header with language switcher & direct actions */}
      <SiteHeader lang="bn" />

      <main className="flex-1">
        {/* 2. Hero Section with verified Bengali copy */}
        <HeroSection lang="bn" />

        {/* 3. Flight Quotation Interactive Engine */}
        <FlightEnquiryForm
          lang="bn"
          initialOrigin={selectedOrigin}
          initialDestination={selectedDestination}
        />

        {/* 4. Journey Atlas with Three.js 3D Interactive Globe & 8 Route Corridors */}
        <JourneyAtlas lang="bn" onSelectRoute={handleRouteSelect} />

        {/* 5. 33 Domestic & Global Destinations Grid */}
        <DestinationGrid lang="bn" onSelectDestination={handleDestinationSelect} />

        {/* 6. 8 Verified Services Catalog */}
        <ServiceCatalog lang="bn" />

        {/* 7. B2B Agency Partnership & 6 Desks */}
        <B2BAgencySection lang="bn" />

        {/* 8. Flight Telemetry & Schedule Status Desk */}
        <section className="bg-surface-0 py-12 border-b border-safaria-line">
          <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
            <FlightRadarCard lang="bn" />
          </div>
        </section>
      </main>

      {/* 9. Site Footer with legal notices & disclaimers */}
      <SiteFooter lang="bn" />
    </div>
  );
}
