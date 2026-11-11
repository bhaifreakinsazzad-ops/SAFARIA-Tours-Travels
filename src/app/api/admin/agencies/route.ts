// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Agency Operations API
// Staff triage for agency verification, approval, credential issuance & suspension
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { extractSessionFromRequestAsync } from "@server/auth/authService";
import { staffService } from "@server/auth/staffService";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";
import { AGENCY_PRICING } from "@/config/constants";

async function getAuthorizedStaffSession(req: NextRequest) {
  const session = await extractSessionFromRequestAsync(req);
  if (!session) return null;
  if (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT" || session.role === "FINANCE_DESK") {
    return session;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const staff = await getAuthorizedStaffSession(req);
  if (!staff) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const list = await enquiriesRepository.listAgencyApplications();
    const invoices = await enquiriesRepository.listAgencyInvoices();
    // Never echo credential hashes back to any client, including the admin UI.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitized = list.map(({ passwordHash, passwordSalt, ...rest }) => rest);
    return NextResponse.json({
      success: true,
      count: sanitized.length,
      applications: sanitized,
      invoices,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  const staff = await getAuthorizedStaffSession(req);
  if (!staff) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await readJsonBodyGuarded<{
      id?: string;
      action?:
        | "UPDATE_STATUS"
        | "GRANT_TRIAL"
        | "CREATE_INVOICE"
        | "ACTIVATE_SUBSCRIPTION"
        | "TOGGLE_WHATSAPP_CONFIRMED"
        | "ASSIGN_OWNER";
      status?: "PENDING_VERIFICATION" | "IN_REVIEW" | "TRIAL_APPROVED" | "ACTIVE_PARTNER" | "REJECTED" | "SUSPENDED";
      notes?: string;
      plan?: "MONTHLY" | "ANNUAL";
      amountBdt?: number;
      paymentMethod?: "BANK_TRANSFER" | "BKASH_MERCHANT" | "NAGAD" | "MANUAL_RECONCILED";
      paymentReference?: string;
      whatsappInboundConfirmed?: boolean;
      assignedStaffOwner?: string;
    }>(req, 16_000);

    const { id, action = "UPDATE_STATUS", status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing agency id" }, { status: 400 });
    }

    // 1. Grant 72h Trial Action
    if (action === "GRANT_TRIAL") {
      const result = await enquiriesRepository.updateAgencyStatus(
        id,
        "TRIAL_APPROVED",
        staff.email,
        notes || "72-hour pilot trial granted following trade license verification"
      );

      if (!result) return NextResponse.json({ success: false, error: "Agency not found" }, { status: 404 });

      await staffService.recordStaffAuditLog({
        staffId: staff.userId,
        staffEmail: staff.email,
        action: "AGENCY_GRANT_72H_TRIAL",
        targetType: "AGENCY_APPLICATION",
        targetId: id,
        details: { approvedBy: staff.email },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, passwordSalt, ...agency } = result.agency;
      return NextResponse.json({
        success: true,
        agency,
        issuedPassword: result.issuedPassword,
        message: "72-hour trial approved. Relay temporary password to the agency partner.",
      });
    }

    // 2. Create Invoice Action
    if (action === "CREATE_INVOICE") {
      const plan = body.plan || "MONTHLY";
      const amount = body.amountBdt || (plan === "ANNUAL" ? AGENCY_PRICING.annual : AGENCY_PRICING.monthly);
      const invoice = await enquiriesRepository.createAgencyInvoice({
        agencyId: id,
        amountBdt: amount,
        plan,
        paymentMethod: body.paymentMethod || "BANK_TRANSFER",
        paymentReference: body.paymentReference,
        notes: notes || `SAFARIA B2B ${plan} plan invoice`,
        status: "PENDING_VERIFICATION",
      });

      return NextResponse.json({ success: true, invoice, message: "Invoice created." });
    }

    // 3. Activate Paid Subscription Action
    if (action === "ACTIVATE_SUBSCRIPTION") {
      const plan = body.plan || "MONTHLY";
      const durationDays = plan === "ANNUAL" ? 365 : 30;

      // Update subscription in repository
      const updated = await enquiriesRepository.updateAgencySubscription(
        id,
        plan,
        durationDays,
        staff.email
      );

      if (!updated) return NextResponse.json({ success: false, error: "Agency not found" }, { status: 404 });

      // Create matching verified invoice
      const amount = body.amountBdt || (plan === "ANNUAL" ? AGENCY_PRICING.annual : AGENCY_PRICING.monthly);
      const invoice = await enquiriesRepository.createAgencyInvoice({
        agencyId: id,
        amountBdt: amount,
        plan,
        paymentMethod: body.paymentMethod || "BANK_TRANSFER",
        paymentReference: body.paymentReference || `REC-${Date.now()}`,
        status: "VERIFIED_PAID",
        verifiedBy: staff.email,
        notes: notes || `Paid ${plan} subscription verified and activated by ${staff.email}`,
      });

      await staffService.recordStaffAuditLog({
        staffId: staff.userId,
        staffEmail: staff.email,
        action: `ACTIVATE_SUBSCRIPTION_${plan}`,
        targetType: "AGENCY_APPLICATION",
        targetId: id,
        details: { plan, durationDays, invoiceNo: invoice.invoiceNo },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, passwordSalt, ...agency } = updated;
      return NextResponse.json({
        success: true,
        agency,
        invoice,
        message: `Paid ${plan} subscription activated. Validity: ${durationDays} days.`,
      });
    }

    // 4. Toggle WhatsApp Inbound Confirmed
    if (action === "TOGGLE_WHATSAPP_CONFIRMED") {
      const confirmed = body.whatsappInboundConfirmed ?? true;
      await enquiriesRepository.setWhatsAppInboundConfirmed(id, confirmed);
      return NextResponse.json({ success: true, whatsappInboundConfirmed: confirmed });
    }

    // 5. Assign Staff Owner
    if (action === "ASSIGN_OWNER") {
      const owner = body.assignedStaffOwner || staff.email;
      await enquiriesRepository.assignAgencyStaffOwner(id, owner);
      return NextResponse.json({ success: true, assignedStaffOwner: owner });
    }

    // Standard Status Update
    if (!status) {
      return NextResponse.json({ success: false, error: "Missing target status" }, { status: 400 });
    }

    const result = await enquiriesRepository.updateAgencyStatus(id, status, staff.email, notes);
    if (!result) return NextResponse.json({ success: false, error: "Agency not found" }, { status: 404 });

    await staffService.recordStaffAuditLog({
      staffId: staff.userId,
      staffEmail: staff.email,
      action: `AGENCY_STATUS_UPDATE_${status}`,
      targetType: "AGENCY_APPLICATION",
      targetId: id,
      details: { newStatus: status, notes },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, passwordSalt, ...agency } = result.agency;
    return NextResponse.json({
      success: true,
      agency,
      issuedPassword: result.issuedPassword,
      ...(result.issuedPassword && {
        message: "Partner login credentials issued. Relay this password to the agency out-of-band now.",
      }),
    });
  } catch (err: unknown) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds maximum permitted size" },
        { status: 413 }
      );
    }
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
