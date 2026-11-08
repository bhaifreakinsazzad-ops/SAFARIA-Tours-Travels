// ==============================================================================
// SAFARIA Tours & Travels — WhatsApp Deep Link URL Formatter
// Builds clear, professional WhatsApp follow-up messages with reference numbers
// ==============================================================================

import { SITE_CONFIG } from "@/lib/config/siteConfig";

export interface WhatsAppFlightPayload {
  referenceNo: string;
  leadPassengerName: string;
  tripType: string;
  legs: Array<{
    originIata: string;
    originCity: string;
    destinationIata: string;
    destinationCity: string;
    departureDate: string;
  }>;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: string;
}

export function buildWhatsAppQuotationUrl(payload: WhatsAppFlightPayload): string {
  const phone = SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "");

  const legsSummary = payload.legs
    .map(
      (leg, idx) =>
        `  Leg ${idx + 1}: ${leg.originCity} (${leg.originIata}) ➔ ${leg.destinationCity} (${leg.destinationIata}) on ${leg.departureDate}`
    )
    .join("\n");

  const paxSummary = `${payload.passengers.adults} Adult(s)${
    payload.passengers.children > 0 ? `, ${payload.passengers.children} Child` : ""
  }${payload.passengers.infants > 0 ? `, ${payload.passengers.infants} Infant` : ""}`;

  const messageText = `Assalamu Alaikum / Greetings SAFARIA Travel Team,

I have submitted a Flight Quotation Request on your website.

📌 *Quotation Reference:* ${payload.referenceNo}
👤 *Lead Passenger:* ${payload.leadPassengerName}
✈️ *Trip Type:* ${payload.tripType.replace("_", " ")}
💺 *Cabin:* ${payload.cabinClass}
👥 *Passengers:* ${paxSummary}

🛫 *Itinerary:*
${legsSummary}

Please verify available airline schedules and send me the best quotation options. Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
}

export function buildWhatsAppAgencyUrl(referenceNo: string, agencyName: string, contactPerson: string): string {
  const phone = SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "");
  const messageText = `Assalamu Alaikum SAFARIA B2B Team,

Our agency has submitted a B2B Partnership & Trial Application.

📌 *Reference No:* ${referenceNo}
🏢 *Agency:* ${agencyName}
👤 *Contact Person:* ${contactPerson}

We have submitted our trade details and would like to follow up on the account verification.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
}
