"use client";

import { create } from "zustand";
import type { Language } from "./atlas-data";

type SiteState = {
  language: Language;
  selectedCode: string;
  selectedOfferId: string;
  enquiryOpen: boolean;
  setLanguage: (language: Language) => void;
  openEnquiry: (code?: string) => void;
  openOfferEnquiry: (offerId: string, code?: string) => void;
  closeEnquiry: () => void;
};

export const useSiteStore = create<SiteState>((set) => ({
  language: "bn",
  selectedCode: "",
  selectedOfferId: "",
  enquiryOpen: false,
  setLanguage: (language) => set({ language }),
  openEnquiry: (code = "") => set({ selectedCode: code, selectedOfferId: "", enquiryOpen: true }),
  openOfferEnquiry: (offerId, code = "") => set({ selectedCode: code, selectedOfferId: offerId, enquiryOpen: true }),
  closeEnquiry: () => set({ enquiryOpen: false }),
}));
