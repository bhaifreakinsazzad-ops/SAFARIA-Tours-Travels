"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Globe2, ShieldCheck, MessageCircle } from "lucide-react";
import { whatsappHrefFor } from "@/config/constants";

export function MobilePwaNav() {
  const pathname = usePathname();

  // Hide in full admin desktop view
  if (pathname.startsWith("/admin")) return null;

  const b2bWhatsappUrl = whatsappHrefFor(
    "SAFARIA B2B ENQUIRY\nRequest: Hello SAFARIA Ops, I would like to enquire about travel agency partnership and pilot trial."
  );

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
    { href: "/b2b", label: "B2B SaaS", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/#atlas", label: "Atlas", icon: <Globe2 className="h-4 w-4" /> },
    { href: "/partner", label: "Partner", icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  return (
    <nav aria-label="Mobile app navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#c5a059]/30 bg-[#031412]/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around text-[10px]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${
              isActive ? "text-[#c5a059] font-bold" : "text-[#a3b8b0] hover:text-[#f7f2ea]"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
      <a
        href={b2bWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-0.5 p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}
