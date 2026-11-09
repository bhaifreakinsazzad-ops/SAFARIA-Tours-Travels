import { describe, it, expect } from "vitest";
import { buildWhatsAppQuotationUrl, buildWhatsAppAgencyUrl } from "@server/utils/whatsAppFormatter";

describe("WhatsApp URL Formatter", () => {
  it("should format quotation WhatsApp deep link containing reference number and route", () => {
    const payload = {
      referenceNo: "SFR-20261108-9K4W",
      leadPassengerName: "Tanvir Ahmed",
      tripType: "ONE_WAY",
      legs: [
        {
          originIata: "DAC",
          originCity: "Dhaka",
          destinationIata: "DXB",
          destinationCity: "Dubai",
          departureDate: "2026-12-01",
        },
      ],
      passengers: { adults: 2, children: 0, infants: 0 },
      cabinClass: "ECONOMY",
    };

    const url = buildWhatsAppQuotationUrl(payload);
    expect(url).toContain("https://wa.me/8801674178437");
    expect(url).toContain("SFR-20261108-9K4W");
    expect(url).toContain("Tanvir%20Ahmed");
    expect(url).toContain("DAC");
    expect(url).toContain("DXB");
    expect(url).toContain("2%20Adult(s)");
  });

  it("should format agency WhatsApp URL with trade verification follow-up", () => {
    const url = buildWhatsAppAgencyUrl("B2B-20261108-XYZ1", "Apex Travel Agency", "Nasim Khan");
    expect(url).toContain("https://wa.me/8801674178437");
    expect(url).toContain("B2B-20261108-XYZ1");
    expect(url).toContain("Apex%20Travel%20Agency");
  });
});
