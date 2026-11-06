import rawDestinations from "./destinations.json";
import rawOffers from "./offers.json";
import type { Language } from "@/lib/atlas-data";

export type Destination = {
  code: string;
  city: string;
  country: string;
  region: "domestic" | "international";
  lat: number;
  lon: number;
  origin: boolean;
};
export type OfferCategory = "flights" | "student" | "saudi" | "premium" | "care" | "services";
export type Offer = {
  id: string;
  category: OfferCategory;
  bn_title: string;
  en_title: string;
  bn_description: string;
  en_description: string;
  badge: string;
  mode: string;
  preset: string;
};

export const destinations = rawDestinations as Destination[];
export const offers = rawOffers as Offer[];
export const offerCategories: OfferCategory[] = ["flights", "student", "saudi", "premium", "care", "services"];

const bnCities: Record<string, string> = {
  DAC: "ঢাকা", CGP: "চট্টগ্রাম", CXB: "কক্সবাজার", ZYL: "সিলেট", SPD: "সৈয়দপুর", RJH: "রাজশাহী", JSR: "যশোর", BZL: "বরিশাল",
  MAA: "চেন্নাই", KTM: "কাঠমান্ডু", BKK: "ব্যাংকক", KUL: "কুয়ালালামপুর", SIN: "সিঙ্গাপুর", DXB: "দুবাই", AUH: "আবুধাবি", DOH: "দোহা",
  JED: "জেদ্দা", RUH: "রিয়াদ", DMM: "দাম্মাম", MCT: "মাস্কাট", CAN: "গুয়াংজু", BJS: "বেইজিং", MED: "মদিনা", LON: "লন্ডন",
  ROM: "রোম", YTO: "টরন্টো", TYO: "টোকিও", NYC: "নিউইয়র্ক", FL: "ফ্লোরিডা", SYD: "সিডনি", SEL: "সিউল", IST: "ইস্তাম্বুল", CPT: "কেপ টাউন",
};
const bnCountries: Record<string, string> = {
  Bangladesh: "বাংলাদেশ", India: "ভারত", Nepal: "নেপাল", Thailand: "থাইল্যান্ড", Malaysia: "মালয়েশিয়া", Singapore: "সিঙ্গাপুর", UAE: "সংযুক্ত আরব আমিরাত", Qatar: "কাতার", "Saudi Arabia": "সৌদি আরব", Oman: "ওমান", China: "চীন", "United Kingdom": "যুক্তরাজ্য", Italy: "ইতালি", Canada: "কানাডা", Japan: "জাপান", USA: "যুক্তরাষ্ট্র", Australia: "অস্ট্রেলিয়া", "South Korea": "দক্ষিণ কোরিয়া", Türkiye: "তুরস্ক", "South Africa": "দক্ষিণ আফ্রিকা",
};

export function cityName(destination: Destination, language: Language) { return language === "bn" ? bnCities[destination.code] ?? destination.city : destination.city; }
export function countryName(destination: Destination, language: Language) { return language === "bn" ? bnCountries[destination.country] ?? destination.country : destination.country; }
export function destinationByCode(code: string) { return destinations.find((destination) => destination.code === code); }
export function offerById(id: string) { return offers.find((offer) => offer.id === id); }

export function destinationForPreset(preset: string) {
  const [place, airline = ""] = preset.split("|").map((value) => value.trim());
  if (!place) return { code: "", airline };
  const normalized = place.toLowerCase().replace(/[’']/g, "");
  const city = destinations.find((item) => item.city.toLowerCase().replace(/[’']/g, "") === normalized);
  const country = destinations.find((item) => item.country.toLowerCase() === normalized && !item.origin);
  return { code: city?.code ?? (country ? `COUNTRY:${country.country}` : ""), airline };
}
