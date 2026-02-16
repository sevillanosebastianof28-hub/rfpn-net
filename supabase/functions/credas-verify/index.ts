import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CREDAS_BASE = "https://portal.credas.com";
const IDENTITY_JOURNEY_ID = "9429d6b1-de6e-4fac-8343-9a48c4d5534f";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const CREDAS_API_KEY = Deno.env.get("CREDAS_API_KEY");
    if (!CREDAS_API_KEY) throw new Error("CREDAS_API_KEY not configured");

    // Auth
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

    // Get profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    // Build webhook URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const webhookUrl = `${supabaseUrl}/functions/v1/credas-webhook`;

    // Create Credas process
    const credasRes = await fetch(`${CREDAS_BASE}/api/v2/ci/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": CREDAS_API_KEY,
      },
      body: JSON.stringify({
        journeyId: IDENTITY_JOURNEY_ID,
        title: `Verification - ${profile.first_name} ${profile.last_name}`,
        webhookUrl,
        processEntities: [
          {
            emailAddress: profile.email,
            firstName: profile.first_name,
            surname: profile.last_name,
            actorId: 110,
            contactViaEmail: true,
            contactViaSms: false,
            inPerson: false,
          },
        ],
      }),
    });

    if (!credasRes.ok) {
      const errBody = await credasRes.text();
      throw new Error(`Credas API error [${credasRes.status}]: ${errBody}`);
    }

    const credasData = await credasRes.json();

    // Extract processId and entityId
    const processId = credasData.id;
    const entityId = credasData.processActors?.[0]?.entityId;

    // Update developer profile with Credas IDs
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await adminClient
      .from("developer_profiles")
      .update({
        credas_process_id: processId,
        credas_entity_id: entityId,
        credas_journey_id: IDENTITY_JOURNEY_ID,
        verification_status: "in_progress",
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification invite sent. Check your email.",
        processId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("credas-verify error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
