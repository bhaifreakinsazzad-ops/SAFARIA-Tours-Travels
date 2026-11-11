// ==============================================================================
// SAFARIA Tours & Travels — Central Enquiries & Applications Repository
// Handles real Supabase persistence with robust in-memory fallback for local dev & testing
// ==============================================================================

import { getSupabaseServiceClient } from "./supabaseClient";
import { isScopedConnectionConfigured, withAgencyScope } from "./scopedPgClient";
import { generateReferenceCode } from "@server/utils/referenceGenerator";
import { FlightEnquiryInput, AgencyApplicationInput, GeneralEnquiryInput } from "@server/validations/enquirySchemas";
import { generateTemporaryPassword, hashPassword, verifyPassword } from "@server/auth/passwordService";
import { PILOT_ENTITLEMENTS, PAID_ENTITLEMENTS } from "@/config/constants";
import crypto from "node:crypto";

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

export interface AgencyInvoice {
  id: string;
  invoiceNo: string;
  agencyId: string;
  agencyName: string;
  amountBdt: number;
  plan: "MONTHLY" | "ANNUAL";
  status: "PENDING_VERIFICATION" | "VERIFIED_PAID" | "CANCELLED";
  paymentMethod: "BANK_TRANSFER" | "BKASH_MERCHANT" | "NAGAD" | "MANUAL_RECONCILED";
  paymentReference?: string;
  issuedAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  notes?: string;
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
  status: "PENDING_VERIFICATION" | "IN_REVIEW" | "TRIAL_APPROVED" | "ACTIVE_PARTNER" | "REJECTED" | "SUSPENDED";
  plan?: "MONTHLY" | "ANNUAL" | "TRIAL";
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  trialActivatedAt?: string | null;
  trialExpiresAt?: string | null;
  approvedBy?: string | null;
  assignedStaffOwner?: string | null;
  whatsappDraftOpened?: boolean;
  whatsappInboundConfirmed?: boolean;
  painCategory?: string;
  district?: string;
  notes?: string;
  passwordHash?: string | null;
  passwordSalt?: string | null;
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
  agencyInvoices: Map<string, AgencyInvoice> = new Map();
  outboxEntries: Map<string, StoredOutboxEntry> = new Map();
  b2bDeskRecords: Map<string, StoredB2BDeskRecord> = new Map();
  generalEnquiries: Map<string, StoredGeneralEnquiry> = new Map();
  revokedSessions: Map<string, StoredRevokedSession> = new Map();

  constructor() {
    this.seedDefaultAgency();
  }

