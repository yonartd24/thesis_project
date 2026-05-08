import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

type RequestPayload = {
  weeks?: number[];
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SECRET_KEY")
    ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      {
        error:
          "Missing SUPABASE_URL and SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in the Edge Function environment.",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  let payload: RequestPayload = {};

  if (request.method === "POST") {
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }
  }

  const weeks = (payload.weeks ?? []).filter((value) => value >= 1 && value <= 3);

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let query = supabaseAdmin
    .from("card_entries")
    .select(
      "entry_id, week_number, stage, q1_score, q2_score, q3_score, q4_score, participant_age, participant_gender, doodle_storage_path",
    )
    .order("week_number", { ascending: true })
    .order("stage", { ascending: true })
    .order("entry_id", { ascending: true });

  if (weeks.length) {
    query = query.in("week_number", weeks);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json(
      { error: error.message },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  return Response.json(
    {
      entries: data ?? [],
    },
    { headers: corsHeaders },
  );
});