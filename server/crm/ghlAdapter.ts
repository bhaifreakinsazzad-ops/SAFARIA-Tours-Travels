// ==============================================================================
// SAFARIA Tours & Travels — GoHighLevel (GHL) CRM Adapter
// Idempotent contact syncing and opportunity creation with durable outbox fallback
// ==============================================================================

import { enquiriesRepository, StoredFlightEnquiry, StoredAgencyApplication } from "@server/db/enquiriesRepository";
import { getErrorMessage } from "../utils/errorMessage";

export interface GhlSyncResult {
  success: boolean;
  contactId?: string;
  queued: boolean;
  message: string;
}

export const ghlAdapter = {
  /**
   * Sync flight enquiry into GHL CRM
   */
  async syncFlightEnquiry(enquiry: StoredFlightEnquiry): Promise<GhlSyncResult> {
    const apiKey = process.env.GHL_API_KEY || process.env.GHL_ACCESS_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;

    const fullPhone = `${enquiry.phoneCountryCode}${enquiry.phoneNumber.replace(/\D/g, "")}`;
    const idempotencyKey = `ghl_enquiry_${enquiry.id}`;

    // If GHL credentials are not provisioned (e.g. dev/staging environment), enqueue to outbox
    if (!apiKey || !locationId) {
      await enquiriesRepository.enqueueOutbox("GHL_CRM", "FLIGHT_ENQUIRY_CREATED", {
        referenceNo: enquiry.referenceNo,
        leadPassengerName: enquiry.leadPassengerName,
        phone: fullPhone,
        email: enquiry.email,
        tripType: enquiry.tripType,
        cabinClass: enquiry.cabinClass,
        passengers: enquiry.passengers,
        legs: enquiry.legs,
        notes: enquiry.specialNotes,
      }, idempotencyKey);

      return {
        success: true,
        queued: true,
        message: "GHL credentials not set; enquiry successfully enqueued in durable integration outbox",
      };
    }

    try {
      // Live GHL API v2 call
      const response = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          locationId,
          name: enquiry.leadPassengerName,
          phone: fullPhone,
          email: enquiry.email || undefined,
          tags: ["SAFARIA_LEAD", "FLIGHT_ENQUIRY", enquiry.tripType],
          customFields: [
            { id: "safaria_reference", value: enquiry.referenceNo },
            { id: "cabin_class", value: enquiry.cabinClass },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL API responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        contactId: data?.contact?.id,
        queued: false,
        message: "Successfully synchronized with GoHighLevel CRM",
      };
    } catch (err: unknown) {
      // On live API network or token failure, safely enqueue to outbox without failing client
      await enquiriesRepository.enqueueOutbox("GHL_CRM", "FLIGHT_ENQUIRY_RETRY", {
        referenceNo: enquiry.referenceNo,
        phone: fullPhone,
        error: getErrorMessage(err),
      }, idempotencyKey);

      return {
        success: true,
        queued: true,
        message: `GHL API temporarily unreachable (${getErrorMessage(err)}); queued for retry`,
      };
    }
  },

  /**
   * Sync B2B Agency Application into GHL CRM
   */
  async syncAgencyApplication(app: StoredAgencyApplication): Promise<GhlSyncResult> {
    const apiKey = process.env.GHL_API_KEY || process.env.GHL_ACCESS_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;
    const idempotencyKey = `ghl_agency_${app.id}`;

    if (!apiKey || !locationId) {
      await enquiriesRepository.enqueueOutbox("GHL_CRM", "B2B_APPLICATION_CREATED", {
        referenceNo: app.referenceNo,
        agencyName: app.agencyName,
        contactPerson: app.contactPerson,
        phone: app.phone,
        email: app.email,
        city: app.city,
        tradeLicense: app.tradeLicenseNumber,
      }, idempotencyKey);

      return {
        success: true,
        queued: true,
        message: "Agency application queued in durable outbox for CRM synchronization",
      };
    }

    try {
      const response = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          locationId,
          name: app.contactPerson,
          companyName: app.agencyName,
          phone: app.phone,
          email: app.email,
          city: app.city,
          tags: ["SAFARIA_B2B_PARTNER", "PENDING_VERIFICATION"],
          customFields: [
            { id: "b2b_reference", value: app.referenceNo },
            { id: "trade_license", value: app.tradeLicenseNumber || "" },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        contactId: data?.contact?.id,
        queued: false,
        message: "Agency synced to GoHighLevel CRM",
      };
    } catch (err: unknown) {
      await enquiriesRepository.enqueueOutbox("GHL_CRM", "B2B_APPLICATION_RETRY", {
        referenceNo: app.referenceNo,
        error: getErrorMessage(err),
      }, idempotencyKey);

      return {
        success: true,
        queued: true,
        message: `GHL unreachable, queued in outbox (${getErrorMessage(err)})`,
      };
    }
  },
};
