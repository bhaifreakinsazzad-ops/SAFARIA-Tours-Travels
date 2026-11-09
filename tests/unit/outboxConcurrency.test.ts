// ==============================================================================
// Regression coverage for two real correctness bugs found in
// enquiriesRepository.claimOutboxBatch's Supabase code path (never exercised
// by the existing embedded-Postgres integration test, which drives raw SQL
// directly and never goes through the Supabase JS client or this repository
// function at all):
//
// 1. The claim UPDATE had no WHERE status guard of its own — two workers
//    racing on the same SELECTed candidate set could both flip the same row
//    to PROCESSING ("double-claim").
// 2. When Supabase was configured and legitimately returned zero candidates,
//    execution fell through into the in-memory-store claiming logic below,
//    which could claim stray memory-mirror entries alongside/instead of real
//    DB rows.
//
// This uses a minimal fake Supabase query builder (not a real Postgres) since
// no hosted Supabase/PostgREST instance is available in this test harness —
// documented here rather than silently assumed. The fake resolves its
// filtered select/update asynchronously via queueMicrotask so that two
// concurrent claimOutboxBatch() calls genuinely interleave, the same way two
// real serverless workers racing over HTTP would.
// ==============================================================================
import { describe, it, expect, vi, beforeEach } from "vitest";

type FakeRow = Record<string, unknown> & { id: string; status: string };

function makeFakeSupabase(rows: FakeRow[]) {
  function matches(row: FakeRow, filters: Array<{ type: string; col: string; val?: unknown; vals?: unknown[] }>) {
    for (const f of filters) {
      if (f.type === "in" && !f.vals!.includes(row[f.col])) return false;
      if (f.type === "lt" && !((row[f.col] as number) < (f.val as number))) return false;
      if (f.type === "lte" && !((row[f.col] as string) <= (f.val as string))) return false;
    }
    return true;
  }

  function builder() {
    const filters: Array<{ type: string; col: string; val?: unknown; vals?: unknown[] }> = [];
    let op: "select" | "update" | null = null;
    let updateData: Record<string, unknown> | null = null;
    let limitN: number | undefined;

    const self = {
      select() {
        op = op || "select";
        return self;
      },
      update(data: Record<string, unknown>) {
        op = "update";
        updateData = data;
        return self;
      },
      in(col: string, vals: unknown[]) {
        filters.push({ type: "in", col, vals });
        return self;
      },
      lt(col: string, val: unknown) {
        filters.push({ type: "lt", col, val });
        return self;
      },
      lte(col: string, val: unknown) {
        filters.push({ type: "lte", col, val });
        return self;
      },
      or() {
        return self;
      },
      order() {
        return self;
      },
      limit(n: number) {
        limitN = n;
        return self;
      },
      // supabase-js query builders are PromiseLike: awaiting them at any
      // point after select()/update() resolves via this then().
      then(resolve: (v: { data: unknown; error: unknown }) => void) {
        queueMicrotask(() => {
          if (op === "select") {
            let matched = rows.filter((r) => matches(r, filters));
            if (limitN) matched = matched.slice(0, limitN);
            resolve({ data: matched.map((r) => ({ id: r.id })), error: null });
            return;
          }
          if (op === "update") {
            const matched = rows.filter((r) => matches(r, filters));
            for (const r of matched) Object.assign(r, updateData);
            resolve({ data: matched.map((r) => ({ ...r })), error: null });
            return;
          }
          resolve({ data: null, error: new Error("unsupported fake-supabase op") });
        });
      },
    };
    return self;
  }

  return { from: () => builder() };
}

vi.mock("@server/db/supabaseClient", () => ({
  getSupabaseServiceClient: vi.fn(),
}));

import { getSupabaseServiceClient } from "@server/db/supabaseClient";
import { enquiriesRepository } from "@server/db/enquiriesRepository";

const mockedGetClient = getSupabaseServiceClient as unknown as ReturnType<typeof vi.fn>;

describe("claimOutboxBatch — Supabase code path regression coverage", () => {
  beforeEach(() => {
    mockedGetClient.mockReset();
    enquiriesRepository._resetStore();
  });

  it("does not fall through to stray in-memory entries when Supabase legitimately returns zero candidates", async () => {
    // Seed a stray memory-only entry by enqueuing while Supabase is
    // unconfigured (null) — this mirrors how a prior transient outage could
    // leave an orphaned entry only in the memory store.
    mockedGetClient.mockReturnValue(null);
    await enquiriesRepository.enqueueOutbox("GHL_CRM", "CONTACT_UPSERT", {}, `stray-${crypto.randomUUID()}`);

    // Now Supabase is configured and genuinely has zero claimable rows.
    mockedGetClient.mockReturnValue(makeFakeSupabase([]));
    const claimed = await enquiriesRepository.claimOutboxBatch("worker-test", 20, 120);

    expect(claimed).toEqual([]);
  });

  it("prevents two concurrent workers from double-claiming the same candidate row", async () => {
    const pastIso = new Date(Date.now() - 60_000).toISOString();
    const rows: FakeRow[] = [
      {
        id: "race-row-1",
        status: "PENDING",
        attempts: 0,
        next_retry_at: pastIso,
        locked_at: null,
        channel: "GHL_CRM",
        event_type: "CONTACT_UPSERT",
        payload: {},
        idempotency_key: "race-key-1",
        last_error: null,
        locked_by: null,
        created_at: pastIso,
        updated_at: pastIso,
      },
    ];
    mockedGetClient.mockReturnValue(makeFakeSupabase(rows));

    // Both workers' SELECT phases will interleave via queueMicrotask before
    // either's UPDATE commits, reproducing the real race.
    const [claimedA, claimedB] = await Promise.all([
      enquiriesRepository.claimOutboxBatch("worker-A", 20, 120),
      enquiriesRepository.claimOutboxBatch("worker-B", 20, 120),
    ]);

    const totalClaimed = claimedA.length + claimedB.length;
    expect(totalClaimed).toBe(1); // exactly one worker wins, never both, never zero
    expect(rows[0].status).toBe("PROCESSING");
  });
});
