import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, tally-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

async function tokenHash(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("ai-campus-copilot-registration-edit:" + value),
  );
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Base64(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  let binary = "";
  for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function extractFields(payload: any) {
  const fields = payload?.data?.fields ?? payload?.fields ?? [];
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    const label = String(field?.label ?? field?.question?.text ?? "").trim();
    const value = field?.answer?.value ?? field?.value ?? field?.answer;
    if (label) values[label.toLowerCase()] = value;
  }

  return values;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > 1_000_000) {
      return json({ error: "Webhook payload is too large" }, 413);
    }

    const webhookSecret = Deno.env.get("TALLY_WEBHOOK_SECRET")?.trim();
    if (!webhookSecret) {
      console.error("TALLY_WEBHOOK_SECRET is not configured; rejecting webhook.");
      return json({ error: "Webhook signing is not configured on the server." }, 503);
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return json({ error: "Webhook body must be valid JSON" }, 400);
    }

    const signature = req.headers.get("Tally-Signature") ?? "";
    // Tally documents the signature input as JSON.stringify(parsedPayload)
    // and the output as Base64-encoded HMAC-SHA256.
    const expected = await hmacSha256Base64(webhookSecret, JSON.stringify(payload));
    if (!signature || !safeEqual(signature.trim(), expected)) {
      return json({ error: "Invalid webhook signature" }, 401);
    }

    const formId = payload?.data?.formId ?? payload?.formId ?? "";
    if (formId !== "NpGzO0") {
      return json({ error: "Unknown or missing form" }, 400);
    }

    const values = extractFields(payload);
    const admissionNo = String(values["admission number"] ?? "").trim();
    const studentName = String(values["student name"] ?? "").trim();
    const email = String(values["email address"] ?? "").trim().toLowerCase();
    const submittedSection = String(values["section"] ?? "").trim();
    const phone = String(values["phone number"] ?? "").trim();
    const registrationToken = String(values["registration_token"] ?? "").trim();

    if (!admissionNo || !studentName || !email) {
      return json({ error: "Required registration fields are missing" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase service configuration is missing");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const normalizedAdmission = normalize(admissionNo);

    const { data: admissions, error: admissionError } = await supabase
      .from("admission_directory")
      .select("admission_no,student_name,program,section")
      .limit(1000);

    if (admissionError) throw admissionError;

    const matchedAdmission = (admissions ?? []).find(
      (row) => normalize(row.admission_no) === normalizedAdmission,
    );

    if (!matchedAdmission && registrationToken) {
      return json({
        error:
          "The corrected admission number is not in the official admission directory. Please check it and submit again.",
        code: "ADMISSION_NOT_FOUND_FOR_EDIT",
      }, 422);
    }

    const section = matchedAdmission?.section ?? (submittedSection || "CSM7");

    let existingByToken: any = null;

    if (registrationToken) {
      const hash = await tokenHash(registrationToken);

      const { data, error } = await supabase
        .from("student_registrations")
        .select("id,admission_no,status,auth_user_id,email")
        .eq("edit_token_hash", hash)
        .eq("status", "needs_edit")
        .gt("edit_token_expires_at", new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      existingByToken = data;

      if (!existingByToken) {
        return json({
          error:
            "This registration edit link is invalid or expired. Please ask the owner for a new edit link.",
          code: "EDIT_LINK_INVALID",
        }, 410);
      }
    }

    const [
      { data: existingByEmail, error: emailLookupError },
      { data: existingByAdmission, error: admissionLookupError },
    ] = await Promise.all([
      supabase
        .from("student_registrations")
        .select("id,admission_no,status,auth_user_id,email")
        .eq("email", email)
        .maybeSingle(),
      supabase
        .from("student_registrations")
        .select("id,admission_no,status,auth_user_id,email")
        .eq("admission_no", admissionNo)
        .maybeSingle(),
    ]);

    if (emailLookupError) throw emailLookupError;
    if (admissionLookupError) throw admissionLookupError;

    const editedId = existingByToken?.id ?? null;

    if (
      existingByEmail &&
      existingByAdmission &&
      existingByEmail.id !== existingByAdmission.id
    ) {
      return json({
        error:
          "This email and admission number belong to different registration records. Please contact the administrator.",
        code: "REGISTRATION_IDENTITY_CONFLICT",
      }, 409);
    }

    if (
      existingByEmail &&
      existingByEmail.id !== editedId &&
      normalize(existingByEmail.admission_no) !== normalizedAdmission
    ) {
      return json({
        error:
          "This email is already registered with a different admission number.",
        code: "EMAIL_ADMISSION_CONFLICT",
      }, 409);
    }

    if (
      existingByAdmission &&
      existingByAdmission.id !== editedId &&
      existingByAdmission.email.toLowerCase() !== email
    ) {
      return json({
        error:
          "This admission number is already registered with a different email.",
        code: "ADMISSION_EMAIL_CONFLICT",
      }, 409);
    }

    const existing = existingByToken ?? existingByAdmission ?? existingByEmail;
    const existingId = existing?.id;

    let nextStatus = "rejected";

    if (existing?.status === "linked") {
      nextStatus = "linked";
    } else if (matchedAdmission && (existing?.status !== "rejected" || existingByToken)) {
      nextStatus = "pending";
    } else if (!existing) {
      nextStatus = matchedAdmission ? "pending" : "rejected";
    }

    const officialName = matchedAdmission?.student_name || studentName;

    const row = {
      admission_no: admissionNo,
      student_name: officialName,
      email,
      section,
      phone: phone || null,
      status: nextStatus,
      source: "tally",
      edit_token_hash: null,
      edit_token_expires_at: null,
      updated_at: new Date().toISOString(),
    };

    const result = existingId
      ? await supabase
          .from("student_registrations")
          .update(row)
          .eq("id", existingId)
          .select()
          .single()
      : await supabase
          .from("student_registrations")
          .insert({
            ...row,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

    if (result.error) throw result.error;

    return json({
      ok: true,
      registration_id: result.data.id,
      status: nextStatus,
      admission_match: Boolean(matchedAdmission),
      section,
      submitted_section: submittedSection || null,
      edit_resubmission: Boolean(existingByToken),
    }, 200);
  } catch (error) {
    console.error("tally-registration-webhook", error);

    return json({
      error: error instanceof Error
        ? error.message
        : "Webhook processing failed",
    }, 500);
  }
});