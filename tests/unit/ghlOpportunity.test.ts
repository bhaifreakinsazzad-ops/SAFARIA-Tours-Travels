// ==============================================================================
// Coverage for GHL opportunity creation — previously MISSING entirely despite
// ghlAdapter.ts's header comment claiming "opportunity creation" was
// implemented (it only ever called contacts/upsert). This mocks global.fetch
// since no real GHL credentials/pipeline exist in this environment.
// ==============================================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ghlAdapter } from "@server/crm/ghlAdapter";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import type { StoredFlightEnquiry } from "@server/db/enquiriesRepository";

const ORIGINAL_ENV = { ...process.env };

function sampleEnquiry(): StoredFlightEnquiry {
  return {
    id: "enq-1",
    referenceNo: "SFR-20261109-TEST01",
    tripType: "ONE_WAY",
    cabinClass: "ECONOMY",
    passengers: { adults: 1, children: 0, infants: 0 },
    leadPassengerName: "Test Passenger",
    phoneCountryCode: "+880",
    phoneNumber: "1700000000",
    email: "test@example.com",
    status: "NEW",
    legs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("ghlAdapter opportunity creation", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
    process.env.GHL_API_KEY = "test-ghl-key";
    process.env.GHL_LOCATION_ID = "test-location-id";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  it("skips opportunity creation when GHL_PIPELINE_ID/GHL_PIPELINE_STAGE_ID are not configured", async () => {
    delete process.env.GHL_PIPELINE_ID;
    delete process.env.GHL_PIPELINE_STAGE_ID;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ contact: { id: "contact-123" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await ghlAdapter.syncFlightEnquiry(sampleEnquiry());

    expect(result.contactId).toBe("contact-123");
    expect(result.opportunityId).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the contact upsert, no opportunity call
  });

  it("creates a real opportunity once a pipeline is configured, linked to the upserted contact", async () => {
    process.env.GHL_PIPELINE_ID = "pipeline-abc";
    process.env.GHL_PIPELINE_STAGE_ID = "stage-xyz";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ contact: { id: "contact-456" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ opportunity: { id: "opp-789" } }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await ghlAdapter.syncFlightEnquiry(sampleEnquiry());

    expect(result.contactId).toBe("contact-456");
    expect(result.opportunityId).toBe("opp-789");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const opportunityCall = fetchMock.mock.calls[1];
    expect(opportunityCall[0]).toBe("https://services.leadconnectorhq.com/opportunities/");
    const body = JSON.parse(opportunityCall[1].body);
    expect(body.pipelineId).toBe("pipeline-abc");
    expect(body.pipelineStageId).toBe("stage-xyz");
    expect(body.contactId).toBe("contact-456");
  });

  it("never throws past the sync result when the opportunity call itself fails", async () => {
    process.env.GHL_PIPELINE_ID = "pipeline-abc";
    process.env.GHL_PIPELINE_STAGE_ID = "stage-xyz";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ contact: { id: "contact-456" } }) })
      .mockResolvedValueOnce({ ok: false, status: 500 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await ghlAdapter.syncFlightEnquiry(sampleEnquiry());

    expect(result.success).toBe(true);
    expect(result.contactId).toBe("contact-456");
    expect(result.opportunityId).toBeUndefined();
  });
});