  seedDefaultAgency() {
    const now = new Date().toISOString();
    const oneYearLater = new Date(Date.now() + 365 * 86400 * 1000).toISOString();
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
      plan: "ANNUAL",
      subscriptionStartedAt: now,
      subscriptionExpiresAt: oneYearLater,
      assignedStaffOwner: "ops@safaria.vibing.world",
      whatsappDraftOpened: true,
      whatsappInboundConfirmed: true,
      painCategory: "PAIN_FARE",
      district: "Dhaka",
      createdAt: now,
      updatedAt: now,
    });

    this.agencyInvoices.set("inv-greendelta-01", {
      id: "inv-greendelta-01",
      invoiceNo: "INV-202611-0001",
      agencyId: "agency-greendelta-01",
      agencyName: "Green Delta Travels",
      amountBdt: 69999,
      plan: "ANNUAL",
      status: "VERIFIED_PAID",
      paymentMethod: "BANK_TRANSFER",
      paymentReference: "EBL-NPSB-98124019",
      issuedAt: now,
      verifiedAt: now,
      verifiedBy: "ops@safaria.vibing.world",
      notes: "Annual B2B partnership activated with full entitlements and priority FareDesk routing.",
    });
  }

  clear() {
    this.flightEnquiries.clear();
    this.agencyApplications.clear();
    this.agencyInvoices.clear();
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
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        const { error: enquiryError } = await supabase.from("flight_enquiries").insert({
          id: enquiryId,
          reference_no: referenceNo,
          trip_type: input.tripType,
          cabin_class: input.cabinClass || "ECONOMY",
          passengers: input.passengers,
          preferred_carrier: input.preferredCarrier,
          lead_passenger_name: input.leadPassengerName,
          phone_country_code: input.phoneCountryCode,
          phone_number: input.phoneNumber,
          email: input.email,
          special_notes: input.specialNotes,
          status: "NEW",
          ip_hash: meta?.ip ? crypto.createHash("sha256").update(meta.ip).digest("hex") : undefined,
          user_agent: meta?.userAgent,
          created_at: now,
          updated_at: now,
        });

        if (enquiryError) {
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Database error saving flight enquiry: ${enquiryError.message}`);
          }
          console.warn("Supabase enquiry insert failed, falling back to memory:", enquiryError);
        } else {
          const legsPayload = legs.map((leg) => ({
            id: leg.id,
            enquiry_id: enquiryId,
            leg_index: leg.legIndex,
            origin_iata: leg.originIata,
            origin_city: leg.originCity,
            destination_iata: leg.destinationIata,
            destination_city: leg.destinationCity,
            departure_date: leg.departureDate,
            created_at: now,
          }));

          const { error: legsError } = await supabase.from("flight_legs").insert(legsPayload);
          if (legsError) {
            console.warn("Supabase legs insert error:", legsError);
          }
          return enquiryRecord;
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") {
          throw err;
        }
        console.warn("Supabase enquiry exception fallback to memory:", err);
      }
    }

    memoryStore.flightEnquiries.set(enquiryId, enquiryRecord);
    return enquiryRecord;
  },

  /**
   * Get single flight enquiry by collision-resistant reference number
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
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
   * Create B2B Agency Application with strict persistence
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

        if (error) {
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Database error saving agency application: ${error.message}`);
          }
          console.warn("Supabase agency insertion failed, falling back to memory:", error);
        } else {
          memoryStore.agencyApplications.set(id, record);
          return record;
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") {
          throw err;
        }
        console.warn("Supabase agency insertion exception fallback to memory:", err);
      }
    }

    memoryStore.agencyApplications.set(id, record);
    return record;
  },

  /**
   * List B2B Agency Applications — fully database-backed in PostgreSQL/Supabase
   */
  async listAgencyApplications(): Promise<StoredAgencyApplication[]> {
    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("agency_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
          return data.map((d: any) => ({
            id: d.id,
            referenceNo: d.reference_no,
            agencyName: d.agency_name,
            contactPerson: d.contact_person,
            phone: d.phone,
            email: d.email,
            city: d.city,
            tradeLicenseNumber: d.trade_license_number,
            yearsInBusiness: d.years_in_business,
            monthlyTicketVolume: d.monthly_ticket_volume,
            status: d.status,
            trialActivatedAt: d.trial_activated_at,
            trialExpiresAt: d.trial_expires_at,
            approvedBy: d.approved_by,
            notes: d.internal_notes,
            passwordHash: d.password_hash,
            passwordSalt: d.password_salt,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }

        if (error && process.env.NODE_ENV === "production") {
          throw new Error(`Failed to list agency applications from database: ${error.message}`);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") {
          throw err;
        }
        console.warn("Supabase listAgencyApplications fallback to memory:", err);
      }
    }

    return Array.from(memoryStore.agencyApplications.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get single B2B Agency Application by UUID ID
   */
  async getAgencyApplicationById(id: string): Promise<StoredAgencyApplication | null> {
    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("agency_applications")
          .select("*")
          .eq("id", id)
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
            passwordHash: data.password_hash,
            passwordSalt: data.password_salt,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("Supabase getAgencyApplicationById error:", err);
      }
    }

    return memoryStore.agencyApplications.get(id) || null;
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
            passwordHash: data.password_hash,
            passwordSalt: data.password_salt,
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
   * Get single B2B Agency Application by email address
   */
  async getAgencyApplicationByEmail(email: string): Promise<StoredAgencyApplication | null> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("agency_applications")
          .select("*")
          .ilike("email", cleanEmail)
          .order("created_at", { ascending: false })
          .limit(1)
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
            passwordHash: data.password_hash,
            passwordSalt: data.password_salt,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("Supabase getAgencyApplicationByEmail error:", err);
      }
    }

    for (const record of memoryStore.agencyApplications.values()) {
      if (record.email.toLowerCase() === cleanEmail) {
        return record;
      }
    }
    return null;
  },

  /**
   * Update B2B Agency status (approve trial, activate partner, or suspend)
   * Guaranteed PostgreSQL persistence with zero silent memory-only success in production
   */
  async updateAgencyStatus(
    id: string,
    status: StoredAgencyApplication["status"],
    approvedBy?: string,
    notes?: string
  ): Promise<{ agency: StoredAgencyApplication; issuedPassword?: string } | null> {
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

    // Retrieve existing agency application to check existing credentials
    const existing = await this.getAgencyApplicationById(id);
    if (!existing) {
      return null;
    }

    const grantsLoginAccess = status === "TRIAL_APPROVED" || status === "ACTIVE_PARTNER";
    const needsFirstCredentials = grantsLoginAccess && !existing.passwordHash;

    let issuedPassword: string | undefined;
    let passwordHash: string | undefined;
    let passwordSalt: string | undefined;

    if (needsFirstCredentials) {
      issuedPassword = generateTemporaryPassword();
      const hashed = hashPassword(issuedPassword);
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    }

    if (supabase) {
      try {
        const updatePayload: Record<string, unknown> = {
          status,
          trial_activated_at: trialActivatedAt || existing.trialActivatedAt,
          trial_expires_at: trialExpiresAt || existing.trialExpiresAt,
          approved_by: approvedBy || existing.approvedBy,
          internal_notes: notes !== undefined ? notes : existing.notes,
          updated_at: nowIso,
        };

        if (passwordHash) {
          updatePayload.password_hash = passwordHash;
          updatePayload.password_salt = passwordSalt;
        }

        const { data: updated, error } = await supabase
          .from("agency_applications")
          .update(updatePayload)
          .eq("id", id)
          .select("*")
          .single();

        if (error) {
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Database error updating agency status: ${error.message}`);
          }
          console.warn("Supabase updateAgencyStatus error:", error);
        } else if (updated) {
          const updatedRecord: StoredAgencyApplication = {
            id: updated.id,
            referenceNo: updated.reference_no,
            agencyName: updated.agency_name,
            contactPerson: updated.contact_person,
            phone: updated.phone,
            email: updated.email,
            city: updated.city,
            tradeLicenseNumber: updated.trade_license_number,
            yearsInBusiness: updated.years_in_business,
            monthlyTicketVolume: updated.monthly_ticket_volume,
            status: updated.status,
            trialActivatedAt: updated.trial_activated_at,
            trialExpiresAt: updated.trial_expires_at,
            approvedBy: updated.approved_by,
            notes: updated.internal_notes,
            passwordHash: updated.password_hash,
            passwordSalt: updated.password_salt,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
          };
          memoryStore.agencyApplications.set(id, updatedRecord);
          return { agency: updatedRecord, issuedPassword };
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") {
          throw err;
        }
        console.warn("Supabase updateAgencyStatus exception fallback:", err);
      }
    }

    // In-memory fallback for test environment
    const record = memoryStore.agencyApplications.get(id);
    if (record) {
      record.status = status;
      if (trialActivatedAt) record.trialActivatedAt = trialActivatedAt;
      if (trialExpiresAt) record.trialExpiresAt = trialExpiresAt;
      if (approvedBy) record.approvedBy = approvedBy;
      if (notes !== undefined) record.notes = notes;
      if (passwordHash) {
        record.passwordHash = passwordHash;
        record.passwordSalt = passwordSalt;
      }
      record.updatedAt = nowIso;
      return { agency: record, issuedPassword };
    }

    return null;
  },

  /**
   * Verify B2B partner login credentials against the stored scrypt hash.
   * Authoritative lookup directly against PostgreSQL / Supabase.
   */
  async verifyAgencyCredentials(
    email: string,
    password: string
  ): Promise<StoredAgencyApplication | null> {
    const matched = await this.getAgencyApplicationByEmail(email);

    if (!matched) return null;
    if (matched.status !== "TRIAL_APPROVED" && matched.status !== "ACTIVE_PARTNER") return null;
    if (!matched.passwordHash || !matched.passwordSalt) return null;
    if (!verifyPassword(password, matched.passwordHash, matched.passwordSalt)) return null;

    return matched;
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
        const { error } = await supabase.from("integration_outbox").insert({
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
        if (!error) {
          return entry;
        }
        if (process.env.NODE_ENV === "production") {
          throw new Error(`Database error enqueueing outbox task: ${error.message}`);
        }
        console.warn("Supabase outbox insert failed, falling back to memory:", error);
      } catch (err) {
        if (process.env.NODE_ENV === "production") {
          throw err;
        }
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

        if (!selectErr) {
          if (!candidates || candidates.length === 0) {
            return [];
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
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
            .in("status", ["PENDING", "FAILED"])
            .select();

          if (!updateErr) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
            return (claimed || []).map((row: any) => ({
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
          console.warn("Supabase outbox claim update failed, falling back to memory store:", updateErr);
        } else {
          console.warn("Supabase outbox claim select failed, falling back to memory store:", selectErr);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic partial-update payload
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
   * Create a persistent B2B Desk record (Fare, Booking, ClearMargin, AfterCare, etc.)
   * Fails closed when scoped connection is required or fails
   */
  async createB2BDeskRecord(
    deskType: StoredB2BDeskRecord["deskType"],
    agencyId: string,
    title: string,
    payload: Record<string, unknown>,
    priority: StoredB2BDeskRecord["priority"] = "NORMAL"
  ): Promise<StoredB2BDeskRecord> {
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

    // 1. Scoped Direct Postgres Connection with RLS (authenticated role + app.current_agency_id)
    if (isScopedConnectionConfigured()) {
      try {
        await withAgencyScope(agencyId, async (client) => {
          await client.query(
            `INSERT INTO b2b_desk_records (id, agency_id, desk_type, title, priority, status, payload, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, 'OPEN', $6, $7, $8)`,
            [id, agencyId, deskType, title, priority, payload, now, now]
          );
        });
        memoryStore.b2bDeskRecords.set(id, record);
        return record;
      } catch (err) {
        // If RLS rejected the insert or database failed, FAIL CLOSED: do not bypass via service_role
        console.warn("Scoped RLS desk record insert failed:", err);
        throw err;
      }
    }

    // 2. Fallback to Supabase client when DATABASE_URL is not configured (e.g. test environments)
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("b2b_desk_records").insert({
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
        if (error && process.env.NODE_ENV === "production") {
          throw new Error(`Database error saving desk record: ${error.message}`);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") throw err;
        console.warn("Supabase desk record insert fallback to memory:", err);
      }
    }

    memoryStore.b2bDeskRecords.set(id, record);
    return record;
  },

  /**
   * List B2B Desk records with strict tenant isolation
   * Agency-scoped reads go through the real RLS boundary when available.
   */
  async listB2BDeskRecords(
    deskType?: StoredB2BDeskRecord["deskType"],
    agencyId?: string
  ): Promise<StoredB2BDeskRecord[]> {
    // 1. Agency-scoped reads go through the real RLS boundary when available
    if (agencyId && isScopedConnectionConfigured()) {
      try {
        return await withAgencyScope(agencyId, async (client) => {
          const params: unknown[] = [];
          let sql = "SELECT * FROM b2b_desk_records";
          if (deskType) {
            params.push(deskType);
            sql += ` WHERE desk_type = $${params.length}`;
          }
          sql += " ORDER BY created_at DESC";
          const { rows } = await client.query(sql, params);
          return rows.map((d) => ({
            id: d.id,
            agencyId: d.agency_id,
            deskType: d.desk_type,
            title: d.title,
            priority: d.priority,
            status: d.status,
            payload: d.payload || {},
            internalNotes: d.internal_notes ?? undefined,
            createdAt: d.created_at instanceof Date ? d.created_at.toISOString() : d.created_at,
            updatedAt: d.updated_at instanceof Date ? d.updated_at.toISOString() : d.updated_at,
          }));
        });
      } catch (err) {
        console.warn("Scoped RLS desk record list failed:", err);
        throw err;
      }
    }

    // 2. Supabase path (used by staff or non-scoped environments)
    const supabase = getSupabaseServiceClient();
    if (supabase) {
      try {
        let query = supabase.from("b2b_desk_records").select("*").order("created_at", { ascending: false });
        if (agencyId) query = query.eq("agency_id", agencyId);
        if (deskType) query = query.eq("desk_type", deskType);

        const { data, error } = await query;
        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Supabase row shape
          return data.map((d: any) => ({
            id: d.id,
            agencyId: d.agency_id,
            deskType: d.desk_type,
            title: d.title,
            priority: d.priority,
            status: d.status,
            payload: d.payload || {},
            internalNotes: d.internal_notes ?? undefined,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase desk record list fallback to memory:", err);
      }
    }

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
   * Update B2B Desk Record status + append-only audit trail.
   * `scopeAgencyId`, when supplied by a B2B_PARTNER caller, routes the update
   * through the real RLS boundary. Fails closed on cross-tenant or database failure.
   */
  async updateB2BDeskRecord(
    id: string,
    status: StoredB2BDeskRecord["status"],
    internalNotes?: string,
    scopeAgencyId?: string
  ): Promise<StoredB2BDeskRecord | null> {
    const now = new Date().toISOString();

    if (scopeAgencyId && isScopedConnectionConfigured()) {
      try {
        const updated = await withAgencyScope(scopeAgencyId, async (client) => {
          const { rows: existingRows } = await client.query(
            "SELECT internal_notes FROM b2b_desk_records WHERE id = $1",
            [id]
          );
          if (existingRows.length === 0) return null;

          const mergedNotes = internalNotes
            ? [existingRows[0].internal_notes, internalNotes].filter(Boolean).join("\n")
            : existingRows[0].internal_notes;

          const { rows } = await client.query(
            `UPDATE b2b_desk_records SET status = $1, internal_notes = $2, updated_at = $3
             WHERE id = $4 RETURNING *`,
            [status, mergedNotes, now, id]
          );
          if (rows.length === 0) return null; // RLS silently excluded a cross-tenant id

          const d = rows[0];
          return {
            id: d.id,
            agencyId: d.agency_id,
            deskType: d.desk_type,
            title: d.title,
            priority: d.priority,
            status: d.status,
            payload: d.payload || {},
            internalNotes: d.internal_notes ?? undefined,
            createdAt: d.created_at instanceof Date ? d.created_at.toISOString() : d.created_at,
            updatedAt: d.updated_at instanceof Date ? d.updated_at.toISOString() : d.updated_at,
          } as StoredB2BDeskRecord;
        });

        if (updated) {
          memoryStore.b2bDeskRecords.set(id, updated);
          return updated;
        }
        // RLS excluded the row (cross-tenant attempt) — fail closed immediately!
        return null;
      } catch (err) {
        console.warn("Scoped RLS desk record update failed:", err);
        throw err;
      }
    }

    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data: existing, error: fetchError } = await supabase
          .from("b2b_desk_records")
          .select("*")
          .eq("id", id)
          .single();

        if (!fetchError && existing) {
          const mergedNotes = internalNotes
            ? [existing.internal_notes, internalNotes].filter(Boolean).join("\n")
            : existing.internal_notes;

          const { data: updated, error: updateError } = await supabase
            .from("b2b_desk_records")
            .update({ status, internal_notes: mergedNotes, updated_at: now })
            .eq("id", id)
            .select("*")
            .single();

          if (!updateError && updated) {
            const record: StoredB2BDeskRecord = {
              id: updated.id,
              agencyId: updated.agency_id,
              deskType: updated.desk_type,
              title: updated.title,
              priority: updated.priority,
              status: updated.status,
              payload: updated.payload || {},
              internalNotes: updated.internal_notes ?? undefined,
              createdAt: updated.created_at,
              updatedAt: updated.updated_at,
            };
            memoryStore.b2bDeskRecords.set(id, record);
            return record;
          }
        }
      } catch (err) {
        console.warn("Supabase desk record update fallback to memory:", err);
      }
    }

    const record = memoryStore.b2bDeskRecords.get(id);
    if (record) {
      record.status = status;
      if (internalNotes) {
        record.internalNotes = [record.internalNotes, internalNotes].filter(Boolean).join("\n");
      }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- union of three differently-shaped stored record types
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
   * Get real-time entitlement limits and consumption for an agency
   */
  async getAgencyEntitlementUsage(agencyId: string) {
    const agency = await this.getAgencyApplicationById(agencyId);
    const isTrial = agency?.status === "TRIAL_APPROVED";
    const isActive = agency?.status === "ACTIVE_PARTNER";

    // Pilot entitlements vs Paid entitlements
    const limits = isTrial
      ? PILOT_ENTITLEMENTS
      : (isActive ? PAID_ENTITLEMENTS : {
          fareRequestsLimit: 0,
          bookingRequestsLimit: 0,
          afterCareLimit: 0,
          seatsLimit: 0,
        });

    // Count usage directly from b2bDeskRecords
    const records = await this.listB2BDeskRecords(undefined, agencyId);
    const fareUsed = records.filter((r) => r.deskType === "FARE_DESK").length;
    const bookingUsed = records.filter((r) => r.deskType === "BOOKING_DESK").length;
    const afterCareUsed = records.filter((r) => r.deskType === "AFTER_CARE").length;
    const verifiedUsed = records.filter((r) => r.deskType === "VERIFIED_WORKFLOW").length;

    const isRenewalDue = Boolean(
      agency?.subscriptionExpiresAt &&
      (new Date(agency.subscriptionExpiresAt).getTime() - Date.now()) <= 7 * 86400 * 1000
    );

    return {
      agencyId,
      agencyName: agency?.agencyName || "Partner Agency",
      status: agency?.status || "UNKNOWN",
      plan: agency?.plan || (isTrial ? "TRIAL" : (isActive ? "MONTHLY" : "NONE")),
      trialActivatedAt: agency?.trialActivatedAt || null,
      trialExpiresAt: agency?.trialExpiresAt || null,
      subscriptionStartedAt: agency?.subscriptionStartedAt || null,
      subscriptionExpiresAt: agency?.subscriptionExpiresAt || null,
      isRenewalDue,
      isTrial,
      isActive,
      usage: {
        fareUsed,
        fareLimit: limits.fareRequestsLimit,
        fareRemaining: Math.max(0, limits.fareRequestsLimit - fareUsed),
        bookingUsed,
        bookingLimit: limits.bookingRequestsLimit,
        bookingRemaining: Math.max(0, limits.bookingRequestsLimit - bookingUsed),
        afterCareUsed,
        afterCareLimit: limits.afterCareLimit,
        afterCareRemaining: Math.max(0, limits.afterCareLimit - afterCareUsed),
        verifiedUsed,
        seatsUsed: 1,
        seatsLimit: limits.seatsLimit,
      },
    };
  },

  /**
   * Create billing invoice for an agency
   */
  async createAgencyInvoice(input: {
    agencyId: string;
    amountBdt: number;
    plan: "MONTHLY" | "ANNUAL";
    paymentMethod: AgencyInvoice["paymentMethod"];
    paymentReference?: string;
    notes?: string;
    status?: AgencyInvoice["status"];
    verifiedBy?: string;
  }): Promise<AgencyInvoice> {
    const agency = await this.getAgencyApplicationById(input.agencyId);
    const id = `inv-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const invoiceNo = `INV-${now.toISOString().slice(0, 7).replace("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice: AgencyInvoice = {
      id,
      invoiceNo,
      agencyId: input.agencyId,
      agencyName: agency?.agencyName || "Partner Agency",
      amountBdt: input.amountBdt,
      plan: input.plan,
      status: input.status || "PENDING_VERIFICATION",
      paymentMethod: input.paymentMethod,
      paymentReference: input.paymentReference,
      issuedAt: now.toISOString(),
      verifiedAt: input.status === "VERIFIED_PAID" ? now.toISOString() : null,
      verifiedBy: input.verifiedBy || null,
      notes: input.notes,
    };

    memoryStore.agencyInvoices.set(id, invoice);
    return invoice;
  },

  /**
   * List invoices optionally filtered by agencyId
   */
  async listAgencyInvoices(agencyId?: string): Promise<AgencyInvoice[]> {
    const list = Array.from(memoryStore.agencyInvoices.values());
    if (agencyId) {
      return list.filter((inv) => inv.agencyId === agencyId);
    }
    return list.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  },

  /**
   * Update invoice status
   */
  async updateAgencyInvoiceStatus(
    id: string,
    status: AgencyInvoice["status"],
    verifiedBy?: string,
    notes?: string
  ): Promise<AgencyInvoice | null> {
    const invoice = memoryStore.agencyInvoices.get(id);
    if (!invoice) return null;
    invoice.status = status;
    if (status === "VERIFIED_PAID") {
      invoice.verifiedAt = new Date().toISOString();
      if (verifiedBy) invoice.verifiedBy = verifiedBy;
    }
    if (notes) invoice.notes = notes;
    return invoice;
  },

  /**
   * Activate or renew an agency subscription
   */
  async updateAgencySubscription(
    agencyId: string,
    plan: "MONTHLY" | "ANNUAL" = "MONTHLY",
    durationDays: number = 30,
    approvedBy: string = "SYSTEM"
  ): Promise<StoredAgencyApplication | null> {
    const agency = await this.getAgencyApplicationById(agencyId);
    if (!agency) return null;

    const days = typeof durationDays === "number" && !isNaN(durationDays) && durationDays > 0 ? durationDays : (plan === "ANNUAL" ? 365 : 30);
    const now = new Date();
    const expires = new Date(now.getTime() + days * 86400 * 1000);

    agency.status = "ACTIVE_PARTNER";
    agency.plan = plan;
    agency.subscriptionStartedAt = now.toISOString();
    agency.subscriptionExpiresAt = expires.toISOString();
    agency.approvedBy = approvedBy;
    agency.updatedAt = now.toISOString();

    memoryStore.agencyApplications.set(agencyId, agency);
    return agency;
  },

  /**
   * Telemetry: Record that the user opened the WhatsApp draft link
   */
  async recordWhatsAppDraftOpened(refOrId: string): Promise<boolean> {
    for (const app of memoryStore.agencyApplications.values()) {
      if (app.referenceNo === refOrId || app.id === refOrId) {
        app.whatsappDraftOpened = true;
        app.updatedAt = new Date().toISOString();
        return true;
      }
    }
    return false;
  },

  /**
   * Staff toggle: mark whether the agency actually replied on WhatsApp
   */
  async setWhatsAppInboundConfirmed(agencyId: string, confirmed: boolean): Promise<boolean> {
    const agency = await this.getAgencyApplicationById(agencyId);
    if (!agency) return false;
    agency.whatsappInboundConfirmed = confirmed;
    agency.updatedAt = new Date().toISOString();
    return true;
  },

  /**
   * Staff owner assignment
   */
  async assignAgencyStaffOwner(agencyId: string, staffEmail: string): Promise<boolean> {
    const agency = await this.getAgencyApplicationById(agencyId);
    if (!agency) return false;
    agency.assignedStaffOwner = staffEmail;
    agency.updatedAt = new Date().toISOString();
    return true;
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
