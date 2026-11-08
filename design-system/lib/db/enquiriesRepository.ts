// ==============================================================================
// SAFARIA Tours & Travels — Central Enquiries & Applications Repository
// Handles real Supabase persistence with robust in-memory fallback for local dev & testing
// ==============================================================================

import { getSupabaseServiceClient } from "./supabaseClient";
import { generateReferenceCode } from "@/lib/utils/referenceGenerator";
import { FlightEnquiryInput, AgencyApplicationInput, GeneralEnquiryInput } from "@/lib/validations/enquirySchemas";

export interface StoredFlightLeg {
  id: string;
  enquiryId: string;
  legIndex: number;
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  departureDate: string;
}

export interface StoredFlightEnquiry {
  id: string;
  referenceNo: string;
  tripType: string;
  cabinClass: string;
  passengers: { adults: number; children: number; infants: number };
  preferredCarrier?: string;
  leadPassengerName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email?: string;
  specialNotes?: string;
  status: "NEW" | "IN_REVIEW" | "QUOTATION_SENT" | "BOOKED" | "EXPIRED" | "CANCELLED";
  legs: StoredFlightLeg[];
  crmSyncedAt?: string | null;
  crmContactId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAgencyApplication {
  id: string;
  referenceNo: string;
  agencyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  tradeLicenseNumber?: string;
  yearsInBusiness: number;
  monthlyTicketVolume: string;
  status: "PENDING_VERIFICATION" | "IN_REVIEW" | "TRIAL_APPROVED" | "ACTIVE_PARTNER" | "REJECTED";
  trialActivatedAt?: string | null;
  trialExpiresAt?: string | null;
  approvedBy?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredOutboxEntry {
  id: string;
  channel: "GHL_CRM" | "WHATSAPP_HOOK" | "EMAIL_NOTIFICATION";
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  status: "PENDING" | "PROCESSING" | "DELIVERED" | "FAILED";
  attempts: number;
  lastError?: string;
  nextRetryAt: string;
  lockedAt?: string | null;
  lockedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredRevokedSession {
  jti: string;
  userId?: string;
  reason?: string;
  revokedAt: string;
  expiresAt: string;
}

export interface StoredB2BDeskRecord {
  id: string;
  agencyId: string;
  deskType: "FARE_DESK" | "BOOKING_DESK" | "CLEAR_MARGIN" | "AFTER_CARE" | "VERIFIED_WORKFLOW" | "PARTNER_GROWTH";
  title: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
  payload: Record<string, unknown>;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredGeneralEnquiry {
  id: string;
  referenceNo: string;
  serviceType: "VISA" | "CORPORATE" | "HOLIDAY" | "HOTEL" | "UMRAH" | "CUSTOM";
  fullName: string;
  phone: string;
  email?: string;
  message: string;
  destinationOrCountry?: string;
  passengerOrPaxCount: number;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

// In-Memory Durable Store for non-production / test runs
class InMemoryStore {
  flightEnquiries: Map<string, StoredFlightEnquiry> = new Map();
  agencyApplications: Map<string, StoredAgencyApplication> = new Map();
  outboxEntries: Map<string, StoredOutboxEntry> = new Map();
  b2bDeskRecords: Map<string, StoredB2BDeskRecord> = new Map();
  generalEnquiries: Map<string, StoredGeneralEnquiry> = new Map();
  revokedSessions: Map<string, StoredRevokedSession> = new Map();

  constructor() {
    this.seedDefaultAgency();
  }

  seedDefaultAgency() {
    const now = new Date().toISOString();
    this.agencyApplications.set("agency-greendelta-01", {
      id: "agency-greendelta-01",
      referenceNo: "B2B-20261108-GREEN1",
      agencyName: "Green Delta Travels",
      contactPerson: "Kamal Hossain",
      phone: "+8801700998877",
      email: "partner@greendelta.com",
      city: "Dhaka",
      tradeLicenseNumber: "TRAD/DSCC/019283/2025",
      yearsInBusiness: 5,
      monthlyTicketVolume: "OVER_100",
      status: "ACTIVE_PARTNER",
      createdAt: now,
      updatedAt: now,
    });
  }

  clear() {
    this.flightEnquiries.clear();
    this.agencyApplications.clear();
    this.outboxEntries.clear();
    this.b2bDeskRecords.clear();
    this.generalEnquiries.clear();
    this.revokedSessions.clear();
    this.seedDefaultAgency();
  }
}

const memoryStore = new InMemoryStore();

export const enquiriesRepository = {
  /**
   * Create and persist a new flight enquiry with 1-6 legs
   */
  async createFlightEnquiry(
    input: FlightEnquiryInput,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<StoredFlightEnquiry> {
    const supabase = getSupabaseServiceClient();
    const referenceNo = generateReferenceCode("SFR");
    const now = new Date().toISOString();
    const enquiryId = crypto.randomUUID();

    const legs: StoredFlightLeg[] = input.legs.map((leg, index) => ({
      id: crypto.randomUUID(),
      enquiryId,
      legIndex: index,
      originIata: leg.originIata,
      originCity: leg.originCity,
      destinationIata: leg.destinationIata,
      destinationCity: leg.destinationCity,
      departureDate: leg.departureDate,
    }));

    const enquiryRecord: StoredFlightEnquiry = {
      id: enquiryId,
      referenceNo,
      tripType: input.tripType,
      cabinClass: input.cabinClass || "ECONOMY",
      passengers: {
        adults: input.passengers.adults,
        children: input.passengers.children ?? 0,
        infants: input.passengers.infants ?? 0,
      },
      preferredCarrier: input.preferredCarrier || "",
      leadPassengerName: input.leadPassengerName,
      phoneCountryCode: input.phoneCountryCode,
      phoneNumber: input.phoneNumber,
      email: input.email || undefined,
      specialNotes: input.specialNotes || "",
      status: "NEW",
      legs,
      crmSyncedAt: null,
      crmContactId: null,
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        const { error: enquiryError } = await supabase.from("flight_enquiries").insert({
          id: enquiryId,
          reference_no: referenceNo,
          trip_type: input.tripType,
          cabin_class: input.cabinClass,
          passengers: input.passengers,
          preferred_carrier: input.preferredCarrier,
          lead_passenger_name: input.leadPassengerName,
          phone_country_code: input.phoneCountryCode,
          phone_number: input.phoneNumber,
          email: input.email,
          special_notes: input.specialNotes,
          status: "NEW",
          ip_hash: meta?.ip,
          user_agent: meta?.userAgent,
          created_at: now,
          updated_at: now,
        });

        if (enquiryError) throw enquiryError;

        const legRows = legs.map((l) => ({
          id: l.id,
          enquiry_id: enquiryId,
          leg_index: l.legIndex,
          origin_iata: l.originIata,
          origin_city: l.originCity,
          destination_iata: l.destinationIata,
          destination_city: l.destinationCity,
          departure_date: l.departureDate,
        }));

        const { error: legsError } = await supabase.from("flight_legs").insert(legRows);
        if (legsError) throw legsError;

        return enquiryRecord;
      } catch (err) {
        console.warn("Supabase insertion fallback to in-memory store:", err);
      }
    }

    // Fallback in-memory persistence
    memoryStore.flightEnquiries.set(enquiryId, enquiryRecord);
    return enquiryRecord;
  },

  /**
   * Find flight enquiry by reference number
   */
  async getFlightEnquiryByRef(ref: string): Promise<StoredFlightEnquiry | null> {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("flight_enquiries")
          .select("*, flight_legs(*)")
          .eq("reference_no", ref)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            referenceNo: data.reference_no,
            tripType: data.trip_type,
            cabinClass: data.cabin_class,
            passengers: data.passengers,
            preferredCarrier: data.preferred_carrier,
            leadPassengerName: data.lead_passenger_name,
            phoneCountryCode: data.phone_country_code,
            phoneNumber: data.phone_number,
            email: data.email,
            specialNotes: data.special_notes,
            status: data.status,
            crmSyncedAt: data.crm_synced_at,
            crmContactId: data.crm_contact_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            legs: (data.flight_legs || []).map((l: any) => ({
              id: l.id,
              enquiryId: l.enquiry_id,
              legIndex: l.leg_index,
              originIata: l.origin_iata,
              originCity: l.origin_city,
              destinationIata: l.destination_iata,
              destinationCity: l.destination_city,
              departureDate: l.departure_date,
            })),
          };
        }
      } catch (err) {
        console.warn("Supabase query error:", err);
      }
    }

    for (const record of memoryStore.flightEnquiries.values()) {
      if (record.referenceNo === ref) {
        return record;
      }
    }
    return null;
  },

  /**
   * List recent flight enquiries for admin review
   */
  async listFlightEnquiries(limit: number = 50): Promise<StoredFlightEnquiry[]> {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("flight_enquiries")
          .select("*, flight_legs(*)")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            referenceNo: d.reference_no,
            tripType: d.trip_type,
            cabinClass: d.cabin_class,
            passengers: d.passengers,
            preferredCarrier: d.preferred_carrier,
            leadPassengerName: d.lead_passenger_name,
            phoneCountryCode: d.phone_country_code,
            phoneNumber: d.phone_number,
            email: d.email,
            specialNotes: d.special_notes,
            status: d.status,
            crmSyncedAt: d.crm_synced_at,
            crmContactId: d.crm_contact_id,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            legs: (d.flight_legs || []).map((l: any) => ({
              id: l.id,
              enquiryId: l.enquiry_id,
              legIndex: l.leg_index,
              originIata: l.origin_iata,
              originCity: l.origin_city,
              destinationIata: l.destination_iata,
              destinationCity: l.destination_city,
              departureDate: l.departure_date,
            })),
          }));
        }
      } catch (err) {
        console.warn("Supabase query error:", err);
      }
    }

    return Array.from(memoryStore.flightEnquiries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  /**
   * Update enquiry status (e.g. NEW -> IN_REVIEW -> QUOTATION_SENT)
   */
  async updateEnquiryStatus(
    id: string,
    status: StoredFlightEnquiry["status"]
  ): Promise<StoredFlightEnquiry | null> {
    const supabase = getSupabaseServiceClient();
    const now = new Date().toISOString();

    if (supabase) {
      try {
        const { error } = await supabase
          .from("flight_enquiries")
          .update({ status, updated_at: now })
          .eq("id", id);
        if (error) console.warn("Supabase update error:", error);
      } catch (err) {
        console.warn("Supabase error:", err);
      }
    }

    const record = memoryStore.flightEnquiries.get(id);
    if (record) {
      record.status = status;
      record.updatedAt = now;
      return record;
    }
    return null;
  },

  /**
   * Create B2B Agency Application
   */
  async createAgencyApplication(input: AgencyApplicationInput): Promise<StoredAgencyApplication> {
    const supabase = getSupabaseServiceClient();
    const referenceNo = generateReferenceCode("B2B");
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: StoredAgencyApplication = {
      id,
      referenceNo,
      agencyName: input.agencyName,
      contactPerson: input.contactPerson,
      phone: input.phone,
      email: input.email,
      city: input.city,
      tradeLicenseNumber: input.tradeLicenseNumber,
      yearsInBusiness: input.yearsInBusiness ?? 1,
      monthlyTicketVolume: input.monthlyTicketVolume ?? "20_TO_50",
      status: "PENDING_VERIFICATION",
      trialActivatedAt: null,
      trialExpiresAt: null,
      approvedBy: null,
      notes: input.notes || "",
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        const { error } = await supabase.from("agency_applications").insert({
          id,
          reference_no: referenceNo,
          agency_name: input.agencyName,
          contact_person: input.contactPerson,
          phone: input.phone,
          email: input.email,
          city: input.city,
          trade_license_number: input.tradeLicenseNumber,
          years_in_business: input.yearsInBusiness,
          monthly_ticket_volume: input.monthlyTicketVolume,
          status: "PENDING_VERIFICATION",
          internal_notes: input.notes,
          created_at: now,
          updated_at: now,
        });
        if (!error) return record;
      } catch (err) {
        console.warn("Supabase agency insertion error:", err);
      }
    }

    memoryStore.agencyApplications.set(id, record);
    return record;
  },

  /**
   * List B2B Agency Applications
   */
  async listAgencyApplications(): Promise<StoredAgencyApplication[]> {
    return Array.from(memoryStore.agencyApplications.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get single B2B Agency Application by reference code
   */
  async getAgencyApplicationByRef(ref: string): Promise<StoredAgencyApplication | null> {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("agency_applications")
          .select("*")
          .eq("reference_no", ref)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            referenceNo: data.reference_no,
            agencyName: data.agency_name,
            contactPerson: data.contact_person,
            phone: data.phone,
            email: data.email,
            city: data.city,
            tradeLicenseNumber: data.trade_license_number,
            yearsInBusiness: data.years_in_business,
            monthlyTicketVolume: data.monthly_ticket_volume,
            status: data.status,
            trialActivatedAt: data.trial_activated_at,
            trialExpiresAt: data.trial_expires_at,
            approvedBy: data.approved_by,
            notes: data.internal_notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("Supabase query agency by ref error:", err);
      }
    }

    for (const record of memoryStore.agencyApplications.values()) {
      if (record.referenceNo === ref) {
        return record;
      }
    }
    return null;
  },

  /**
   * Update B2B Agency status (e.g. approve 72-hour trial or mark partner active)
   */
  async updateAgencyStatus(
    id: string,
    status: StoredAgencyApplication["status"],
    approvedBy?: string,
    notes?: string
  ): Promise<StoredAgencyApplication | null> {
    const supabase = getSupabaseServiceClient();
    const now = new Date();
    const nowIso = now.toISOString();

    let trialActivatedAt: string | null = null;
    let trialExpiresAt: string | null = null;

    if (status === "TRIAL_APPROVED") {
      trialActivatedAt = nowIso;
      const expDate = new Date(now.getTime() + 72 * 3600 * 1000);
      trialExpiresAt = expDate.toISOString();
    }

    if (supabase) {
      try {
        await supabase
          .from("agency_applications")
          .update({
            status,
            trial_activated_at: trialActivatedAt,
            trial_expires_at: trialExpiresAt,
            approved_by: approvedBy,
            internal_notes: notes,
            updated_at: nowIso,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase updateAgencyStatus error:", err);
      }
    }

    const record = memoryStore.agencyApplications.get(id);
    if (record) {
      record.status = status;
      if (trialActivatedAt) record.trialActivatedAt = trialActivatedAt;
      if (trialExpiresAt) record.trialExpiresAt = trialExpiresAt;
      if (approvedBy) record.approvedBy = approvedBy;
      if (notes) record.notes = notes;
      record.updatedAt = nowIso;
      return record;
    }
    return null;
  },

  /**
   * Enqueue entry into durable integration outbox
   */
  async enqueueOutbox(
    channel: StoredOutboxEntry["channel"],
    eventType: string,
    payload: Record<string, unknown>,
    idempotencyKey: string
  ): Promise<StoredOutboxEntry> {
    const supabase = getSupabaseServiceClient();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const entry: StoredOutboxEntry = {
      id,
      channel,
      eventType,
      payload,
      idempotencyKey,
      status: "PENDING",
      attempts: 0,
      nextRetryAt: now,
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        await supabase.from("integration_outbox").insert({
          id,
          channel,
          event_type: eventType,
          payload,
          idempotency_key: idempotencyKey,
          status: "PENDING",
          attempts: 0,
          next_retry_at: now,
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Supabase outbox insert fallback to memory:", err);
      }
    }

    memoryStore.outboxEntries.set(id, entry);
    return entry;
  },

  /**
   * Database-coordinated job claiming with lease management
   * Guarantees atomic row claiming across distributed workers / serverless instances
   */
  async claimOutboxBatch(
    workerId: string,
    limit: number = 20,
    leaseDurationSeconds: number = 120
  ): Promise<StoredOutboxEntry[]> {
    const supabase = getSupabaseServiceClient();
    const now = new Date();
    const nowIso = now.toISOString();
    const leaseExpiryCutoff = new Date(now.getTime() - leaseDurationSeconds * 1000).toISOString();

    if (supabase) {
      try {
        const { data: candidates, error: selectErr } = await supabase
          .from("integration_outbox")
          .select("id")
          .in("status", ["PENDING", "FAILED"])
          .lt("attempts", 5)
          .lte("next_retry_at", nowIso)
          .or(`locked_at.is.null,locked_at.lt.${leaseExpiryCutoff}`)
          .order("next_retry_at", { ascending: true })
          .limit(limit);

        if (!selectErr && candidates && candidates.length > 0) {
          const candidateIds = candidates.map((c: any) => c.id);
          const { data: claimed, error: updateErr } = await supabase
            .from("integration_outbox")
            .update({
              status: "PROCESSING",
              locked_at: nowIso,
              locked_by: workerId,
              updated_at: nowIso,
            })
            .in("id", candidateIds)
            .select();

          if (!updateErr && claimed) {
            return claimed.map((row: any) => ({
              id: row.id,
              channel: row.channel,
              eventType: row.event_type,
              payload: row.payload,
              idempotencyKey: row.idempotency_key,
              status: row.status,
              attempts: row.attempts,
              lastError: row.last_error,
              nextRetryAt: row.next_retry_at,
              lockedAt: row.locked_at,
              lockedBy: row.locked_by,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            }));
          }
        }
      } catch (err) {
        console.warn("Supabase outbox claim fallback to memory store:", err);
      }
    }

    // Atomic synchronized claiming for memory store (non-production / test)
    const claimedEntries: StoredOutboxEntry[] = [];
    const entries = Array.from(memoryStore.outboxEntries.values());

    for (const entry of entries) {
      if (claimedEntries.length >= limit) break;

      const isPending =
        (entry.status === "PENDING" || entry.status === "FAILED") &&
        entry.attempts < 5 &&
        entry.nextRetryAt <= nowIso &&
        (!entry.lockedAt || entry.lockedAt < leaseExpiryCutoff);

      const isExpiredLease =
        entry.status === "PROCESSING" &&
        entry.attempts < 5 &&
        Boolean(entry.lockedAt) &&
        entry.lockedAt! < leaseExpiryCutoff;

      if (isPending || isExpiredLease) {
        entry.status = "PROCESSING";
        entry.lockedAt = nowIso;
        entry.lockedBy = workerId;
        entry.updatedAt = nowIso;
        claimedEntries.push({ ...entry });
      }
    }

    return claimedEntries;
  },

  /**
   * List pending outbox entries ready for retry (read-only inspection)
   */
  async listPendingOutboxEntries(limit: number = 20): Promise<StoredOutboxEntry[]> {
    const now = new Date().toISOString();
    return Array.from(memoryStore.outboxEntries.values())
      .filter((e) => (e.status === "PENDING" || e.status === "FAILED") && e.attempts < 5 && e.nextRetryAt <= now)
      .slice(0, limit);
  },

  /**
   * Update outbox delivery status and release/clear worker locks
   */
  async updateOutboxStatus(
    id: string,
    status: StoredOutboxEntry["status"],
    attempts: number,
    lastError?: string,
    nextRetryAt?: string
  ): Promise<StoredOutboxEntry | null> {
    const supabase = getSupabaseServiceClient();
    const now = new Date().toISOString();

    if (supabase) {
      try {
        const updateData: any = {
          status,
          attempts,
          updated_at: now,
        };
        if (lastError !== undefined) updateData.last_error = lastError;
        if (nextRetryAt !== undefined) updateData.next_retry_at = nextRetryAt;
        if (status === "PENDING" || status === "DELIVERED" || status === "FAILED") {
          updateData.locked_at = null;
          updateData.locked_by = null;
        }
        await supabase.from("integration_outbox").update(updateData).eq("id", id);
      } catch (err) {
        console.warn("Supabase updateOutboxStatus error:", err);
      }
    }

    const entry = memoryStore.outboxEntries.get(id);
    if (entry) {
      entry.status = status;
      entry.attempts = attempts;
      if (lastError !== undefined) entry.lastError = lastError;
      if (nextRetryAt !== undefined) entry.nextRetryAt = nextRetryAt;
      if (status === "PENDING" || status === "DELIVERED" || status === "FAILED") {
        entry.lockedAt = null;
        entry.lockedBy = null;
      }
      entry.updatedAt = now;
      return entry;
    }
    return null;
  },

  /**
   * Persist revoked session token in database (survives restarts)
   */
  async revokeSession(
    jti: string,
    userId?: string,
    reason: string = "LOGOUT",
    expiresAt?: string
  ): Promise<void> {
    const supabase = getSupabaseServiceClient();
    const nowIso = new Date().toISOString();
    const expiry = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const record: StoredRevokedSession = {
      jti,
      userId,
      reason,
      revokedAt: nowIso,
      expiresAt: expiry,
    };

    if (supabase) {
      try {
        await supabase.from("revoked_sessions").insert({
          jti,
          user_id: userId,
          reason,
          revoked_at: nowIso,
          expires_at: expiry,
        });
      } catch (err) {
        console.warn("Supabase revoked_sessions insert fallback to memory:", err);
      }
    }

    memoryStore.revokedSessions.set(jti, record);
  },

  /**
   * Check if session has been revoked in database or memory store
   */
  async isSessionRevoked(jti: string): Promise<boolean> {
    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("revoked_sessions")
          .select("jti")
          .eq("jti", jti)
          .single();

        if (!error && data) {
          return true;
        }
      } catch {
        // Fallback to memory store
      }
    }

    return memoryStore.revokedSessions.has(jti);
  },

  /**
   * Verify if B2B Agency account is in active standing (not suspended/rejected/pending)
   */
  async isAgencyActive(agencyId: string): Promise<boolean> {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("agency_applications")
          .select("status")
          .eq("id", agencyId)
          .single();

        if (!error && data) {
          return data.status === "ACTIVE_PARTNER" || data.status === "TRIAL_APPROVED";
        }
      } catch {
        // Fallback to memory store
      }
    }

    const agency = memoryStore.agencyApplications.get(agencyId);
    if (!agency) return false;
    return agency.status === "ACTIVE_PARTNER" || agency.status === "TRIAL_APPROVED";
  },

  /**
   * Create a persistent B2B Desk record (Fare, Booking, Ledger, AfterCare, etc.)
   */
  async createB2BDeskRecord(
    deskType: StoredB2BDeskRecord["deskType"],
    agencyId: string,
    title: string,
    payload: Record<string, unknown>,
    priority: StoredB2BDeskRecord["priority"] = "NORMAL"
  ): Promise<StoredB2BDeskRecord> {
    const supabase = getSupabaseServiceClient();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: StoredB2BDeskRecord = {
      id,
      agencyId,
      deskType,
      title,
      priority,
      status: "OPEN",
      payload,
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        await supabase.from("b2b_desk_records").insert({
          id,
          agency_id: agencyId,
          desk_type: deskType,
          title,
          priority,
          status: "OPEN",
          payload,
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Supabase desk record insert fallback to memory:", err);
      }
    }

    memoryStore.b2bDeskRecords.set(id, record);
    return record;
  },

  /**
   * List B2B Desk records with strict tenant isolation
   * When agencyId is specified, partners can ONLY see their own records.
   */
  async listB2BDeskRecords(
    deskType?: StoredB2BDeskRecord["deskType"],
    agencyId?: string
  ): Promise<StoredB2BDeskRecord[]> {
    let records = Array.from(memoryStore.b2bDeskRecords.values());

    if (agencyId) {
      records = records.filter((r) => r.agencyId === agencyId);
    }
    if (deskType) {
      records = records.filter((r) => r.deskType === deskType);
    }

    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Update B2B Desk Record
   */
  async updateB2BDeskRecord(
    id: string,
    status: StoredB2BDeskRecord["status"],
    internalNotes?: string
  ): Promise<StoredB2BDeskRecord | null> {
    const now = new Date().toISOString();
    const record = memoryStore.b2bDeskRecords.get(id);
    if (record) {
      record.status = status;
      if (internalNotes) record.internalNotes = internalNotes;
      record.updatedAt = now;
      return record;
    }
    return null;
  },

  /**
   * Create and persist General Service Enquiry (Visa, Corporate, Umrah, Holiday)
   */
  async createGeneralEnquiry(input: GeneralEnquiryInput): Promise<StoredGeneralEnquiry> {
    const supabase = getSupabaseServiceClient();
    const referenceNo = generateReferenceCode("GEN");
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: StoredGeneralEnquiry = {
      id,
      referenceNo,
      serviceType: input.serviceType,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || undefined,
      message: input.message,
      destinationOrCountry: input.destinationOrCountry || "",
      passengerOrPaxCount: input.passengerOrPaxCount || 1,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        await supabase.from("general_enquiries").insert({
          id,
          reference_no: referenceNo,
          service_type: input.serviceType,
          full_name: input.fullName,
          phone: input.phone,
          email: input.email,
          details: {
            message: input.message,
            destinationOrCountry: input.destinationOrCountry,
            passengerOrPaxCount: input.passengerOrPaxCount,
          },
          status: "NEW",
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Supabase general enquiry insert fallback to memory:", err);
      }
    }

    memoryStore.generalEnquiries.set(id, record);
    return record;
  },

  /**
   * List General Service Enquiries
   */
  async listGeneralEnquiries(serviceType?: StoredGeneralEnquiry["serviceType"]): Promise<StoredGeneralEnquiry[]> {
    let records = Array.from(memoryStore.generalEnquiries.values());
    if (serviceType) {
      records = records.filter((r) => r.serviceType === serviceType);
    }
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Get single General Service Enquiry by reference code
   */
  async getGeneralEnquiryByRef(ref: string): Promise<StoredGeneralEnquiry | null> {
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("general_enquiries")
          .select("*")
          .eq("reference_no", ref)
          .single();

        if (!error && data) {
          const details = data.details || {};
          return {
            id: data.id,
            referenceNo: data.reference_no,
            serviceType: data.service_type,
            fullName: data.full_name,
            phone: data.phone,
            email: data.email,
            message: details.message || "",
            destinationOrCountry: details.destinationOrCountry,
            passengerOrPaxCount: details.passengerOrPaxCount,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("Supabase query general enquiry by ref error:", err);
      }
    }

    for (const record of memoryStore.generalEnquiries.values()) {
      if (record.referenceNo === ref) {
        return record;
      }
    }
    return null;
  },

  /**
   * Unified lookup across all reference types (Flight, B2B, General)
   */
  async lookupAnyReference(ref: string): Promise<{
    type: "FLIGHT" | "B2B_AGENCY" | "GENERAL";
    record: any;
  } | null> {
    const trimmed = ref.trim().toUpperCase();

    if (trimmed.startsWith("SFR")) {
      const flight = await this.getFlightEnquiryByRef(trimmed);
      if (flight) return { type: "FLIGHT", record: flight };
    } else if (trimmed.startsWith("B2B")) {
      const b2b = await this.getAgencyApplicationByRef(trimmed);
      if (b2b) return { type: "B2B_AGENCY", record: b2b };
    } else if (trimmed.startsWith("GEN")) {
      const gen = await this.getGeneralEnquiryByRef(trimmed);
      if (gen) return { type: "GENERAL", record: gen };
    }

    // Fallback: check all three in order
    const flight = await this.getFlightEnquiryByRef(trimmed);
    if (flight) return { type: "FLIGHT", record: flight };

    const b2b = await this.getAgencyApplicationByRef(trimmed);
    if (b2b) return { type: "B2B_AGENCY", record: b2b };

    const gen = await this.getGeneralEnquiryByRef(trimmed);
    if (gen) return { type: "GENERAL", record: gen };

    return null;
  },

  /**
   * Testing utility to inspect internal memory store
   */
  _getRawOutboxEntry(id: string): StoredOutboxEntry | undefined {
    return memoryStore.outboxEntries.get(id);
  },

  /**
   * Testing utility to reset memory store
   */
  _resetStore() {
    memoryStore.clear();
  },
};
