import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    // Get developer profile verification status
    const { data: devProfile } = await supabase
      .from("developer_profiles")
      .select(
        "verification_status, kyc_status, credas_process_id, credas_entity_id, verification_completed_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (!devProfile) {
      return new Response(
        JSON.stringify({ verification_status: "not_started", has_profile: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally poll Credas for live status if in_progress
    let liveStatus = null;
    if (
      devProfile.verification_status === "in_progress" &&
      devProfile.credas_entity_id
    ) {
      const CREDAS_API_KEY = Deno.env.get("CREDAS_API_KEY");
      if (CREDAS_API_KEY) {
        try {
          const res = await fetch(
            `https://portal.credas.com/api/v2/ci/entities/${devProfile.credas_entity_id}/summary`,
            { headers: { "X-API-KEY": CREDAS_API_KEY } }
          );
          if (res.ok) {
            liveStatus = await res.json();
          } else {
            await res.text(); // consume body
          }
        } catch (e) {
          console.error("Credas status poll error:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        verification_status: devProfile.verification_status,
        kyc_status: devProfile.kyc_status,
        has_credas_process: !!devProfile.credas_process_id,
        verification_completed_at: devProfile.verification_completed_at,
        live_status: liveStatus,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
