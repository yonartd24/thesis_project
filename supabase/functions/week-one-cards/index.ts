import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
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

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabaseAdmin
    .from("card_entries")
    .select(
      "entry_id, week_number, stage, q1_score, q2_score, q3_score, q4_score, participant_age, participant_gender, doodle_storage_path",
    )
    .eq("week_number", 1)
    .order("stage", { ascending: true })
    .order("entry_id", { ascending: true });

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
      week: 1,
      cards: data ?? [],
    },
    { headers: corsHeaders },
  );
});
