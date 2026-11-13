import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as leadPost } from "@/app/api/b2b/lead/route";
import { POST as telemetryPost } from "@/app/api/telemetry/route";
import { GET as membershipGet } from "@/app/api/partner/membership/route";
import { POST as deskPost } from "@/app/api/partner/desk/route";
import { PATCH as adminAgenciesPatch } from "@/app/api/admin/agencies/route";
import { signSession } from "@server/auth/authService";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { AGENCY_PRICING, PILOT_ENTITLEMENTS, PAID_ENTITLEMENTS } from "@/config/constants";

describe("SAFARIA Directive 005 B2B Launch Suite", () => {
  const staffToken = signSession({
    jti: "test-admin-session",
    userId: "staff_test_01",
    email: "ops@safaria.vibing.world",
    role: "SUPER_ADMIN",
    agencyId: "SAFARIA_INTERNAL",
  });

  let activeAgencyId: string;
  let activePartnerToken: string;

  beforeEach(async () => {
    // Seed an active partner application for membership/desk tests
    const activeApp = await enquiriesRepository.createAgencyApplication({
      agencyName: "Skyview Aviation BD",
      contactPerson: "Ashikur Rahman",
      phone: "+8801712000000",
      email: "founder@skyviewbd.com",
      city: "Dhaka",
      tradeLicenseNumber: "TL-DAC-2026-991",
      yearsInBusiness: 4,
      monthlyTicketVolume: "20_TO_50",
      notes: "Active partner trial seed",
      consentAgreed: true,
    });

    // Mark as ACTIVE_PARTNER so verifySession accepts the partner
    await enquiriesRepository.updateAgencySubscription(activeApp.id, "MONTHLY", 30, "TEST_ADMIN");

    activeAgencyId = activeApp.id;
    activePartnerToken = signSession({
      userId: `user_${activeApp.id}`,
      email: activeApp.email,
      role: "B2B_PARTNER",
      agencyId: activeApp.id,
      agencyName: activeApp.agencyName,
    });
  });

  describe("Track A & D: Lead Capture and Contextual WhatsApp Concierge", () => {
    it("persists B2B lead, generates unique B2B reference, and returns structured WhatsApp URL", async () => {
      const payload = {
        agencyName: "Bengal Skyline Tours",
        contactName: "Kamrul Islam",
        phone: "+8801819001122",
        email: "kamrul@bengalskyline.com",
        district: "Sylhet",
        painCategory: "PAIN_BOOKING",
        planInterest: "MONTHLY" as const,
        expectedMonthlyVolume: "50_TO_100",
        consentAgreed: true as const,
      };

      const req = new NextRequest("http://localhost:3000/api/b2b/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify(payload),
      });

      const res = await leadPost(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.referenceNo).toMatch(/^B2B-\d{8}-[A-Z0-9]{4,8}$/);
      expect(data.whatsAppUrl).toContain("https://wa.me/");
      expect(data.whatsAppUrl).toContain(encodeURIComponent(data.referenceNo));
      expect(data.whatsAppUrl).toContain(encodeURIComponent("Bengal Skyline Tours"));

      // Verify lead is stored in repository
      const stored = await enquiriesRepository.getAgencyApplicationByRef(data.referenceNo);
      expect(stored).toBeDefined();
      expect(stored?.agencyName).toBe("Bengal Skyline Tours");
      expect(stored?.district).toBe("Sylhet");
      expect(stored?.painCategory).toBe("PAIN_BOOKING");
    });

    it("records WA_DRAFT_OPENED telemetry separately from confirmed inbound messages", async () => {
      // Create lead first
      const leadReq = new NextRequest("http://localhost:3000/api/b2b/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          agencyName: "Teesta Travel House",
          contactName: "Mahmud Hasan",
          phone: "+8801711223344",
          district: "Rangpur",
          painCategory: "PAIN_PAYMENT",
          planInterest: "ANNUAL",
          consentAgreed: true,
        }),
      });
      const leadRes = await leadPost(leadReq);
      const { referenceNo } = await leadRes.json();

      // Trigger telemetry
      const telemReq = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          event: "WA_DRAFT_OPENED",
          referenceNo,
          metadata: { plan: "ANNUAL" },
        }),
      });

      const telemRes = await telemetryPost(telemReq);
      expect(telemRes.status).toBe(200);
      const telemData = await telemRes.json();
      expect(telemData.success).toBe(true);

      const stored = await enquiriesRepository.getAgencyApplicationByRef(referenceNo);
      expect(stored?.whatsappDraftOpened).toBe(true);
      expect(Boolean(stored?.whatsappInboundConfirmed)).toBe(false);
    });
  });

  describe("Track B & F: Subscription Management & Admin Operations", () => {
    it("allows staff to approve 72-hour trial and issues temporary credentials", async () => {
      // Create a pending applicant
      const pendingApp = await enquiriesRepository.createAgencyApplication({
        agencyName: "Padma Voyages Ltd",
        contactPerson: "Rafiqul Islam",
        phone: "+8801911998877",
        email: "rafiq@padmavoyages.com",
        city: "Dhaka",
        tradeLicenseNumber: "TL-DAC-2026-PADMA",
        yearsInBusiness: 2,
        monthlyTicketVolume: "20_TO_50",
        notes: "Trial applicant",
        consentAgreed: true,
      });

      const grantReq = new NextRequest("http://localhost:3000/api/admin/agencies", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          id: pendingApp.id,
          action: "GRANT_TRIAL",
        }),
      });

      const grantRes = await adminAgenciesPatch(grantReq);
      expect(grantRes.status).toBe(200);
      const grantData = await grantRes.json();

      expect(grantData.success).toBe(true);
      expect(grantData.issuedPassword).toBeDefined();
      expect(typeof grantData.issuedPassword).toBe("string");
      expect(grantData.issuedPassword.length).toBeGreaterThanOrEqual(12);

      const updated = await enquiriesRepository.getAgencyApplicationById(pendingApp.id);
      expect(updated?.status).toBe("TRIAL_APPROVED");
      expect(updated?.trialExpiresAt).toBeDefined();
    });

    it("allows staff to create billing invoice and activate paid subscription", async () => {
      const all = await enquiriesRepository.listAgencyApplications();
      const target = all[0];

      // Create invoice
      const invReq = new NextRequest("http://localhost:3000/api/admin/agencies", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          id: target.id,
          action: "CREATE_INVOICE",
          amountBdt: AGENCY_PRICING.monthly,
          plan: "MONTHLY",
        }),
      });
      const invRes = await adminAgenciesPatch(invReq);
      expect(invRes.status).toBe(200);

      // Activate subscription
      const actReq = new NextRequest("http://localhost:3000/api/admin/agencies", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          Authorization: `Bearer ${staffToken}`,
        },
        body: JSON.stringify({
          id: target.id,
          action: "ACTIVATE_SUBSCRIPTION",
          plan: "MONTHLY",
          paymentReference: "BKASH-TRX-982184",
        }),
      });
      const actRes = await adminAgenciesPatch(actReq);
      expect(actRes.status).toBe(200);

      const updated = await enquiriesRepository.getAgencyApplicationById(target.id);
      expect(updated?.status).toBe("ACTIVE_PARTNER");

      // Verify invoice was updated to VERIFIED_PAID
      const invoices = await enquiriesRepository.listAgencyInvoices(target.id);
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices.some((inv) => inv.status === "VERIFIED_PAID")).toBe(true);
    });
  });

  describe("Track B & C: Partner Operations & Pilot Entitlement Enforcement", () => {
    it("returns membership quota usage and billing records to authenticated partner", async () => {
      const req = new NextRequest("http://localhost:3000/api/partner/membership", {
        headers: {
          Authorization: `Bearer ${activePartnerToken}`,
          origin: "http://localhost:3000",
        },
      });

      const res = await membershipGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.membership).toBeDefined();
      expect(data.membership.agencyId).toBe(activeAgencyId);
      expect(data.membership.usage).toBeDefined();
      expect(data.membership.usage.fareLimit).toBe(PAID_ENTITLEMENTS.fareRequestsLimit);
      expect(data.membership.usage.bookingLimit).toBe(PAID_ENTITLEMENTS.bookingRequestsLimit);
    });

    it("enforces pilot limits server-side on desk operations", async () => {
      // Create a trial-approved agency
      const trialApp = await enquiriesRepository.createAgencyApplication({
        agencyName: "Quota Test Travel",
        contactPerson: "Quota Tester",
        phone: "+8801999888777",
        email: "quota@testagency.com",
        city: "Dhaka",
        tradeLicenseNumber: "TL-DAC-2026-QUOTA",
        yearsInBusiness: 1,
        monthlyTicketVolume: "UNDER_20",
        notes: "Quota test",
        consentAgreed: true,
      });
      await enquiriesRepository.updateAgencyStatus(trialApp.id, "TRIAL_APPROVED", "SYSTEM", "Trial test");

      const trialPartnerToken = signSession({
        userId: `user_${trialApp.id}`,
        email: trialApp.email,
        role: "B2B_PARTNER",
        agencyId: trialApp.id,
        agencyName: trialApp.agencyName,
      });

      // Submit 20 fare checks to exhaust pilot allowance
      for (let i = 0; i < PILOT_ENTITLEMENTS.fareRequestsLimit; i++) {
        const fareReq = new NextRequest("http://localhost:3000/api/partner/desk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            origin: "http://localhost:3000",
            Authorization: `Bearer ${trialPartnerToken}`,
          },
          body: JSON.stringify({
            deskType: "FARE_DESK",
            title: `DAC-DXB Route Quote #${i + 1}`,
            payload: { origin: "DAC", destination: "DXB", date: "2026-12-01", pax: 1 },
          }),
        });
        const res = await deskPost(fareReq);
        expect(res.status).toBe(201);
      }

      // The 21st fare request must be blocked with HTTP 403
      const blockedReq = new NextRequest("http://localhost:3000/api/partner/desk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          Authorization: `Bearer ${trialPartnerToken}`,
        },
        body: JSON.stringify({
          deskType: "FARE_DESK",
          title: "DAC-BKK 21st Quote",
          payload: { origin: "DAC", destination: "BKK", date: "2026-12-05", pax: 1 },
        }),
      });

      const blockedRes = await deskPost(blockedReq);
      expect(blockedRes.status).toBe(403);
      const blockedData = await blockedRes.json();
      expect(blockedData.quotaExceeded).toBe(true);
      expect(blockedData.error).toContain("Pilot trial limit reached");
    });
  });
});
