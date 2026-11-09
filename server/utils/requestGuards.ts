// ==============================================================================
// SAFARIA Tours & Travels — Request Body Size Guard
// Next.js App Router Route Handlers impose no body-size limit by default
// (unlike legacy Pages API routes' bodyParser.sizeLimit), so public,
// unauthenticated POST endpoints had no protection against oversized
// payloads before this. Streams with a hard byte cap rather than trusting
// the (forgeable, optional) Content-Length header alone.
// ==============================================================================

import { NextRequest } from "next/server";

export class PayloadTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`Request body exceeds the ${maxBytes}-byte limit`);
  }
}

/**
 * Reads and JSON-parses a request body, enforcing maxBytes regardless of
 * what (if any) Content-Length header the client sent. Throws
 * PayloadTooLargeError if exceeded; callers should map that to HTTP 413.
 */
export async function readJsonBodyGuarded<T = unknown>(
  req: NextRequest,
  maxBytes: number = 50_000
): Promise<T> {
  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    throw new PayloadTooLargeError(maxBytes);
  }

  if (!req.body) {
    return (await req.json()) as T;
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > maxBytes) {
          throw new PayloadTooLargeError(maxBytes);
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock?.();
  }

  const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
  return JSON.parse(text) as T;
}
