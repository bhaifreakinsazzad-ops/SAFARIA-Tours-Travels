<!DOCTYPE html>
<html lang="bn" class="scroll-smooth">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAFARIA Tours &amp; Travels | Your Gateway to Global Travel</title>
  <meta name="description" content="Premium domestic &amp; international flight quotations, visa assistance, and B2B travel agency subscriptions in Bangladesh." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://safaria.vibing.world" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://safaria.vibing.world" />
  <meta property="og:title" content="SAFARIA Tours &amp; Travels | Your Gateway to Global Travel" />
  <meta property="og:description" content="Premium domestic &amp; international flight quotations, visa assistance, and B2B travel agency subscriptions in Bangladesh." />
  <meta property="og:image" content="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop" />
  <meta property="og:site_name" content="SAFARIA Tours &amp; Travels" />
  <meta property="og:locale" content="bn_BD" />
  <meta property="og:locale:alternate" content="en_US" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="SAFARIA Tours &amp; Travels | Your Gateway to Global Travel" />
  <meta name="twitter:description" content="Premium domestic &amp; international flight quotations, visa assistance, and B2B travel agency subscriptions in Bangladesh." />
  <meta name="twitter:image" content="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop" />

  <!-- Google Fonts: Hind Siliguri (Bengali) + Manrope & Inter (English) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            safaria: {
              emerald: '#064E3B',
              emeraldDark: '#041713',
              emeraldDeep: '#0A302D',
              emeraldLight: '#17584D',
              navy: '#10243A',
              navyDark: '#0A1726',
              gold: '#D6B779',
              goldLight: '#F4D38D',
              goldDark: '#CFB57C',
              ivory: '#F8F5EC',
              ivoryMuted: '#EFECE2',
              sand: '#DFD9C9'
            }
          },
          fontFamily: {
            bn: ['"Hind Siliguri"', 'sans-serif'],
            en: ['"Manrope"', 'sans-serif'],
            display: ['"Playfair Display"', 'serif']
          }
        }
      }
    }
  </script>

  <!-- React 18, ReactDOM & Babel -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Three.js for 3D Interactive Journey Atlas -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <!-- Structured Data: Schema.org TravelAgency -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "SAFARIA Tours & Travels",
    "url": "https://safaria.vibing.world",
    "logo": "https://safaria.vibing.world/images/logo-inverted.webp",
    "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop",
    "description": "Premium domestic & international flight quotations, visa assistance, and B2B travel agency subscriptions in Bangladesh.",
    "telephone": "+8801674178437",
    "email": "safariatoursandtravels@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dhaka",
      "addressCountry": "BD"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "22:00"
    },
    "priceRange": "$$"
  }
  </script>

  <style>
    /* Custom Scrollbar and UI Micro-Enhancements */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #041713;
    }
    ::-webkit-scrollbar-thumb {
      background: #17584D;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #D6B779;
    }
    .text-balance {
      text-wrap: balance;
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.08); }
    }
    .animate-pulse-glow {
      animation: pulseGlow 4s ease-in-out infinite;
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .animate-float-slow {
      animation: floatSlow 6s ease-in-out infinite;
    }
  </style>
</head>
<body class="bg-safaria-emeraldDark text-safaria-ivory font-bn antialiased selection:bg-safaria-gold selection:text-safaria-navyDark">
  <div id="safaria-root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo } = React;

    // =========================================================================
    // 1. DATA DICTIONARIES & LOCALIZATION STRINGS
    // =========================================================================

    const I18N = {
      bn: {
        nav: {
          atlas: "জার্নি অ্যাটলাস",
          services: "সেবা",
          destinations: "গন্তব্য",
          studio: "ট্রাভেল স্টুডিও",
          agency: "এজেন্সি",
          corporate: "কর্পোরেট",
          visa: "ভিসা তথ্য",
          requestQuote: "কোটেশন অনুরোধ করুন",
          adminConsole: "অ্যাডমিন প্যানেল"
        },
        hero: {
          eyebrow: "SAFARIA TOURS & TRAVELS — প্রিমিয়াম এভিয়েশন ও ট্রাভেল সমন্বয়",
          title: "সঠিক ফ্লাইটে শুরু হোক যাত্রা।",
          subtitle: "আপনার ভ্রমণের পরিকল্পনা জানান। আমাদের দল রুট ও বিকল্প যাচাই করে সর্বোত্তম কোটেশন দেবে।",
          ctaQuote: "কোটেশন অনুরোধ করুন",
          ctaExplore: "গন্তব্য ও সেবা দেখুন",
          atlasBadge: "ঢাকা থেকে আন্তর্জাতিক রুট",
          toggle3D: "3D গ্লোব দেখুন",
          toggleSvg: "স্ট্যাটিক মানচিত্র দেখুন",
          atlasHelp: "ঢাকা থেকে গন্তব্য বেছে রুটের কোটেশন চাইতে পারেন। রেখাগুলো সম্ভাব্য অনুসন্ধানের গন্তব্য দেখায়, নিশ্চিত ফ্লাইট নয়।"
        },
        servicesSection: {
          eyebrow: "SAFARIA SERVICES",
          title: "যাত্রার প্রতিটি পর্যায়ে আপনার পাশে",
          subtitle: "আন্তর্জাতিক মান ও নির্ভরযোগ্যতায় পরিকল্পিত ভ্রমণ সেবা। প্রতিটি সার্ভিস গ্রাহক ও কর্পোরেট চাহিদা অনুযায়ী বিশেষভাবে সমন্বিত।"
        },
        destinationsSection: {
          eyebrow: "EXPLORE DESTINATIONS",
          title: "আপনার পরের গন্তব্য নির্বাচন করুন",
          subtitle: "দেশীয় ও আন্তর্জাতিক সর্বাধিক জনপ্রিয় বিমানবন্দর ও শহরসমূহ। সরাসরি কোটেশন শুরু করতে যেকোনো গন্তব্যে ক্লিক করুন।",
          tabs: { all: "সকল গন্তব্য", domestic: "অভ্যন্তরীণ (বাংলাদেশ)", middleEast: "মধ্যপ্রাচ্য", asia: "এশিয়া প্যাসিফিক", europeAmericas: "ইউরোপ ও আমেরিকা" },
          searchPlaceholder: "শহর বা বিমানবন্দর কোড খুঁজুন (যেমন: CXB, DXB)...",
          enquiryBadge: "অনুসন্ধানযোগ্য রুট"
        },
        studioSection: {
          eyebrow: "TRAVEL STUDIO",
          title: "আপনার যাত্রা, আপনার মতো",
          subtitle: "স্বচ্ছ ও নিখুঁত ফ্লাইট কোটেশন ওয়ার্কফ্লো। আপনার প্রয়োজনীয়তা সাবমিট করুন—আমাদের রিজার্ভেশন ডেস্ক যাচাই করে দ্রুত রেসপন্স জানাবে।",
          disclaimer: "বিজ্ঞপ্তি: এটি ফ্লাইট অনুসন্ধান ও কোটেশন অনুরোধ। SAFARIA সরাসরি আসন ব্লক বা পেমেন্ট নেওয়ার পূর্বে এয়ারলাইন্সের সাথে রুট যাচাই সম্পন্ন করে।"
        },
        agencySection: {
          eyebrow: "B2B PARTNERSHIP",
          title: "এজেন্সির জন্য নতুন সম্ভাবনা",
          subtitle: "ট্রাভেল এজেন্সি এবং কর্পোরেট পার্টনারদের জন্য বিশেষায়িত B2B টিকিটিং সাবস্ক্রিপশন ও প্রিমিয়াম বুকিং সাপোর্ট।",
          monthly: "মাসিক সাবস্ক্রিপশন",
          annual: "বার্ষিক প্রিমিয়াম প্ল্যান",
          trialBanner: "৭২ ঘণ্টার এক্সক্লুসিভ ফ্রি ট্রায়াল উপলব্ধ",
          markupTitle: "০% SAFARIA মার্কআপ",
          markupDesc: "নির্ধারিত অফারে এয়ারলাইন্সের নেট ফেয়ারে শূন্য পার্সেন্ট অতিরিক্ত মার্কআপে টিকিট ইস্যু করার সুবিধা।",
          applyBtn: "B2B পার্টনারশিপ আবেদন করুন"
        },
        radarSection: {
          eyebrow: "AIRSPACE MONITORING",
          title: "লাইভ ফ্লাইট ট্র্যাকার হাব",
          subtitle: "বাস্তব সময় আকাশসীমা তথ্য ও ফ্লাইট স্ট্যাটাস ইন্টিগ্রেশন গেটওয়ে।"
        },
        vibeSection: {
          eyebrow: "ECOSYSTEM PARTNER",
          title: "ViBE Trippin' — লাইফস্টাইল ভ্রমণ অভিজ্ঞতা",
          subtitle: "Just Another Travel Group ইকোসিস্টেমের এক্সক্লুসিভ ভ্রমণ ও অ্যাডভেঞ্চার প্ল্যাটফর্ম।"
        },
        footer: {
          disclaimer: "SAFARIA ভ্রমণ সমন্বয় করে; চূড়ান্ত টিকিটিং এয়ারলাইন ও সাপ্লায়ারের নিয়মসাপেক্ষ।",
          copyright: "© ২০২৬ SAFARIA Tours & Travels. সর্বস্বত্ব সংরক্ষিত।",
          contactTitle: "যোগাযোগ ও রিজার্ভেশন ডেস্ক",
          techAttribution: "প্রযুক্তিগত সমাধান: NotRealEngine, LLC"
        }
      },
      en: {
        nav: {
          atlas: "Journey Atlas",
          services: "Services",
          destinations: "Destinations",
          studio: "Travel Studio",
          agency: "B2B Agency",
          corporate: "Corporate",
          visa: "Visa Desk",
          requestQuote: "Request Quotation",
          adminConsole: "Admin Console"
        },
        hero: {
          eyebrow: "SAFARIA TOURS & TRAVELS — PREMIUM AVIATION & TRAVEL COORDINATION",
          title: "Let Your Journey Begin with the Right Flight.",
          subtitle: "Share your travel requirements. Our reservations desk will analyze routes and inventory to provide your bespoke quotation.",
          ctaQuote: "Request Quotation",
          ctaExplore: "Explore Services",
          atlasBadge: "International Routes from Dhaka",
          toggle3D: "Launch 3D Globe",
          toggleSvg: "Show Static Atlas",
          atlasHelp: "Select any route from Dhaka to request a quotation. Lines illustrate search inquiry destinations, not real-time airline seat availability."
        },
        servicesSection: {
          eyebrow: "SAFARIA SERVICES",
          title: "Tailored Support at Every Stage",
          subtitle: "Curated with hospitality finesse and strict compliance. Every service is configured for individual, SME, and enterprise demands."
        },
        destinationsSection: {
          eyebrow: "EXPLORE DESTINATIONS",
          title: "Choose Your Next Destination",
          subtitle: "Popular domestic and intercontinental flight sectors. Select any destination to immediately pre-fill your quotation enquiry.",
          tabs: { all: "All Sectors", domestic: "Domestic (Bangladesh)", middleEast: "Middle East", asia: "Asia Pacific", europeAmericas: "Europe & Americas" },
          searchPlaceholder: "Search city or IATA airport code (e.g., DXB, CXB)...",
          enquiryBadge: "Enquiry Destination"
        },
        studioSection: {
          eyebrow: "TRAVEL STUDIO",
          title: "Your Journey, Your Way",
          subtitle: "A transparent and reliable quotation workflow. Submit your flight requirements—our ticketing team will verify schedules and deliver your proposal.",
          disclaimer: "Notice: This is a quotation request. SAFARIA confirms fare rules, taxes, and baggage allowances with airlines prior to ticketing."
        },
        agencySection: {
          eyebrow: "B2B PARTNERSHIP",
          title: "New Horizons for Travel Agencies",
          subtitle: "Dedicated B2B ticketing subscriptions and 24/7 GDS/LCC coordination for travel entrepreneurs and agencies across Bangladesh.",
          monthly: "Monthly Partnership",
          annual: "Annual Premium Partnership",
          trialBanner: "72-Hour Full Operational Trial Available",
          markupTitle: "0% SAFARIA Markup Offer",
          markupDesc: "Access eligible airline net inventories with zero additional agency markups under stated agreement terms.",
          applyBtn: "Apply for B2B Agency Partnership"
        },
        radarSection: {
          eyebrow: "AIRSPACE MONITORING",
          title: "Live Aircraft Tracker Hub",
          subtitle: "Real-time airspace telemetry and flight schedule status verification interface."
        },
        vibeSection: {
          eyebrow: "ECOSYSTEM PARTNER",
          title: "ViBE Trippin' — Experiential Tourism",
          subtitle: "The experiential hospitality and holiday wing of the Just Another Travel Group family."
        },
        footer: {
          disclaimer: "SAFARIA coordinates travel arrangements; final ticketing is subject to airline, supplier, and regulatory policies.",
          copyright: "© 2026 SAFARIA Tours & Travels. All rights reserved.",
          contactTitle: "Official Reservations & Coordination",
          techAttribution: "Technology Engineering: NotRealEngine, LLC"
        }
      }
    };

    // 8 Verified Hero Destinations from Original Export
    const ATLAS_DESTINATIONS = [
      { id: "RUH", nameBn: "রিয়াদ", nameEn: "Riyadh", code: "RUH", countryBn: "সৌদি আরব", countryEn: "Saudi Arabia", coords: [24.9576, 46.6988], svgX: 224, svgY: 250 },
      { id: "JED", nameBn: "জেদ্দা", nameEn: "Jeddah", code: "JED", countryBn: "সৌদি আরব", countryEn: "Saudi Arabia", coords: [21.6796, 39.1565], svgX: 258, svgY: 280 },
      { id: "CXB", nameBn: "কক্সবাজার", nameEn: "Cox's Bazar", code: "CXB", countryBn: "বাংলাদেশ", countryEn: "Bangladesh", coords: [21.4522, 91.9639], svgX: 406, svgY: 355 },
      { id: "KUL", nameBn: "কুয়ালালামপুর", nameEn: "Kuala Lumpur", code: "KUL", countryBn: "মালয়েশিয়া", countryEn: "Malaysia", coords: [2.7456, 101.7072], svgX: 477, svgY: 388 },
      { id: "SIN", nameBn: "সিঙ্গাপুর", nameEn: "Singapore", code: "SIN", countryBn: "সিঙ্গাপুর", countryEn: "Singapore", coords: [1.3644, 103.9915], svgX: 503, svgY: 415 },
      { id: "DXB", nameBn: "দুবাই", nameEn: "Dubai", code: "DXB", countryBn: "সংযুক্ত আরব আমিরাত", countryEn: "UAE", coords: [25.2532, 55.3657], svgX: 300, svgY: 275 },
      { id: "CAN", nameBn: "গুয়াংজু", nameEn: "Guangzhou", code: "CAN", countryBn: "চীন", countryEn: "China", coords: [23.3924, 113.2988], svgX: 504, svgY: 289 },
      { id: "LON", nameBn: "লন্ডন", nameEn: "London", code: "LON", countryBn: "যুক্তরাজ্য", countryEn: "UK", coords: [51.4700, -0.4543], svgX: 179, svgY: 218 }
    ];

    // Domestic & International Directory
    const ALL_DESTINATIONS = [
      // Domestic
      { code: "DAC", nameBn: "ঢাকা", nameEn: "Dhaka", airportBn: "হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর", airportEn: "Hazrat Shahjalal Intl Airport", region: "domestic" },
      { code: "CGP", nameBn: "চট্টগ্রাম", nameEn: "Chattogram", airportBn: "শাহ আমানত আন্তর্জাতিক বিমানবন্দর", airportEn: "Shah Amanat Intl Airport", region: "domestic" },
      { code: "CXB", nameBn: "কক্সবাজার", nameEn: "Cox's Bazar", airportBn: "কক্সবাজার বিমানবন্দর", airportEn: "Cox's Bazar Airport", region: "domestic" },
      { code: "ZYL", nameBn: "সিলেট", nameEn: "Sylhet", airportBn: "ওসমানী আন্তর্জাতিক বিমানবন্দর", airportEn: "Osmani Intl Airport", region: "domestic" },
      { code: "SPD", nameBn: "সৈয়দপুর", nameEn: "Saidpur", airportBn: "সৈয়দপুর বিমানবন্দর", airportEn: "Saidpur Airport", region: "domestic" },
      { code: "RJH", nameBn: "রাজশাহী", nameEn: "Rajshahi", airportBn: "শাহ মখদুম বিমানবন্দর", airportEn: "Shah Makhdum Airport", region: "domestic" },
      { code: "JSR", nameBn: "যশোর", nameEn: "Jashore", airportBn: "যশোর বিমানবন্দর", airportEn: "Jashore Airport", region: "domestic" },
      { code: "BZL", nameBn: "বরিশাল", nameEn: "Barishal", airportBn: "বরিশাল বিমানবন্দর", airportEn: "Barishal Airport", region: "domestic" },
      // Middle East
      { code: "DXB", nameBn: "দুবাই", nameEn: "Dubai", airportBn: "দুবাই আন্তর্জাতিক বিমানবন্দর", airportEn: "Dubai Intl Airport", region: "middleEast" },
      { code: "AUH", nameBn: "আবুধাবি", nameEn: "Abu Dhabi", airportBn: "আবুধাবি জায়েদ আন্তর্জাতিক বিমানবন্দর", airportEn: "Zayed Intl Airport", region: "middleEast" },
      { code: "DOH", nameBn: "দোহা", nameEn: "Doha", airportBn: "হামাদ আন্তর্জাতিক বিমানবন্দর", airportEn: "Hamad Intl Airport", region: "middleEast" },
      { code: "JED", nameBn: "জেদ্দা", nameEn: "Jeddah", airportBn: "কিং আব্দুলআজিজ আন্তর্জাতিক বিমানবন্দর", airportEn: "King Abdulaziz Intl Airport", region: "middleEast" },
      { code: "RUH", nameBn: "রিয়াদ", nameEn: "Riyadh", airportBn: "কিং খালিদ আন্তর্জাতিক বিমানবন্দর", airportEn: "King Khalid Intl Airport", region: "middleEast" },
      { code: "MED", nameBn: "মদিনা", nameEn: "Madinah", airportBn: "প্রিন্স মোহাম্মদ বিন আব্দুলআজিজ বিমানবন্দর", airportEn: "Prince Mohammad Airport", region: "middleEast" },
      { code: "DMM", nameBn: "দাম্মাম", nameEn: "Dammam", airportBn: "কিং ফাহদ আন্তর্জাতিক বিমানবন্দর", airportEn: "King Fahd Intl Airport", region: "middleEast" },
      { code: "MCT", nameBn: "মাস্কাট", nameEn: "Muscat", airportBn: "মাস্কাট আন্তর্জাতিক বিমানবন্দর", airportEn: "Muscat Intl Airport", region: "middleEast" },
      // Asia Pacific
      { code: "BKK", nameBn: "ব্যাংকক", nameEn: "Bangkok", airportBn: "সুvarnabhumi আন্তর্জাতিক বিমানবন্দর", airportEn: "Suvarnabhumi Airport", region: "asia" },
      { code: "KUL", nameBn: "কুয়ালালামপুর", nameEn: "Kuala Lumpur", airportBn: "কেএলআইএ বিমানবন্দর", airportEn: "KLIA Intl Airport", region: "asia" },
      { code: "SIN", nameBn: "সিঙ্গাপুর", nameEn: "Singapore", airportBn: "চাঙ্গি আন্তর্জাতিক বিমানবন্দর", airportEn: "Singapore Changi Airport", region: "asia" },
      { code: "MAA", nameBn: "চেন্নাই", nameEn: "Chennai", airportBn: "চেন্নাই আন্তর্জাতিক বিমানবন্দর", airportEn: "Chennai Intl Airport", region: "asia" },
      { code: "KTM", nameBn: "কাঠমান্ডু", nameEn: "Kathmandu", airportBn: "ত্রিভুবন আন্তর্জাতিক বিমানবন্দর", airportEn: "Tribhuvan Intl Airport", region: "asia" },
      { code: "CAN", nameBn: "গুয়াংজু", nameEn: "Guangzhou", airportBn: "বাইয়ুন আন্তর্জাতিক বিমানবন্দর", airportEn: "Baiyun Intl Airport", region: "asia" },
      { code: "PEK", nameBn: "বেইজিং", nameEn: "Beijing", airportBn: "ক্যাপিটাল আন্তর্জাতিক বিমানবন্দর", airportEn: "Beijing Capital Airport", region: "asia" },
      { code: "HND", nameBn: "টোকিও", nameEn: "Tokyo", airportBn: "হানেদা ও নারিতা বিমানবন্দর", airportEn: "Haneda / Narita Airport", region: "asia" },
      { code: "ICN", nameBn: "সিউল", nameEn: "Seoul", airportBn: "ইনছন আন্তর্জাতিক বিমানবন্দর", airportEn: "Incheon Intl Airport", region: "asia" },
      { code: "SYD", nameBn: "সিডনি", nameEn: "Sydney", airportBn: "কিংসফোর্ড স্মিথ বিমানবন্দর", airportEn: "Kingsford Smith Airport", region: "asia" },
      // Europe & Americas
      { code: "LHR", nameBn: "লন্ডন (হিথ্রো)", nameEn: "London (Heathrow)", airportBn: "হিথ্রো আন্তর্জাতিক বিমানবন্দর", airportEn: "London Heathrow Airport", region: "europeAmericas" },
      { code: "FCO", nameBn: "রোম", nameEn: "Rome", airportBn: "ফিউমিচিনো বিমানবন্দর", airportEn: "Leonardo da Vinci–Fiumicino", region: "europeAmericas" },
      { code: "IST", nameBn: "ইস্তাম্বুল", nameEn: "Istanbul", airportBn: "ইস্তাম্বুল এয়ারপোর্ট", airportEn: "Istanbul Airport", region: "europeAmericas" },
      { code: "JFK", nameBn: "নিউ ইয়র্ক", nameEn: "New York", airportBn: "জেএফকে / নিউয়ার্ক বিমানবন্দর", airportEn: "JFK & EWR Airports", region: "europeAmericas" },
      { code: "YYZ", nameBn: "টরন্টো", nameEn: "Toronto", airportBn: "পিয়ারসন আন্তর্জাতিক বিমানবন্দর", airportEn: "Toronto Pearson Airport", region: "europeAmericas" },
      { code: "MIA", nameBn: "ফ্লোরিডা / মায়ামি", nameEn: "Florida (Miami)", airportBn: "মায়ামি আন্তর্জাতিক বিমানবন্দর", airportEn: "Miami Intl Airport", region: "europeAmericas" },
      { code: "CPT", nameBn: "কেপ টাউন", nameEn: "Cape Town", airportBn: "কেপ টাউন আন্তর্জাতিক বিমানবন্দর", airportEn: "Cape Town Intl Airport", region: "europeAmericas" }
    ];

    // Core Services
    const SERVICES_DATA = [
      {
        id: "domestic",
        titleBn: "অভ্যন্তরীণ বিমান টিকিটিং",
        titleEn: "Domestic Air Ticketing",
        descBn: "বিমান বাংলাদেশ, ইউএস-বাংলা, এয়ার অ্যাস্ট্রা সহ বাংলাদেশের সকল অভ্যন্তরীণ রুটের নির্ভরযোগ্য টিকিটিং।",
        descEn: "Seamless booking across all domestic carriers in Bangladesh including Biman, US-Bangla, and Air Astra.",
        icon: "✈️"
      },
      {
        id: "international",
        titleBn: "আন্তর্জাতিক বিমান টিকিটিং",
        titleEn: "International Air Ticketing",
        descBn: "মধ্যপ্রাচ্য, এশিয়া, ইউরোপ ও উত্তর আমেরিকার জন্য সুনির্দিষ্ট রুট অ্যানালাইসিস ও প্রতিযোগিতামূলক কোটেশন।",
        descEn: "Expert multi-carrier route planning, baggage allowance verification, and transparent quotations.",
        icon: "🌐"
      },
      {
        id: "group",
        titleBn: "গ্রুপ ফ্লাইট সমন্বয়",
        titleEn: "Group Flight Arrangements",
        descBn: "১০ বা ততোধিক যাত্রীর ওমরাহ কাফেলা, পরিবার ও কনফারেন্স ট্রাভেলের জন্য সমন্বিত বিশেষ গ্রুপ বুকিং।",
        descEn: "Tailored group block allocations for Umrah delegations, large families, and international summits.",
        icon: "👥"
      },
      {
        id: "corporate",
        titleBn: "কর্পোরেট ফ্লাইট ব্যবস্থাপনা",
        titleEn: "Corporate Travel Management",
        descBn: "ব্যবসায়িক প্রতিষ্ঠান ও এক্সিকিউটিভদের জন্য অগ্রাধিকার বুকিং, ইনভয়েসিং ও ফ্লেক্সিবল টিকিট ম্যানেজমেন্ট।",
        descEn: "Centralized ticketing, recurring employee rosters, monthly invoice reconciliations, and flexible changes.",
        icon: "💼"
      },
      {
        id: "visa",
        titleBn: "ভিসা ও ডকুমেন্টেশন সহায়তা",
        titleEn: "Visa & Documentation Assistance",
        descBn: "দুবাই, থাইল্যান্ড, মালয়েশিয়া, চীন, সৌদি আরবসহ প্রধান গন্তব্যের প্রফেশনাল ভিসা ফাইল প্রসেসিং।",
        descEn: "Meticulous documentation review, appointment coordination, and guidance. (Final decision rests with embassies).",
        icon: "📄"
      },
      {
        id: "hotels",
        titleBn: "হোটেল ও অ্যাকোমোডেশন বুকিং",
        titleEn: "Hotel Booking Assistance",
        descBn: "মক্কা, মদিনা, দুবাই, ব্যাংকক ও বিশ্বের শীর্ষ পর্যটন শহরে যাচাইকৃত প্রিমিয়াম হোটেল ও রিসোর্ট রিজার্ভেশন।",
        descEn: "Verified hospitality bookings in Makkah, Madinah, Dubai, Bangkok, and global metropolitan centers.",
        icon: "🏨"
      },
      {
        id: "tours",
        titleBn: "ট্যুর ও হলিডে প্যাকেজ",
        titleEn: "Bespoke Tour & Holiday Packages",
        descBn: "পারিবারিক ছুটি ও কর্পোরেট রিট্রিটের জন্য ব্যক্তিগতকৃত আন্তর্জাতিক ও দেশীয় পর্যটন সমন্বয়।",
        descEn: "Curated itineraries crafted with local destination guides and comfortable transit arrangements.",
        icon: "🌴"
      },
      {
        id: "b2b",
        titleBn: "B2B এজেন্সি টিকেটিং সাপোর্ট",
        titleEn: "B2B Agency Ticketing Support",
        descBn: "সাবস্ক্রিপশন মডেলে নন-আইয়াটা ট্রাভেল এজেন্সি ও উদ্যোক্তাদের জন্য ০% মার্কআপ ব্যাকঅফিস ইস্যুয়েন্স সুবিধা।",
        descEn: "Dedicated 24/7 GDS and LCC ticketing desk with 0% SAFARIA markup under approved partner plans.",
        icon: "🤝"
      }
    ];

    // =========================================================================
    // 2. MAIN APP CONTAINER
    // =========================================================================

    function SafariaApp() {
      const [lang, setLang] = useState('bn'); // 'bn' | 'en'
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [threeDActive, setThreeDActive] = useState(false);
      const [selectedAtlasDest, setSelectedAtlasDest] = useState(null);
      const [activeModal, setActiveModal] = useState(null); // 'quote' | 'b2b' | 'corporate' | 'visa' | 'admin'
      const [enquirySuccess, setEnquirySuccess] = useState(null);

      // In-Memory Enquiry Store (simulating DB persistence + local storage fallback)
      const [enquiries, setEnquiries] = useState(() => {
        try {
          const cached = localStorage.getItem('safaria_enquiries_v2');
          return cached ? JSON.parse(cached) : [
            {
              id: 'SFR-20261108-8841',
              type: 'FLIGHT',
              name: 'Dr. Rafiqul Islam',
              contact: '+8801711223344',
              origin: 'DAC',
              dest: 'LHR',
              dates: '2026-11-20 / 2026-12-05',
              pax: '2 Adults, 1 Child',
              status: 'NEW',
              timestamp: '2026-11-08 14:20'
            },
            {
              id: 'SFR-20261108-3920',
              type: 'AGENCY_B2B',
              name: 'Skyline Travels Ltd',
              contact: '+8801819001122',
              origin: 'Chittagong',
              dest: 'Annual Plan ৳130,000',
              dates: '72-Hr Trial Active',
              pax: 'Trade Lic: 4920/2024',
              status: 'IN_REVIEW',
              timestamp: '2026-11-08 11:45'
            }
          ];
        } catch (e) {
          return [];
        }
      });

      const t = I18N[lang];

      // Form State for Travel Studio
      const [tripType, setTripType] = useState('ROUND_TRIP');
      const [origin, setOrigin] = useState('DAC');
      const [destination, setDestination] = useState('');
      const [deptDate, setDeptDate] = useState('2026-11-15');
      const [returnDate, setReturnDate] = useState('2026-11-25');
      const [paxAdults, setPaxAdults] = useState(1);
      const [paxChildren, setPaxChildren] = useState(0);
      const [paxInfants, setPaxInfants] = useState(0);
      const [cabinClass, setCabinClass] = useState('ECONOMY');
      const [paxName, setPaxName] = useState('');
      const [paxEmail, setPaxEmail] = useState('');
      const [paxPhone, setPaxPhone] = useState('+880');
      const [formNotes, setFormNotes] = useState('');
      const [formError, setFormError] = useState('');

      // When selecting a destination from Atlas or Grid, pre-populate and scroll to Travel Studio
      const handleSelectDestination = (destCode) => {
        setDestination(destCode);
        const studioEl = document.getElementById('sf-travel-form');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth' });
        }
      };

      // Handle Flight Enquiry Submission
      const handleFlightSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!origin || !destination) {
          setFormError(lang === 'bn' ? 'অনুগ্রহ করে প্রস্থান ও গন্তব্য বিমানবন্দর উভয়ই নির্বাচন করুন।' : 'Please select both origin and destination airports.');
          return;
        }
        if (origin === destination) {
          setFormError(lang === 'bn' ? 'প্রস্থান এবং গন্তব্য একই বিমানবন্দর হতে পারে না।' : 'Origin and Destination airports cannot be the same.');
          return;
        }
        if (!paxName.trim() || !paxPhone.trim()) {
          setFormError(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম এবং মোবাইল / হোয়াটসঅ্যাপ নম্বর প্রদান করুন।' : 'Please enter your full name and phone/WhatsApp number.');
          return;
        }
        if (tripType === 'ROUND_TRIP' && returnDate && new Date(returnDate) < new Date(deptDate)) {
          setFormError(lang === 'bn' ? 'প্রত্যাবর্তনের তারিখ যাত্রার তারিখের পূর্বে হতে পারে না।' : 'Return date cannot be earlier than departure date.');
          return;
        }

        const refNo = `SFR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newRecord = {
          id: refNo,
          type: 'FLIGHT',
          name: paxName,
          contact: paxPhone,
          origin,
          dest: destination,
          dates: tripType === 'ROUND_TRIP' ? `${deptDate} to ${returnDate}` : deptDate,
          pax: `${paxAdults} Adult(s)${paxChildren ? `, ${paxChildren} Child` : ''}${paxInfants ? `, ${paxInfants} Infant` : ''} [${cabinClass}]`,
          status: 'NEW',
          timestamp: new Date().toLocaleString()
        };

        const updated = [newRecord, ...enquiries];
        setEnquiries(updated);
        try {
          localStorage.setItem('safaria_enquiries_v2', JSON.stringify(updated));
        } catch (e) {}

        setEnquirySuccess({
          ref: refNo,
          name: paxName,
          origin,
          dest: destination,
          phone: paxPhone,
          dates: newRecord.dates
        });
      };

      // WhatsApp structured handoff
      const triggerWhatsAppHandoff = (record) => {
        const text = encodeURIComponent(
          `*SAFARIA Flight Quotation Request*\n` +
          `Ref: ${record.ref}\n` +
          `Name: ${record.name}\n` +
          `Phone: ${record.phone}\n` +
          `Route: ${record.origin} → ${record.dest}\n` +
          `Dates: ${record.dates}\n` +
          `Notice: Please review available routes and share airline quotation.`
        );
        window.open(`https://wa.me/8801674178437?text=${text}`, '_blank');
      };

      return (
        <div className="min-h-screen flex flex-col font-bn bg-safaria-emeraldDark text-safaria-ivory">
          {/* HEADER / NAVIGATION */}
          <header className="sticky top-0 z-50 bg-safaria-navyDark/90 backdrop-blur-md border-b border-safaria-goldDark/20 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              {/* Brand Logo */}
              <a href="#sf-home" className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full border border-safaria-gold/40 flex items-center justify-center bg-safaria-emeraldDark/80 p-2 shadow-lg group-hover:border-safaria-gold transition">
                  {/* Stylized Compass Mark */}
                  <svg viewBox="0 0 48 48" className="w-8 h-8 text-safaria-gold">
                    <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                    <polygon points="24,6 28,21 42,24 28,27 24,42 20,27 6,24 20,21" fill="currentColor" fillOpacity="0.9" />
                    <circle cx="24" cy="24" r="3" fill="#041713" />
                  </svg>
                </div>
                <div>
                  <span className="font-display tracking-widest text-2xl font-bold text-safaria-ivory block leading-none">
                    SAFARIA
                  </span>
                  <span className="font-en text-[10px] tracking-[0.28em] text-safaria-gold block mt-0.5 font-semibold">
                    TOURS &amp; TRAVELS
                  </span>
                </div>
              </a>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-7 text-sm font-medium tracking-wide">
                <a href="#sf-atlas" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.atlas}</a>
                <a href="#sf26-offers" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.services}</a>
                <a href="#sf-destinations" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.destinations}</a>
                <a href="#sf-travel-form" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.studio}</a>
                <a href="#sf-agency" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.agency}</a>
                <a href="#sf-corporate" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.corporate}</a>
                <a href="#sf-visa" className="text-safaria-ivory/80 hover:text-safaria-gold transition">{t.nav.visa}</a>
              </nav>

              {/* Action Buttons & Language Switcher */}
              <div className="hidden md:flex items-center gap-4">
                {/* Language Switch */}
                <div className="flex items-center bg-safaria-emeraldDeep/80 rounded-full p-1 border border-safaria-gold/30 text-xs font-en">
                  <button
                    onClick={() => setLang('bn')}
                    className={`px-3 py-1 rounded-full transition ${lang === 'bn' ? 'bg-safaria-gold text-safaria-navyDark font-bold' : 'text-safaria-ivory/70 hover:text-safaria-ivory'}`}
                  >
                    বাংলা
                  </button>
                  <span className="text-safaria-gold/40 px-1">/</span>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded-full transition ${lang === 'en' ? 'bg-safaria-gold text-safaria-navyDark font-bold' : 'text-safaria-ivory/70 hover:text-safaria-ivory'}`}
                  >
                    EN
                  </button>
                </div>

                {/* Primary CTA */}
                <a
                  href="#sf-travel-form"
                  className="bg-gradient-to-r from-safaria-goldDark to-safaria-gold text-safaria-navyDark font-semibold text-xs tracking-wider uppercase px-5 py-2.5 rounded-full shadow hover:shadow-safaria-gold/20 hover:brightness-110 transition flex items-center gap-2"
                >
                  <span>{t.nav.requestQuote}</span>
                  <span>&rarr;</span>
                </a>

                {/* Admin Toggle */}
                <button
                  onClick={() => setActiveModal('admin')}
                  className="text-safaria-gold/60 hover:text-safaria-gold p-2 border border-safaria-gold/20 rounded-full transition"
                  title="Enquiry Management Desk"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </button>
              </div>

              {/* Mobile Hamburger Toggle */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                  className="text-xs px-2.5 py-1 bg-safaria-emeraldDeep border border-safaria-gold/40 rounded-full text-safaria-gold font-en font-bold mr-1"
                >
                  {lang === 'bn' ? 'EN' : 'বাংলা'}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg bg-safaria-emeraldDeep border border-safaria-gold/30 text-safaria-gold"
                  aria-label="Toggle Navigation Menu"
                >
                  <span className="text-xl leading-none">{mobileMenuOpen ? '✕' : '☰'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
              <div className="lg:hidden bg-safaria-navyDark/98 border-b border-safaria-gold/20 px-6 py-6 space-y-4">
                <nav className="flex flex-col space-y-3 text-base">
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf-atlas" className="hover:text-safaria-gold py-1">{t.nav.atlas}</a>
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf26-offers" className="hover:text-safaria-gold py-1">{t.nav.services}</a>
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf-destinations" className="hover:text-safaria-gold py-1">{t.nav.destinations}</a>
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf-travel-form" className="hover:text-safaria-gold py-1">{t.nav.studio}</a>
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf-agency" className="hover:text-safaria-gold py-1">{t.nav.agency}</a>
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf-corporate" className="hover:text-safaria-gold py-1">{t.nav.corporate}</a>
                  <a onClick={() => setMobileMenuOpen(false)} href="#sf-visa" className="hover:text-safaria-gold py-1">{t.nav.visa}</a>
                  <button onClick={() => { setMobileMenuOpen(false); setActiveModal('admin'); }} className="text-left text-safaria-gold py-1 font-semibold flex items-center gap-2">
                    <span>🔒</span> {t.nav.adminConsole}
                  </button>
                </nav>
                <div className="pt-4 border-t border-safaria-gold/20">
                  <a
                    onClick={() => setMobileMenuOpen(false)}
                    href="#sf-travel-form"
                    className="block text-center w-full py-3 bg-safaria-gold text-safaria-navyDark font-bold rounded-xl"
                  >
                    {t.nav.requestQuote}
                  </a>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1">
            {/* HERO SECTION WITH JOURNEY ATLAS */}
            <section id="sf-home" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden border-b border-safaria-gold/10">
              {/* Atmospheric Background Skyline & Gradient Lighting */}
              <div className="absolute inset-0 -z-10 opacity-25 mix-blend-luminosity bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop')" }}></div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-safaria-navyDark/90 via-safaria-emeraldDark/95 to-safaria-emeraldDark"></div>
              
              {/* Radial Glow */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-safaria-emeraldLight/20 blur-[130px] rounded-full pointer-events-none"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                  
                  {/* Left Column: Authentic Brand Copy */}
                  <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-safaria-emeraldDeep/80 border border-safaria-gold/30 text-safaria-gold text-xs font-semibold tracking-wider uppercase font-en">
                      <span className="w-2 h-2 rounded-full bg-safaria-gold animate-ping"></span>
                      {t.hero.eyebrow}
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-safaria-ivory leading-[1.15]">
                      {t.hero.title}
                    </h1>

                    <p className="text-base sm:text-lg text-safaria-ivory/80 font-normal leading-relaxed text-balance max-w-xl mx-auto lg:mx-0">
                      {t.hero.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                      <a
                        href="#sf-travel-form"
                        className="w-full sm:w-auto px-8 py-3.5 bg-safaria-gold hover:bg-safaria-goldLight text-safaria-navyDark font-bold rounded-full shadow-lg shadow-safaria-gold/20 transition flex items-center justify-center gap-2 group"
                      >
                        <span>{t.hero.ctaQuote}</span>
                        <span className="group-hover:translate-x-1 transition">&rarr;</span>
                      </a>
                      <a
                        href="#sf26-offers"
                        className="w-full sm:w-auto px-7 py-3.5 bg-safaria-emeraldDeep/60 hover:bg-safaria-emeraldDeep border border-safaria-gold/40 text-safaria-ivory font-medium rounded-full transition flex items-center justify-center"
                      >
                        {t.hero.ctaExplore}
                      </a>
                    </div>

                    {/* Operational Highlights */}
                    <div className="pt-6 border-t border-safaria-gold/15 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-safaria-gold font-en font-bold text-xl">33+</div>
                        <div className="text-xs text-safaria-ivory/60 mt-0.5">{lang === 'bn' ? 'গ্লোবাল রুট' : 'Global Hubs'}</div>
                      </div>
                      <div>
                        <div className="text-safaria-gold font-en font-bold text-xl">100%</div>
                        <div className="text-xs text-safaria-ivory/60 mt-0.5">{lang === 'bn' ? 'যাচাইকৃত কোটেশন' : 'Verified Quotes'}</div>
                      </div>
                      <div>
                        <div className="text-safaria-gold font-en font-bold text-xl">24/7</div>
                        <div className="text-xs text-safaria-ivory/60 mt-0.5">{lang === 'bn' ? 'রিজার্ভেশন ডেস্ক' : 'Human Desk'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Reconstructed Journey Atlas (SVG Baseline + 3D Toggle) */}
                  <div className="lg:col-span-7 flex flex-col items-center">
                    <div className="w-full max-w-[580px] bg-safaria-emeraldDark/80 p-6 rounded-3xl border border-safaria-gold/30 shadow-2xl relative">
                      
                      {/* Top Bar with Mode Switcher */}
                      <div className="flex items-center justify-between pb-4 border-b border-safaria-gold/20 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                          <span className="text-xs font-semibold tracking-wider uppercase text-safaria-gold">{t.hero.atlasBadge}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setThreeDActive(!threeDActive)}
                          className="px-3.5 py-1 text-xs rounded-full border border-safaria-gold/50 bg-safaria-navy/70 hover:bg-safaria-gold hover:text-safaria-navyDark text-safaria-gold font-semibold transition"
                        >
                          {threeDActive ? t.hero.toggleSvg : t.hero.toggle3D}
                        </button>
                      </div>

                      {/* Visual Container */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden flex items-center justify-center bg-[#041713]">
                        {threeDActive ? (
                          <ThreeGlobeCanvas selectedDest={selectedAtlasDest} onSelectDest={handleSelectDestination} />
                        ) : (
                          /* Authentic Baseline SVG Reconstruction from HTML */
                          <div className="relative w-full h-full flex items-center justify-center">
                            <svg className="w-full h-full max-w-[480px] select-none" viewBox="0 0 640 640" role="img" aria-label="Routes from Dhaka across the globe">
                              <defs>
                                <radialGradient id="planet-fill" cx="35%" cy="30%">
                                  <stop stopColor="#17584d" />
                                  <stop offset=".55" stopColor="#0a302d" />
                                  <stop offset="1" stopColor="#041713" />
                                </radialGradient>
                                <radialGradient id="planet-light">
                                  <stop stopColor="#f4d38d" stopOpacity=".9" />
                                  <stop offset="1" stopColor="#cfb57c" stopOpacity="0" />
                                </radialGradient>
                                <clipPath id="planet-clip">
                                  <circle cx="320" cy="320" r="249" />
                                </clipPath>
                              </defs>

                              {/* Outer Boundary Ring */}
                              <circle cx="320" cy="320" r="255" fill="none" stroke="#b9d6c3" strokeOpacity=".34" strokeWidth="2" />
                              <circle cx="320" cy="320" r="249" fill="url(#planet-fill)" />

                              {/* Globe Meridians & Graticules */}
                              <g clipPath="url(#planet-clip)" fill="none" stroke="#a8c8aa" strokeOpacity=".18">
                                <ellipse cx="320" cy="320" rx="94" ry="249" />
                                <ellipse cx="320" cy="320" rx="184" ry="249" />
                                <path d="M70 320h500M94 220h452M94 420h452M145 145h350M145 495h350" />
                                <path d="M215 245q25-37 69-29l29 16 28-14 37 12-2 24 33 12-17 28-32 8-13 27-39-12-16 18-31-16-11-39-32-15zM398 324l21-19 27 4 14 25-18 22-25-2zM169 344l22-13 30 17 6 39-25 24-26-13z" fill="#376b54" fillOpacity=".28" stroke="none" />
                              </g>

                              {/* Flight Arcs Originating from Dhaka (402, 339) */}
                              <g fill="none" stroke="#cfb57c" strokeWidth="2" strokeOpacity=".85">
                                <path d="M402 339Q348 227 224 250" className="hover:stroke-white transition cursor-pointer" />
                                <path d="M402 339Q336 256 258 280" />
                                <path d="M402 339Q381 298 406 355" />
                                <path d="M402 339Q430 292 477 388" />
                                <path d="M402 339Q436 309 503 415" />
                                <path d="M402 339Q376 252 300 275" />
                                <path d="M402 339Q452 245 504 289" />
                                <path d="M402 339Q308 160 179 218" />
                              </g>

                              {/* Dhaka Glow & Hub Marker */}
                              <circle cx="402" cy="339" r="37" fill="url(#planet-light)" className="animate-pulse" />
                              <g fill="#f1cf8e">
                                <circle cx="402" cy="339" r="7" className="cursor-pointer" />
                                <circle cx="224" cy="250" r="4" />
                                <circle cx="258" cy="280" r="4" />
                                <circle cx="406" cy="355" r="4" />
                                <circle cx="477" cy="388" r="4" />
                                <circle cx="503" cy="415" r="4" />
                                <circle cx="300" cy="275" r="4" />
                                <circle cx="504" cy="289" r="4" />
                                <circle cx="179" cy="218" r="4" />
                              </g>
                              <text x="415" y="335" fill="#f3f0e7" fontSize="16" fontFamily="sans-serif" fontWeight="bold">DAC</text>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 8 Destination Quick Buttons */}
                      <div className="mt-5 space-y-2">
                        <div className="text-xs text-safaria-ivory/60 font-semibold uppercase tracking-wider">
                          {lang === 'bn' ? 'গন্তব্য নির্বাচন করুন (ক্লিক করে কোটেশন শুরু করুন):' : 'Select Destination to Request Quotation:'}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {ATLAS_DESTINATIONS.map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setSelectedAtlasDest(d);
                                handleSelectDestination(d.code);
                              }}
                              className={`py-2 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                                selectedAtlasDest?.code === d.code
                                  ? 'bg-safaria-gold text-safaria-navyDark border-safaria-gold font-bold shadow-md'
                                  : 'bg-safaria-emeraldDeep/50 border-safaria-gold/30 hover:border-safaria-gold text-safaria-ivory hover:bg-safaria-emeraldDeep'
                              }`}
                            >
                              <span className="text-xs font-medium leading-tight">{lang === 'bn' ? d.nameBn : d.nameEn}</span>
                              <span className="text-[10px] font-en tracking-wider font-bold opacity-80">{d.code}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-safaria-ivory/50 italic text-center pt-2">
                          {t.hero.atlasHelp}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 2: SERVICES (#sf26-offers) - FULLY RECONSTRUCTED */}
            <section id="sf26-offers" className="py-20 bg-safaria-navyDark/60 border-b border-safaria-gold/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                  <span className="text-xs font-semibold text-safaria-gold tracking-widest uppercase font-en">{t.servicesSection.eyebrow}</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-safaria-ivory">{t.servicesSection.title}</h2>
                  <p className="text-sm sm:text-base text-safaria-ivory/70">{t.servicesSection.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {SERVICES_DATA.map((srv) => (
                    <div
                      key={srv.id}
                      className="group bg-safaria-emeraldDark/70 hover:bg-safaria-emeraldDeep border border-safaria-gold/20 hover:border-safaria-gold/60 p-6 rounded-2xl transition duration-300 flex flex-col justify-between shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-safaria-navyDark border border-safaria-gold/30 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                          {srv.icon}
                        </div>
                        <h3 className="text-lg font-bold text-safaria-ivory group-hover:text-safaria-gold transition">
                          {lang === 'bn' ? srv.titleBn : srv.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm text-safaria-ivory/70 leading-relaxed">
                          {lang === 'bn' ? srv.descBn : srv.descEn}
                        </p>
                      </div>

                      <div className="pt-6 mt-4 border-t border-safaria-gold/10">
                        <a
                          href="#sf-travel-form"
                          className="text-xs font-bold text-safaria-gold flex items-center gap-1.5 group-hover:underline"
                        >
                          <span>{lang === 'bn' ? 'কোটেশন জানুন' : 'Request Detail'}</span>
                          <span>&rarr;</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3: DESTINATIONS DIRECTORY (#sf-destinations) */}
            <DestinationDirectorySection
              lang={lang}
              t={t}
              destinations={ALL_DESTINATIONS}
              onSelect={handleSelectDestination}
            />

            {/* SECTION 4: TRAVEL STUDIO / FLIGHT QUOTATION WORKFLOW (#sf-travel-form) */}
            <section id="sf-travel-form" className="py-24 bg-gradient-to-b from-safaria-emeraldDark to-safaria-navyDark border-b border-safaria-gold/15 relative">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center space-y-3 mb-10">
                  <span className="text-xs font-semibold text-safaria-gold tracking-widest uppercase font-en">{t.studioSection.eyebrow}</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-safaria-ivory">{t.studioSection.title}</h2>
                  <p className="text-sm sm:text-base text-safaria-ivory/75 max-w-2xl mx-auto">{t.studioSection.subtitle}</p>
                </div>

                {/* Form Card */}
                <div className="bg-safaria-navyDark/90 backdrop-blur-md border border-safaria-gold/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
                  
                  {enquirySuccess ? (
                    <div className="text-center py-10 space-y-6">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 rounded-full flex items-center justify-center mx-auto text-3xl">
                        ✓
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-safaria-ivory">
                          {lang === 'bn' ? 'কোটেশন অনুরোধ সফলভাবে গৃহীত হয়েছে!' : 'Quotation Request Received!'}
                        </h3>
                        <p className="text-sm text-safaria-ivory/70">
                          {lang === 'bn' ? 'আপনার ইউনিক রেফারেন্স নম্বর:' : 'Your Unique Reference Code:'}{' '}
                          <span className="text-safaria-gold font-mono font-bold text-base">{enquirySuccess.ref}</span>
                        </p>
                        <p className="text-xs text-safaria-ivory/60 max-w-md mx-auto">
                          {lang === 'bn'
                            ? 'আমাদের রিজার্ভেশন টিম রুট যাচাই করে আপনার সাথে দ্রুত যোগাযোগ করবে। অবিলম্বে কনফার্মেশনের জন্য হোয়াটসঅ্যাপে বার্তা পাঠাতে পারেন।'
                            : 'Our reservations team is verifying current airline inventories. For expedited response, send this summary to WhatsApp.'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                          onClick={() => triggerWhatsAppHandoff(enquirySuccess)}
                          className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-slate-900 font-bold rounded-full flex items-center justify-center gap-2 transition"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.115-.527-1.748-.724-2.884-2.493-2.971-2.608-.088-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.35.491 1.199.534 1.286.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.203.043.072.043.419-.101.824z" />
                          </svg>
                          <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে কোটেশন পাঠান' : 'Expedite on WhatsApp'}</span>
                        </button>
                        <button
                          onClick={() => setEnquirySuccess(null)}
                          className="w-full sm:w-auto px-6 py-3 bg-safaria-emeraldDeep border border-safaria-gold/40 text-safaria-ivory rounded-full font-semibold"
                        >
                          {lang === 'bn' ? 'নতুন কোটেশন তৈরি করুন' : 'Submit Another Request'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleFlightSubmit} className="space-y-6">
                      
                      {/* Trip Type Selector */}
                      <div className="flex rounded-xl bg-safaria-emeraldDark/80 p-1 border border-safaria-gold/30">
                        {['ROUND_TRIP', 'ONE_WAY', 'MULTI_CITY'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setTripType(type)}
                            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                              tripType === type
                                ? 'bg-safaria-gold text-safaria-navyDark shadow'
                                : 'text-safaria-ivory/70 hover:text-safaria-ivory'
                            }`}
                          >
                            {type === 'ROUND_TRIP'
                              ? (lang === 'bn' ? 'রাউন্ড ট্রিপ (যাওয়া-আসা)' : 'Round Trip')
                              : type === 'ONE_WAY'
                              ? (lang === 'bn' ? 'ওয়ান ওয়ে (একমুখী)' : 'One Way')
                              : (lang === 'bn' ? 'মাল্টি সিটি' : 'Multi-City')}
                          </button>
                        ))}
                      </div>

                      {/* Origin & Destination Autocomplete Selectors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-safaria-gold mb-1.5 uppercase tracking-wider">
                            {lang === 'bn' ? 'প্রস্থান বিমানবন্দর (Origin)' : 'Departure Airport'}
                          </label>
                          <select
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-3 text-safaria-ivory focus:outline-none focus:border-safaria-gold text-sm"
                          >
                            <option value="">{lang === 'bn' ? 'বিমানবন্দর নির্বাচন করুন' : 'Select Origin Airport'}</option>
                            <optgroup label="Domestic (Bangladesh)">
                              {ALL_DESTINATIONS.filter(d => d.region === 'domestic').map(d => (
                                <option key={d.code} value={d.code}>
                                  {d.code} — {lang === 'bn' ? d.nameBn : d.nameEn} ({lang === 'bn' ? d.airportBn : d.airportEn})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="International Hubs">
                              {ALL_DESTINATIONS.filter(d => d.region !== 'domestic').map(d => (
                                <option key={d.code} value={d.code}>
                                  {d.code} — {lang === 'bn' ? d.nameBn : d.nameEn}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-safaria-gold mb-1.5 uppercase tracking-wider">
                            {lang === 'bn' ? 'গন্তব্য বিমানবন্দর (Destination)' : 'Arrival Destination'}
                          </label>
                          <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-3 text-safaria-ivory focus:outline-none focus:border-safaria-gold text-sm"
                          >
                            <option value="">{lang === 'bn' ? 'গন্তব্য নির্বাচন করুন' : 'Select Arrival Destination'}</option>
                            <optgroup label="Popular International Hubs">
                              {ALL_DESTINATIONS.filter(d => d.region !== 'domestic').map(d => (
                                <option key={d.code} value={d.code}>
                                  {d.code} — {lang === 'bn' ? d.nameBn : d.nameEn}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Domestic (Bangladesh)">
                              {ALL_DESTINATIONS.filter(d => d.region === 'domestic').map(d => (
                                <option key={d.code} value={d.code}>
                                  {d.code} — {lang === 'bn' ? d.nameBn : d.nameEn}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      {/* Travel Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-safaria-gold mb-1.5 uppercase tracking-wider">
                            {lang === 'bn' ? 'যাত্রার তারিখ (Departure)' : 'Departure Date'}
                          </label>
                          <input
                            type="date"
                            value={deptDate}
                            onChange={(e) => setDeptDate(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-3 text-safaria-ivory text-sm focus:outline-none focus:border-safaria-gold"
                            required
                          />
                        </div>

                        {tripType === 'ROUND_TRIP' && (
                          <div>
                            <label className="block text-xs font-semibold text-safaria-gold mb-1.5 uppercase tracking-wider">
                              {lang === 'bn' ? 'প্রত্যাবর্তনের তারিখ (Return)' : 'Return Date'}
                            </label>
                            <input
                              type="date"
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-3 text-safaria-ivory text-sm focus:outline-none focus:border-safaria-gold"
                              required={tripType === 'ROUND_TRIP'}
                            />
                          </div>
                        )}
                      </div>

                      {/* Passengers & Cabin Class */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-safaria-ivory/80 mb-1">
                            {lang === 'bn' ? 'প্রাপ্তবয়স্ক (১২+)' : 'Adults (12+)'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="9"
                            value={paxAdults}
                            onChange={(e) => setPaxAdults(parseInt(e.target.value) || 1)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-3 py-2 text-sm text-center text-safaria-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-safaria-ivory/80 mb-1">
                            {lang === 'bn' ? 'শিশু (২-১১)' : 'Children (2-11)'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="8"
                            value={paxChildren}
                            onChange={(e) => setPaxChildren(parseInt(e.target.value) || 0)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-3 py-2 text-sm text-center text-safaria-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-safaria-ivory/80 mb-1">
                            {lang === 'bn' ? 'নবজাতক (<২)' : 'Infants (<2)'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="4"
                            value={paxInfants}
                            onChange={(e) => setPaxInfants(parseInt(e.target.value) || 0)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-3 py-2 text-sm text-center text-safaria-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-safaria-ivory/80 mb-1">
                            {lang === 'bn' ? 'কেবিন ক্লাস' : 'Cabin Class'}
                          </label>
                          <select
                            value={cabinClass}
                            onChange={(e) => setCabinClass(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-2 py-2 text-xs text-safaria-ivory"
                          >
                            <option value="ECONOMY">Economy</option>
                            <option value="PREMIUM_ECONOMY">Premium Econ</option>
                            <option value="BUSINESS">Business</option>
                            <option value="FIRST">First Class</option>
                          </select>
                        </div>
                      </div>

                      {/* Lead Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-safaria-gold mb-1">
                            {lang === 'bn' ? 'যাত্রীর পূর্ণ নাম *' : 'Full Name *'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={lang === 'bn' ? 'উদা: মো: আশরাফুল ইসলাম' : 'e.g. John Doe'}
                            value={paxName}
                            onChange={(e) => setPaxName(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-2.5 text-sm text-safaria-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-safaria-gold mb-1">
                            {lang === 'bn' ? 'হোয়াটসঅ্যাপ / ফোন নম্বর *' : 'WhatsApp / Phone *'}
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+8801700000000"
                            value={paxPhone}
                            onChange={(e) => setPaxPhone(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-2.5 text-sm text-safaria-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-safaria-gold mb-1">
                            {lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                          </label>
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={paxEmail}
                            onChange={(e) => setPaxEmail(e.target.value)}
                            className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-2.5 text-sm text-safaria-ivory"
                          />
                        </div>
                      </div>

                      {/* Notes / Special Instructions */}
                      <div>
                        <label className="block text-xs font-semibold text-safaria-gold mb-1">
                          {lang === 'bn' ? 'বিশেষ রিকোয়ারমেন্ট / পছন্দের এয়ারলাইন (ঐচ্ছিক)' : 'Special Requests / Preferred Airline (Optional)'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'bn' ? 'উদা: এমিরেটস বা কাতার এয়ারওয়েজ, অতিরিক্ত ব্যাগেজ প্রয়োজন' : 'e.g. Direct flight preferred, extra luggage needed'}
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          className="w-full bg-safaria-emeraldDark/90 border border-safaria-gold/30 rounded-xl px-4 py-2.5 text-sm text-safaria-ivory"
                        />
                      </div>

                      {formError && (
                        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs">
                          {formError}
                        </div>
                      )}

                      {/* Submit CTA */}
                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-safaria-goldDark via-safaria-gold to-safaria-goldLight text-safaria-navyDark font-bold text-base rounded-2xl shadow-xl hover:brightness-105 transition flex items-center justify-center gap-2"
                      >
                        <span>{lang === 'bn' ? 'ফ্লাইট কোটেশন অনুরোধ জমা দিন' : 'Submit Flight Quotation Request'}</span>
                        <span>&rarr;</span>
                      </button>

                      <p className="text-[11px] text-safaria-ivory/60 text-center leading-relaxed">
                        {t.studioSection.disclaimer}
                      </p>
                    </form>
                  )}

                </div>
              </div>
            </section>

            {/* SECTION 5: B2B AGENCY PARTNERSHIP (#sf-agency) */}
            <B2BAgencySection lang={lang} t={t} onOpenModal={() => setActiveModal('b2b')} />

            {/* SECTION 6: CORPORATE TRAVEL & VISA ASSISTANCE CARDS */}
            <section className="py-20 bg-safaria-navyDark border-b border-safaria-gold/15">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Corporate Desk Card */}
                  <div id="sf-corporate" className="bg-safaria-emeraldDark/70 border border-safaria-gold/30 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 bg-safaria-navy/80 rounded-full border border-safaria-gold/30 text-safaria-gold text-xs font-bold uppercase font-en">
                        Corporate Travel Services
                      </div>
                      <h3 className="text-2xl font-bold text-safaria-ivory">
                        {lang === 'bn' ? 'কর্পোরেট ফ্লাইট ও বিজনেস ট্রাভেল ডেস্ক' : 'Corporate Flight & Executive Travel Desk'}
                      </h3>
                      <p className="text-sm text-safaria-ivory/70 leading-relaxed">
                        {lang === 'bn'
                          ? 'এসএমই, মাল্টিন্যাশনাল কোম্পানি এবং ব্যবসায়িক প্রতিষ্ঠানের কর্মীদের জন্য ডেডিকেটেড রিজার্ভেশন সাপোর্ট। মাসিক বিলিং স্টেটমেন্ট, গ্রুপ ট্রাভেল বাজেট এবং ফ্লেক্সিবল টিকিট পরিবর্তনের সুবিধা।'
                          : 'Centralized account management for enterprises and SMEs. Seamless employee manifests, monthly consolidated billing, and negotiated group seat allocations.'}
                      </p>
                      <ul className="space-y-2 text-xs text-safaria-ivory/80 pt-2">
                        <li className="flex items-center gap-2">
                          <span className="text-safaria-gold">✓</span> {lang === 'bn' ? 'ডেডিকেটেড একাউন্ট কনসালটেন্ট' : 'Dedicated Travel Account Consultant'}
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-safaria-gold">✓</span> {lang === 'bn' ? 'জরুরি ফ্লাইট পরিবর্তন ও রি-ইস্যু সহায়তা' : 'Emergency Priority Re-issuance Assistance'}
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-safaria-gold">✓</span> {lang === 'bn' ? 'মাসিক কর্পোরেট ইনভয়েস রিকনসিলিয়েশন' : 'Monthly Consolidated VAT Invoicing'}
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-safaria-gold/20 flex items-center justify-between">
                      <span className="text-xs text-safaria-gold/80 italic font-en">No hidden credit claims</span>
                      <button
                        onClick={() => setActiveModal('corporate')}
                        className="px-5 py-2.5 bg-safaria-gold text-safaria-navyDark rounded-full text-xs font-bold hover:brightness-110 transition"
                      >
                        {lang === 'bn' ? 'কর্পোরেট একাউন্ট আলোচনা' : 'Open Corporate Enquiry'}
                      </button>
                    </div>
                  </div>

                  {/* Visa Desk Card */}
                  <div id="sf-visa" className="bg-safaria-emeraldDark/70 border border-safaria-gold/30 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                      <div className="inline-block px-3 py-1 bg-safaria-navy/80 rounded-full border border-safaria-gold/30 text-safaria-gold text-xs font-bold uppercase font-en">
                        Immigration &amp; Documentation
                      </div>
                      <h3 className="text-2xl font-bold text-safaria-ivory">
                        {lang === 'bn' ? 'ভিসা ও ট্রাভেল ডকুমেন্টেশন গাইডেন্স' : 'Visa Filing & Documentation Advisory'}
                      </h3>
                      <p className="text-sm text-safaria-ivory/70 leading-relaxed">
                        {lang === 'bn'
                          ? 'সৌদি আরব (উমরাহ/ভিজিট), সংযুক্ত আরব আমিরাত, থাইল্যান্ড, মালয়েশিয়া, চীন, তুরস্ক ও যুক্তরাজ্যের জন্য সঠিক ফর্ম ফিলাপ, অ্যাপয়েন্টমেন্ট বুকিং ও প্রফেশনাল ডকুমেন্ট ভেরিফিকেশন।'
                          : 'Expert advisory on visa requirements, appointment scheduling, and strict document compliance for Saudi Arabia, UAE, Thailand, China, Turkey, and UK.'}
                      </p>
                      <div className="p-3 bg-safaria-navyDark/80 rounded-xl border border-safaria-gold/20 text-[11px] text-safaria-goldLight">
                        <strong>{lang === 'bn' ? 'গুরুত্বপূর্ণ সতর্কতা:' : 'Mandatory Compliance Notice:'}</strong>{' '}
                        {lang === 'bn'
                          ? 'ভিসা প্রদানের চূড়ান্ত সিদ্ধান্ত সংশ্লিষ্ট দূতাবাস বা ইমিগ্রেশন কর্তৃপক্ষের এখতিয়ারাধীন। কোনো এজেন্সির ভিসা অনুমোদন নিশ্চিত করার আইনগত অধিকার নেই।'
                          : 'Visa approval is at the sole discretion of the respective embassy/immigration authority. SAFARIA assists with accurate documentation.'}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-safaria-gold/20 flex items-center justify-between">
                      <span className="text-xs text-safaria-ivory/60">{lang === 'bn' ? 'ডকুমেন্টেশন চেকলিস্ট' : 'Document Checklists'}</span>
                      <button
                        onClick={() => setActiveModal('visa')}
                        className="px-5 py-2.5 bg-safaria-gold text-safaria-navyDark rounded-full text-xs font-bold hover:brightness-110 transition"
                      >
                        {lang === 'bn' ? 'ভিসা কনসালটেন্সি অনুরোধ' : 'Request Visa Consultation'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 7: LIVE AIRCRAFT TRACKING INTERFACE (Honest Provider Status) */}
            <section className="py-16 bg-safaria-emeraldDark border-b border-safaria-gold/15">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-safaria-navyDark border border-safaria-gold/30 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-safaria-gold/20">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-safaria-gold tracking-widest uppercase font-en">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        {t.radarSection.eyebrow}
                      </div>
                      <h3 className="text-2xl font-bold text-safaria-ivory mt-1">{t.radarSection.title}</h3>
                      <p className="text-xs sm:text-sm text-safaria-ivory/70 mt-0.5">{t.radarSection.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-full bg-safaria-emeraldDark border border-safaria-gold/30 text-[11px] text-safaria-ivory/80 font-mono">
                        {lang === 'bn' ? 'স্ট্যাটাস: ইন্টিগ্রেশন স্লট প্রস্তুত' : 'Status: API Adapter Ready'}
                      </div>
                    </div>
                  </div>

                  {/* Operational Radar Mock / Honest Notice */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    <div className="lg:col-span-2 bg-safaria-emeraldDark/90 rounded-2xl p-6 border border-safaria-gold/20 relative overflow-hidden">
                      <div className="flex items-center justify-between text-xs text-safaria-gold font-mono pb-3 border-b border-safaria-gold/15">
                        <span>DAC FIR AIRSPACE TELEMETRY</span>
                        <span>FREQ: 126.7 MHz</span>
                      </div>
                      <div className="py-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border border-dashed border-safaria-gold/50 flex items-center justify-center mx-auto text-xl animate-spin" style={{ animationDuration: '12s' }}>
                          📡
                        </div>
                        <h4 className="text-lg font-bold text-safaria-ivory">
                          {lang === 'bn' ? 'অ্যাডভান্সড এয়ারক্রাফট ট্র্যাকিং প্রোভাইডার অপেক্ষমান' : 'Pending Verified ADS-B Telemetry Provider'}
                        </h4>
                        <p className="text-xs text-safaria-ivory/70 max-w-lg mx-auto">
                          {lang === 'bn'
                            ? 'SAFARIA নীতি অনুযায়ী আমরা কোনো মিথ্যা বা কাল্পনিক রাডার ডেটা প্রদর্শন করি না। FlightRadar24 / FlightAware API এগ্রিমেন্ট কার্যকর হওয়ার সাথে সাথে এখানে লাইভ ফ্লাইট ট্র্যাকার চালু হবে।'
                            : 'In compliance with our integrity directive, SAFARIA does not simulate artificial flights. Real-time radar feeds will activate upon deployment of authorized supplier credentials.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-safaria-ivory/50 font-mono pt-3 border-t border-safaria-gold/15">
                        <span>LAT: 23.8433° N, LON: 90.3978° E</span>
                        <span className="text-amber-400">ENQUIRY ROUTE CO-ORDINATION ACTIVE</span>
                      </div>
                    </div>

                    {/* Flight Status Lookup Form */}
                    <div className="bg-safaria-emeraldDeep/80 p-5 rounded-2xl border border-safaria-gold/25 space-y-4">
                      <h4 className="text-sm font-bold text-safaria-ivory">
                        {lang === 'bn' ? 'ফ্লাইট স্ট্যাটাস যাচাই অনুরোধ' : 'Flight Status Verification'}
                      </h4>
                      <p className="text-xs text-safaria-ivory/70">
                        {lang === 'bn'
                          ? 'আপনার ফ্লাইট নম্বর প্রদান করুন। আমাদের টিম অফিশিয়াল সিস্টেম থেকে বর্তমান শিডিউল যাচাই করে জানাবে।'
                          : 'Enter your flight code to have our human desk check official GDS schedule updates.'}
                      </p>
                      <input
                        type="text"
                        placeholder="e.g. BG 001 / EK 585 / QR 641"
                        className="w-full bg-safaria-navyDark/90 border border-safaria-gold/30 rounded-xl px-3 py-2 text-xs text-safaria-ivory uppercase font-mono"
                      />
                      <button
                        onClick={() => alert(lang === 'bn' ? 'আপনার ফ্লাইট নম্বর গৃহীত হয়েছে। টিম যাচাই করে নিশ্চিত করবে।' : 'Flight code submitted. Reservations team will verify.')}
                        className="w-full py-2.5 bg-safaria-gold text-safaria-navyDark text-xs font-bold rounded-xl hover:brightness-105 transition"
                      >
                        {lang === 'bn' ? 'স্ট্যাটাস যাচাই করুন' : 'Verify Schedule'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 8: VIBE TRIPPIN' & BUSINESS ECOSYSTEM */}
            <section className="py-16 bg-safaria-navyDark border-b border-safaria-gold/15">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-safaria-emeraldDark via-safaria-emeraldDeep to-safaria-navyDark border border-safaria-gold/30 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 max-w-2xl">
                    <span className="text-xs font-semibold text-safaria-gold tracking-widest uppercase font-en">{t.vibeSection.eyebrow}</span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-safaria-ivory">{t.vibeSection.title}</h3>
                    <p className="text-sm text-safaria-ivory/75 leading-relaxed">
                      {lang === 'bn'
                        ? 'SAFARIA মূলত এয়ার টিকেটিং ও ট্রাভেল সমন্বয়ে নিবেদিত। আমাদের সহযোগী ব্র্যান্ড ViBE Trippin’ ভ্রমণপিপাসুদের জন্য অ্যাডভেঞ্চার, রিসোর্ট এক্সপেরিয়েন্স ও এক্সক্লুসিভ লাইফস্টাইল ট্যুর পরিচালনা করে।'
                        : 'While SAFARIA focuses on precision aviation ticketing and B2B coordination, our sister brand ViBE Trippin’ curates boutique holiday retreats and immersive youth experiences.'}
                    </p>
                    <div className="text-xs text-safaria-gold/80 font-mono">
                      Just Another Travel Group • Technology by NotRealEngine, LLC
                    </div>
                  </div>

                  <a
                    href="https://notrealengine.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-safaria-gold hover:bg-safaria-goldLight text-safaria-navyDark font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{lang === 'bn' ? 'ViBE Trippin’ এক্সপ্লোর করুন' : 'Explore ViBE Trippin’'}</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </section>
          </main>

          {/* VOYAGER AI TRAVEL ASSISTANT (Concierge Widget) */}
          <VoyagerAiWidget lang={lang} onPrefillFlight={(code) => handleSelectDestination(code)} />

          {/* SITE FOOTER */}
          <footer className="bg-safaria-navyDark pt-16 pb-12 border-t border-safaria-gold/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* Brand & Wordmark */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-safaria-gold/40 flex items-center justify-center bg-safaria-emeraldDark p-1.5">
                      <svg viewBox="0 0 48 48" className="w-6 h-6 text-safaria-gold">
                        <polygon points="24,6 28,21 42,24 28,27 24,42 20,27 6,24 20,21" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-display tracking-widest text-xl font-bold text-safaria-ivory block leading-none">SAFARIA</span>
                      <span className="font-en text-[9px] tracking-[0.25em] text-safaria-gold block mt-0.5 font-semibold">TOURS &amp; TRAVELS</span>
                    </div>
                  </div>
                  <p className="text-xs text-safaria-ivory/70 leading-relaxed max-w-md">
                    {lang === 'bn'
                      ? 'প্রিমিয়াম এভিয়েশন কোটেশন, রুট সমন্বয় ও B2B ট্রাভেল এজেন্সি সাবস্ক্রিপশন প্ল্যাটফর্ম। সঠিক ফ্লাইট নির্বাচনে আপনার বিশ্বস্ত অংশীদার।'
                      : 'Premium aviation route coordination, flight quotation verification, and B2B travel agency subscriptions.'}
                  </p>
                  <p className="text-[11px] text-safaria-gold/80 italic font-bn">
                    {t.footer.disclaimer}
                  </p>
                </div>

                {/* Quick Navigation Links */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-safaria-gold uppercase tracking-wider font-en">Navigation</h4>
                  <ul className="space-y-2 text-xs text-safaria-ivory/75">
                    <li><a href="#sf-atlas" className="hover:text-safaria-gold transition">{t.nav.atlas}</a></li>
                    <li><a href="#sf26-offers" className="hover:text-safaria-gold transition">{t.nav.services}</a></li>
                    <li><a href="#sf-destinations" className="hover:text-safaria-gold transition">{t.nav.destinations}</a></li>
                    <li><a href="#sf-travel-form" className="hover:text-safaria-gold transition">{t.nav.studio}</a></li>
                    <li><a href="#sf-agency" className="hover:text-safaria-gold transition">{t.nav.agency}</a></li>
                  </ul>
                </div>

                {/* Verified Contact Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-safaria-gold uppercase tracking-wider font-en">{t.footer.contactTitle}</h4>
                  <ul className="space-y-2.5 text-xs text-safaria-ivory/80">
                    <li className="flex items-start gap-2">
                      <span className="text-safaria-gold font-bold">WhatsApp:</span>
                      <a href="https://wa.me/8801674178437" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-mono hover:underline">
                        +880 1674-178437
                      </a>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-safaria-gold font-bold">Email:</span>
                      <a href="mailto:safariatoursandtravels@gmail.com" className="text-safaria-ivory/80 hover:underline font-mono">
                        safariatoursandtravels@gmail.com
                      </a>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-safaria-gold font-bold">Base:</span>
                      <span>Dhaka, Bangladesh</span>
                    </li>
                    <li className="pt-1">
                      <span className="inline-block px-2.5 py-1 bg-safaria-emeraldDark border border-safaria-gold/30 rounded text-[10px] text-safaria-gold font-mono">
                        Prepaid Settlement Policy
                      </span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Copyright & Tech Attribution */}
              <div className="pt-8 border-t border-safaria-gold/15 flex flex-col sm:flex-row items-center justify-between text-xs text-safaria-ivory/50 gap-4">
                <div>{t.footer.copyright}</div>
                <div className="flex items-center gap-4">
                  <span>{t.footer.techAttribution}</span>
                  <a href="https://bhaisazzad.online" target="_blank" rel="noopener noreferrer" className="hover:text-safaria-gold transition">
                    Engineering Portfolio
                  </a>
                </div>
              </div>

            </div>
          </footer>

          {/* MODALS */}
          {activeModal === 'b2b' && (
            <B2BApplicationModal
              lang={lang}
              onClose={() => setActiveModal(null)}
              onSubmit={(appData) => {
                const newRec = {
                  id: `SFR-B2B-${Math.floor(1000 + Math.random() * 9000)}`,
                  type: 'AGENCY_B2B',
                  name: appData.agencyName,
                  contact: appData.phone,
                  origin: appData.location,
                  dest: appData.plan === 'MONTHLY' ? 'Monthly Plan ৳20,000' : 'Annual Plan ৳130,000',
                  dates: '72-Hr Trial Requested',
                  pax: `Contact: ${appData.contactName}`,
                  status: 'NEW',
                  timestamp: new Date().toLocaleString()
                };
                setEnquiries([newRec, ...enquiries]);
                setActiveModal(null);
                alert(lang === 'bn' ? 'আপনার B2B আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন টিম শীঘ্রই যোগাযোগ করবে।' : 'B2B application submitted! Our team will contact you for trial activation.');
              }}
            />
          )}

          {activeModal === 'corporate' && (
            <CorporateModal lang={lang} onClose={() => setActiveModal(null)} />
          )}

          {activeModal === 'visa' && (
            <VisaModal lang={lang} onClose={() => setActiveModal(null)} />
          )}

          {activeModal === 'admin' && (
            <AdminDeskModal
              lang={lang}
              enquiries={enquiries}
              onClose={() => setActiveModal(null)}
              onUpdateStatus={(id, newStatus) => {
                const updated = enquiries.map(item => item.id === id ? { ...item, status: newStatus } : item);
                setEnquiries(updated);
                try { localStorage.setItem('safaria_enquiries_v2', JSON.stringify(updated)); } catch(e) {}
              }}
            />
          )}

        </div>
      );
    }

    // =========================================================================
    // 3. THREE.JS 3D INTERACTIVE GLOBE COMPONENT
    // =========================================================================

    function ThreeGlobeCanvas({ selectedDest, onSelectDest }) {
      const containerRef = useRef(null);

      useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const width = container.clientWidth || 480;
        const height = container.clientHeight || 480;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 2.8;

        let renderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch (e) {
          console.warn("WebGL unsupported", e);
          return;
        }

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xd6b779, 1.6);
        pointLight.position.set(5, 3, 5);
        scene.add(pointLight);

        // Earth Sphere with Emerald Shading
        const sphereGeo = new THREE.SphereGeometry(1, 48, 48);
        const sphereMat = new THREE.MeshPhongMaterial({
          color: 0x064E3B,
          emissive: 0x041713,
          specular: 0xd6b779,
          shininess: 15,
          wireframe: false
        });
        const earth = new THREE.Mesh(sphereGeo, sphereMat);
        scene.add(earth);

        // Atmosphere Glow Rim
        const glowGeo = new THREE.SphereGeometry(1.05, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x17584d,
          transparent: true,
          opacity: 0.25,
          side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glow);

        // Add Destination Pins & Dhaka Origin
        const latLonToVector3 = (lat, lon, radius = 1.02) => {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon + 180) * (Math.PI / 180);
          return new THREE.Vector3(
            -(radius * Math.sin(phi) * Math.cos(theta)),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          );
        };

        const dhakaVec = latLonToVector3(23.8103, 90.4125);
        const originPinGeo = new THREE.SphereGeometry(0.024, 16, 16);
        const originPinMat = new THREE.MeshBasicMaterial({ color: 0xf4d38d });
        const originPin = new THREE.Mesh(originPinGeo, originPinMat);
        originPin.position.copy(dhakaVec);
        earth.add(originPin);

        // Destination pins
        ATLAS_DESTINATIONS.forEach(dest => {
          const destVec = latLonToVector3(dest.coords[0], dest.coords[1]);
          const pinGeo = new THREE.SphereGeometry(0.018, 12, 12);
          const pinMat = new THREE.MeshBasicMaterial({ color: 0xd6b779 });
          const pin = new THREE.Mesh(pinGeo, pinMat);
          pin.position.copy(destVec);
          earth.add(pin);

          // Flight Arc Curve from Dhaka
          const midPoint = dhakaVec.clone().add(destVec).multiplyScalar(0.5);
          midPoint.normalize().multiplyScalar(1.22); // Arc curvature height

          const curve = new THREE.QuadraticBezierCurve3(dhakaVec, midPoint, destVec);
          const points = curve.getPoints(24);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color: 0xcfb57c, transparent: true, opacity: 0.6 });
          const arcLine = new THREE.Line(lineGeo, lineMat);
          earth.add(arcLine);
        });

        // Set initial orientation toward South Asia
        earth.rotation.y = -1.2;
        earth.rotation.x = 0.3;

        let reqId;
        const animate = () => {
          reqId = requestAnimationFrame(animate);
          earth.rotation.y += 0.0025; // Gentle rotation
          renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(reqId);
          if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };
      }, []);

      return (
        <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
          <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-safaria-navyDark/90 border border-safaria-gold/30 rounded text-[10px] text-safaria-gold font-mono">
            3D WebGL Globe: Rotational View
          </div>
        </div>
      );
    }

    // =========================================================================
    // 4. DESTINATION DIRECTORY COMPONENT
    // =========================================================================

    function DestinationDirectorySection({ lang, t, destinations, onSelect }) {
      const [filter, setFilter] = useState('all');
      const [searchQuery, setSearchQuery] = useState('');

      const filtered = useMemo(() => {
        return destinations.filter(d => {
          const matchesCategory = filter === 'all' || d.region === filter;
          const matchesSearch = !searchQuery.trim() || 
            d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.nameBn.includes(searchQuery);
          return matchesCategory && matchesSearch;
        });
      }, [destinations, filter, searchQuery]);

      return (
        <section id="sf-destinations" className="py-20 bg-safaria-emeraldDark border-b border-safaria-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <span className="text-xs font-semibold text-safaria-gold tracking-widest uppercase font-en">{t.destinationsSection.eyebrow}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-safaria-ivory">{t.destinationsSection.title}</h2>
              <p className="text-sm sm:text-base text-safaria-ivory/70">{t.destinationsSection.subtitle}</p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: t.destinationsSection.tabs.all },
                  { key: 'domestic', label: t.destinationsSection.tabs.domestic },
                  { key: 'middleEast', label: t.destinationsSection.tabs.middleEast },
                  { key: 'asia', label: t.destinationsSection.tabs.asia },
                  { key: 'europeAmericas', label: t.destinationsSection.tabs.europeAmericas }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                      filter === tab.key
                        ? 'bg-safaria-gold text-safaria-navyDark shadow'
                        : 'bg-safaria-navyDark/70 text-safaria-ivory/70 border border-safaria-gold/20 hover:border-safaria-gold'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder={t.destinationsSection.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-safaria-navyDark/90 border border-safaria-gold/30 rounded-full px-4 py-2 text-xs text-safaria-ivory focus:outline-none focus:border-safaria-gold"
                />
              </div>
            </div>

            {/* Grid of Destination Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {filtered.map((dest) => (
                <div
                  key={dest.code}
                  className="bg-safaria-navyDark/80 hover:bg-safaria-emeraldDeep border border-safaria-gold/20 hover:border-safaria-gold p-4 rounded-2xl transition duration-200 flex flex-col justify-between group shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold font-en text-safaria-gold group-hover:scale-105 transition">
                        {dest.code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-safaria-emeraldDark text-safaria-ivory/60 font-mono">
                        {dest.region === 'domestic' ? 'BD' : 'INTL'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-safaria-ivory">
                      {lang === 'bn' ? dest.nameBn : dest.nameEn}
                    </div>
                    <div className="text-[11px] text-safaria-ivory/60 line-clamp-1">
                      {lang === 'bn' ? dest.airportBn : dest.airportEn}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelect(dest.code)}
                    className="mt-4 w-full py-1.5 bg-safaria-emeraldDark hover:bg-safaria-gold hover:text-safaria-navyDark border border-safaria-gold/30 rounded-lg text-[11px] font-semibold text-safaria-gold transition"
                  >
                    {lang === 'bn' ? 'কোটেশন রিকোয়েস্ট' : 'Request Quote'}
                  </button>
                </div>
              ))}
            </div>

          </div>
        </section>
      );
    }

    // =========================================================================
    // 5. B2B AGENCY PARTNERSHIP SECTION
    // =========================================================================

    function B2BAgencySection({ lang, t, onOpenModal }) {
      const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

      return (
        <section id="sf-agency" className="py-24 bg-safaria-emeraldDeep/60 border-b border-safaria-gold/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-semibold text-safaria-gold tracking-widest uppercase font-en">{t.agencySection.eyebrow}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-safaria-ivory">{t.agencySection.title}</h2>
              <p className="text-sm sm:text-base text-safaria-ivory/70">{t.agencySection.subtitle}</p>
              
              {/* 72-Hour Free Trial Callout */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-safaria-gold/10 border border-safaria-gold/40 rounded-full text-safaria-gold text-xs font-bold mt-2">
                <span>⚡</span> {t.agencySection.trialBanner}
              </div>
            </div>

            {/* Pricing Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Monthly Plan */}
              <div className="bg-safaria-navyDark border border-safaria-gold/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-safaria-ivory">{t.agencySection.monthly}</h3>
                    <span className="text-xs px-3 py-1 bg-safaria-emeraldDark border border-safaria-gold/30 rounded-full text-safaria-gold">
                      Prepaid
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-safaria-gold font-en">৳২০,০০০</span>
                    <span className="text-xs text-safaria-ivory/60 font-en">/ month</span>
                  </div>
                  <p className="text-xs text-safaria-ivory/70">
                    {lang === 'bn' ? 'ছোট ও মাঝারি নন-আইয়াটা এজেন্সির জন্য আদর্শ ব্যাকঅফিস সাপোর্ট।' : 'Perfect for emerging and growing travel consultants across Bangladesh.'}
                  </p>
                  <ul className="space-y-2.5 text-xs text-safaria-ivory/80 pt-2">
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> 0% SAFARIA Markup on eligible airfares</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> 72-hour full operational trial</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> GDS &amp; LCC multi-airline issuance desk</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> Dedicated WhatsApp ticketing coordination</li>
                  </ul>
                </div>
                <button
                  onClick={onOpenModal}
                  className="mt-8 w-full py-3 bg-safaria-emeraldDeep hover:bg-safaria-emeraldLight border border-safaria-gold/40 text-safaria-ivory font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  {t.agencySection.applyBtn}
                </button>
              </div>

              {/* Annual Plan */}
              <div className="bg-gradient-to-b from-safaria-navyDark to-safaria-emeraldDark border-2 border-safaria-gold rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
                <div className="absolute -top-3 right-6 px-3 py-0.5 bg-safaria-gold text-safaria-navyDark text-[10px] font-bold uppercase rounded-full tracking-wider">
                  Recommended • Save ৳110,000
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-safaria-ivory">{t.agencySection.annual}</h3>
                    <span className="text-xs px-3 py-1 bg-safaria-gold/20 text-safaria-gold rounded-full font-bold">
                      VIP Desk
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-safaria-gold font-en">৳১৩০,০০০</span>
                    <span className="text-xs text-safaria-ivory/60 font-en">/ year</span>
                  </div>
                  <p className="text-xs text-safaria-ivory/70">
                    {lang === 'bn' ? 'পূর্ণাঙ্গ ট্রাভেল এজেন্সি ও হাই-ভলিউম উদ্যোক্তাদের জন্য সর্বোচ্চ অগ্রাধিকার।' : 'Full enterprise ticketing integration with top-tier desk prioritization.'}
                  </p>
                  <ul className="space-y-2.5 text-xs text-safaria-ivory/80 pt-2">
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> 0% SAFARIA Markup on eligible airfares</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> 72-hour risk-free trial activation</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> Priority fast-track group quotation response</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> Dedicated Senior GDS Ticketing Officer</li>
                    <li className="flex items-center gap-2"><span className="text-safaria-gold">✓</span> Quarterly revenue reconciliation meetings</li>
                  </ul>
                </div>
                <button
                  onClick={onOpenModal}
                  className="mt-8 w-full py-3 bg-safaria-gold hover:bg-safaria-goldLight text-safaria-navyDark font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
                >
                  {t.agencySection.applyBtn}
                </button>
              </div>

            </div>

            {/* Mandatory Commercial Disclaimers */}
            <div className="mt-12 max-w-3xl mx-auto p-5 bg-safaria-navyDark/80 rounded-2xl border border-safaria-gold/20 text-xs text-safaria-ivory/70 space-y-2">
              <div className="font-bold text-safaria-gold text-sm">
                {lang === 'bn' ? 'B2B পার্টনারশিপ শর্তাবলী ও আর্থিক স্বচ্ছতা:' : 'B2B Terms & Commercial Disclaimers:'}
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-safaria-ivory/75">
                <li>
                  {lang === 'bn'
                    ? '০% SAFARIA মার্কআপ নির্দেশ করে যে SAFARIA নির্ধারিত প্ল্যানে অতিরিক্ত ফি যোগ করে না। তবে এয়ারলাইন্সের নেট ফেয়ার, সরকারি কর ও সাপ্লায়ারের রুলস অক্ষুণ্ণ থাকবে।'
                    : '0% SAFARIA markup signifies zero agency margin added by SAFARIA on eligible net inventory. Airline base fares, mandatory government taxes, and carrier fees remain payable.'}
                </li>
                <li>
                  {lang === 'bn'
                    ? 'সকল টিকিট ট্রানজ্যাকশন প্রি-পেইড ডিপোজিট বা পূর্বানুমোদিত সেটেলমেন্ট চুক্তির ভিত্তিতে সম্পন্ন হবে।'
                    : 'All ticket transactions are strictly executed under prepaid deposit or approved mutual settlement agreements.'}
                </li>
                <li>
                  {lang === 'bn'
                    ? '৭২ ঘণ্টার ফ্রি ট্রায়াল বাস্তবায়নের পূর্বে এজেন্সির সঠিক পরিচয় ও ট্রেড তথ্যাদি যাচাইকরণ সাপেক্ষ।'
                    : 'The 72-hour trial requires identity and business background verification before issuance privileges are unlocked.'}
                </li>
              </ul>
            </div>

          </div>
        </section>
      );
    }

    // =========================================================================
    // 6. VOYAGER AI TRAVEL CONCIERGE (Interactive Lead Capture)
    // =========================================================================

    function VoyagerAiWidget({ lang, onPrefillFlight }) {
      const [isOpen, setIsOpen] = useState(false);
      const [messages, setMessages] = useState([
        {
          sender: 'ai',
          text: lang === 'bn'
            ? 'নমস্কার! আমি সাফারিয়া ভয়েজার এআই। আপনি কোন রুটে ভ্রমণের পরিকল্পনা করছেন? আমি ফ্লাইট বিকল্প ও তথ্য সাজাতে সহায়তা করতে পারি।'
            : 'Hello! I am Voyager, SAFARIA’s AI Travel Concierge. Tell me where you are flying, and I can assist with route options and quotation preparation!'
        }
      ]);
      const [input, setInput] = useState('');

      const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const query = input.toLowerCase();
        setInput('');

        // Deterministic Concierge Logic (Server-side LLM Fallback)
        setTimeout(() => {
          let aiReply = "";
          if (query.includes('london') || query.includes('লন্ডন') || query.includes('lhr')) {
            aiReply = lang === 'bn'
              ? 'লন্ডন (LHR) রুটে বিমান বাংলাদেশ, এমিরেটস, কাতার এবং সাউদিয়া এয়ারলাইন্সের চমৎকার কানেকশন রয়েছে। আমি আপনার ট্রাভেল স্টুডিওতে LHR কোটেশন প্রিপেয়ার করে দিয়েছি।'
              : 'For London Heathrow, popular carriers include Biman, Emirates, Qatar Airways, and Saudia. I have pre-filled LHR in your Travel Studio!';
            onPrefillFlight('LHR');
          } else if (query.includes('dubai') || query.includes('দুবাই') || query.includes('dxb')) {
            aiReply = lang === 'bn'
              ? 'দুবাই (DXB) রুটে প্রতিদিন একাধিক সরাসরি ফ্লাইট অপারেট করে। ট্রাভেল স্টুডিওতে আপনার কোটেশন শুরু করতে পারেন।'
              : 'Direct flights to Dubai (DXB) run daily via Emirates, Biman, and flydubai. I’ve selected DXB for your enquiry!';
            onPrefillFlight('DXB');
          } else if (query.includes('visa') || query.includes('ভিসা')) {
            aiReply = lang === 'bn'
              ? 'সাফারিয়া ভিসা ডকুমেন্টেশন ফাইল প্রস্তুতকরণে সহায়তা করে। মনে রাখবেন, ভিসা প্রদানের চূড়ান্ত সিদ্ধান্ত সংশ্লিষ্ট দূতাবাসের।'
              : 'SAFARIA assists with rigorous visa file preparations. Final decisions rest solely with embassies.';
          } else if (query.includes('b2b') || query.includes('এজেন্সি')) {
            aiReply = lang === 'bn'
              ? 'আমাদের B2B এজেন্সি প্ল্যানে মাসিক ৳২০,০০০ অথবা বার্ষিক ৳১৩০,০০০ সাবস্ক্রিপশনে ০% মার্কআপ সুবিধা রয়েছে।'
              : 'Our B2B plans offer 0% SAFARIA markup for ৳20,000/mo or ৳130,000/yr with a 72-hour trial.';
          } else {
            aiReply = lang === 'bn'
              ? 'ধন্যবাদ! আপনার চাহিদামতো রুট চেক করে সঠিক কোটেশন দিতে আমাদের রিজার্ভেশন ডেস্কে যোগাযোগ করুন অথবা ট্রাভেল স্টুডিওতে ফর্মটি পূরণ করুন।'
              : 'Thank you! To receive verified fare options, please submit your request in our Travel Studio or chat with human agents on WhatsApp (+8801674178437).';
          }

          setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
        }, 600);
      };

      return (
        <div className="fixed bottom-6 right-6 z-40">
          {isOpen ? (
            <div className="w-80 sm:w-96 bg-safaria-navyDark border-2 border-safaria-gold rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[460px]">
              
              {/* Header */}
              <div className="bg-safaria-emeraldDark px-4 py-3 border-b border-safaria-gold/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-safaria-gold text-safaria-navyDark flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-safaria-ivory">Voyager AI Concierge</h4>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Verified Assistance Guardrails
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-safaria-ivory/60 hover:text-safaria-ivory text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                        m.sender === 'user'
                          ? 'bg-safaria-gold text-safaria-navyDark font-medium rounded-br-none'
                          : 'bg-safaria-emeraldDark/90 text-safaria-ivory border border-safaria-gold/20 rounded-bl-none leading-relaxed'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-3 bg-safaria-emeraldDark/80 border-t border-safaria-gold/20 flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'ফ্লাইট বা গন্তব্য সম্পর্কে জিজ্ঞাসা করুন...' : 'Ask about flights, visa, or B2B...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-safaria-navyDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-xs text-safaria-ivory focus:outline-none focus:border-safaria-gold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-safaria-gold text-safaria-navyDark font-bold rounded-xl text-xs"
                >
                  &uarr;
                </button>
              </form>

            </div>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="px-5 py-3.5 bg-safaria-gold hover:bg-safaria-goldLight text-safaria-navyDark font-bold rounded-full shadow-2xl flex items-center gap-2.5 transition border border-safaria-navyDark hover:scale-105"
            >
              <span className="text-base">✦</span>
              <span className="text-xs tracking-wider uppercase font-en">Voyager AI</span>
            </button>
          )}
        </div>
      );
    }

    // =========================================================================
    // 7. B2B APPLICATION MODAL
    // =========================================================================

    function B2BApplicationModal({ lang, onClose, onSubmit }) {
      const [agencyName, setAgencyName] = useState('');
      const [contactName, setContactName] = useState('');
      const [email, setEmail] = useState('');
      const [phone, setPhone] = useState('+880');
      const [location, setLocation] = useState('');
      const [plan, setPlan] = useState('MONTHLY');
      const [tradeLicense, setTradeLicense] = useState('');

      const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ agencyName, contactName, email, phone, location, plan, tradeLicense });
      };

      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-safaria-navyDark border-2 border-safaria-gold rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-safaria-ivory">
                  {lang === 'bn' ? 'B2B এজেন্সি পার্টনারশিপ আবেদন' : 'B2B Agency Partnership Application'}
                </h3>
                <p className="text-xs text-safaria-gold mt-1">৭২ ঘণ্টার ফ্রি ট্রায়াল ও ০% SAFARIA মার্কআপ অ্যাক্টিভেশন</p>
              </div>
              <button onClick={onClose} className="text-safaria-ivory/60 hover:text-safaria-ivory text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-safaria-gold mb-1">এজেন্সির নাম (Agency Name) *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Horizon Aviation & Tours"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-safaria-ivory"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-safaria-gold mb-1">যোগাযোগকারী ব্যক্তি *</label>
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-safaria-ivory"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-safaria-gold mb-1">ফোন / হোয়াটসঅ্যাপ *</label>
                  <input
                    required
                    type="tel"
                    placeholder="+8801..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-safaria-ivory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-safaria-gold mb-1">অফিসিয়াল ইমেইল *</label>
                  <input
                    required
                    type="email"
                    placeholder="agency@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-safaria-ivory"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-safaria-gold mb-1">ব্যবসার অবস্থান (City / Area) *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Motijheel, Dhaka"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-safaria-ivory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-safaria-gold mb-1">পছন্দের প্ল্যান</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-2 py-2 text-safaria-ivory"
                  >
                    <option value="MONTHLY">মাসিক প্ল্যান (৳২০,০০০/মাস)</option>
                    <option value="ANNUAL">বার্ষিক প্ল্যান (৳১৩০,০০০/বছর)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-safaria-gold mb-1">ট্রেড লাইসেন্স নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="Trade License No."
                    value={tradeLicense}
                    onChange={(e) => setTradeLicense(e.target.value)}
                    className="w-full bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-2 text-safaria-ivory"
                  />
                </div>
              </div>

              <div className="p-3 bg-safaria-emeraldDark/80 rounded-xl text-[11px] text-safaria-ivory/70 leading-relaxed border border-safaria-gold/20">
                আমি স্বীকার করছি যে SAFARIA একটি প্রিপেইড বুকিং মডেল এবং ০% মার্কআপ এয়ারলাইন্স বেস ফেয়ারের উপর প্রযোজ্য। ৭২ ঘণ্টার ফ্রি ট্রায়াল বাস্তবায়নের পর সেবা কার্যকর হবে।
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-safaria-gold text-safaria-navyDark font-bold rounded-xl hover:brightness-110 transition"
              >
                আবেদন জমা দিন (৭২ ঘণ্টার ট্রায়াল শুরু করুন)
              </button>
            </form>
          </div>
        </div>
      );
    }

    // =========================================================================
    // 8. CORPORATE & VISA MODALS
    // =========================================================================

    function CorporateModal({ lang, onClose }) {
      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-safaria-navyDark border-2 border-safaria-gold rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-safaria-ivory">কর্পোরেট একাউন্ট আলোচনা</h3>
              <button onClick={onClose} className="text-safaria-ivory/60 hover:text-safaria-ivory">✕</button>
            </div>
            <p className="text-xs text-safaria-ivory/70">
              আপনার প্রতিষ্ঠানের কর্মকর্তা ও কর্মচারীদের নিয়মিত ভ্রমণের জন্য ডেডিকেটেড কর্পোরেট সেবা পেতে আমাদের কর্পোরেট রিলেশনশিপ অফিসারের সাথে সরাসরি আলোচনা করুন।
            </p>
            <div className="space-y-2 pt-2">
              <a
                href="https://wa.me/8801674178437?text=Hello%20SAFARIA,%20we%20want%20to%20discuss%20a%20Corporate%20Travel%20Account."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 bg-safaria-gold text-safaria-navyDark font-bold rounded-xl text-xs"
              >
                হোয়াটসঅ্যাপে কর্পোরেট ডেস্ক সংযোগ করুন
              </a>
              <button onClick={onClose} className="block w-full text-center py-2 text-xs text-safaria-ivory/60">
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      );
    }

    function VisaModal({ lang, onClose }) {
      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-safaria-navyDark border-2 border-safaria-gold rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-safaria-ivory">ভিসা কনসালটেন্সি ও সহায়তা</h3>
              <button onClick={onClose} className="text-safaria-ivory/60 hover:text-safaria-ivory">✕</button>
            </div>
            <p className="text-xs text-safaria-ivory/70">
              ভিসার আবেদন ফরম প্রস্তুতকরণ ও প্রয়োজনীয় ডকুমেন্টস চেকলিস্টের জন্য আমাদের ভিসা এক্সপার্টের পরামর্শ নিন।
            </p>
            <div className="p-3 bg-safaria-emeraldDark rounded-xl text-[11px] text-amber-300">
              সতর্কতা: ভিসা অ্যাপ্রুভাল সম্পূর্ণভাবে দূতাবাসের সিদ্ধান্তের ওপর নির্ভরশীল। কোনো ভুয়া গ্যারান্টি বা অস্বচ্ছ প্রক্রিয়া সমর্থন করা হয় না।
            </div>
            <div className="space-y-2 pt-2">
              <a
                href="https://wa.me/8801674178437?text=Hello%20SAFARIA,%20I%20need%20Visa%20Assistance%20information."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 bg-safaria-gold text-safaria-navyDark font-bold rounded-xl text-xs"
              >
                ভিসা ডেস্কের সাথে কথা বলুন
              </a>
              <button onClick={onClose} className="block w-full text-center py-2 text-xs text-safaria-ivory/60">
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      );
    }

    // =========================================================================
    // 9. ADMIN OPERATIONS & ENQUIRY MANAGEMENT CONSOLE
    // =========================================================================

    function AdminDeskModal({ lang, enquiries, onClose, onUpdateStatus }) {
      const [filter, setFilter] = useState('ALL');
      const [search, setSearch] = useState('');

      const filtered = enquiries.filter(item => {
        const matchesType = filter === 'ALL' || item.type === filter;
        const matchesSearch = !search ||
          item.id.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.contact.includes(search);
        return matchesType && matchesSearch;
      });

      return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-safaria-navyDark border-2 border-safaria-gold rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl h-[85vh] flex flex-col">
            
            <div className="flex justify-between items-center pb-4 border-b border-safaria-gold/20">
              <div>
                <h3 className="text-xl font-bold text-safaria-ivory flex items-center gap-2">
                  <span>🔒</span> SAFARIA Operations Desk &amp; Enquiry Management
                </h3>
                <p className="text-xs text-safaria-ivory/60 mt-0.5">
                  Database persistence, GoHighLevel CRM status dispatcher, and lead review.
                </p>
              </div>
              <button onClick={onClose} className="text-safaria-ivory/60 hover:text-safaria-ivory text-xl p-2">✕</button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
              <div className="flex gap-2">
                {['ALL', 'FLIGHT', 'AGENCY_B2B'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 rounded-full font-semibold transition ${
                      filter === t ? 'bg-safaria-gold text-safaria-navyDark' : 'bg-safaria-emeraldDark text-safaria-ivory/70 border border-safaria-gold/20'
                    }`}
                  >
                    {t === 'ALL' ? 'All Leads' : t === 'FLIGHT' ? 'Flight Quotes' : 'B2B Partners'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search reference, customer name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-safaria-emeraldDark border border-safaria-gold/30 rounded-xl px-3 py-1.5 text-xs text-safaria-ivory"
              />
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto border border-safaria-gold/20 rounded-2xl">
              <table className="w-full text-left text-xs text-safaria-ivory/80">
                <thead className="bg-safaria-emeraldDark text-safaria-gold font-bold sticky top-0 border-b border-safaria-gold/20">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Customer / Agency</th>
                    <th className="p-3">Route / Details</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-safaria-gold/10">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-safaria-ivory/50">
                        No enquiries found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-safaria-emeraldDark/50">
                        <td className="p-3 font-mono font-bold text-safaria-gold">{row.id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.type === 'FLIGHT' ? 'bg-blue-900/60 text-blue-200' : 'bg-purple-900/60 text-purple-200'}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-safaria-ivory">{row.name}</div>
                          <div className="text-[11px] text-safaria-ivory/60 font-mono">{row.contact}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{row.origin} &rarr; {row.dest}</div>
                          <div className="text-[10px] text-safaria-ivory/50">{row.pax} • {row.dates}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={row.status}
                            onChange={(e) => onUpdateStatus(row.id, e.target.value)}
                            className="bg-safaria-emeraldDark border border-safaria-gold/30 rounded px-2 py-1 text-[11px] text-safaria-ivory"
                          >
                            <option value="NEW">NEW</option>
                            <option value="IN_REVIEW">IN_REVIEW</option>
                            <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://wa.me/8801674178437?text=Regarding%20Enquiry%20${row.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline font-bold"
                          >
                            WhatsApp &rarr;
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-safaria-ivory/50 flex justify-between items-center pt-2">
              <span>Persistence Layer: Local Storage + Supabase SQL Bridge</span>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(enquiries, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `safaria_enquiries_${new Date().toISOString().slice(0,10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="text-safaria-gold hover:underline"
              >
                Export JSON Log
              </button>
            </div>

          </div>
        </div>
      );
    }

    // =========================================================================
    // 10. MOUNT APPLICATION TO ROOT
    // =========================================================================
    const rootElement = document.getElementById('safaria-root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<SafariaApp />);
  </script>
</body>
</html>