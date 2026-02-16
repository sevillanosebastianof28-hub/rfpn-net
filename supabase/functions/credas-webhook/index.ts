import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.log("Credas webhook received:", JSON.stringify(body));

    const { ProcessId, Status, StatusDescription } = body;

    if (!ProcessId) throw new Error("Missing ProcessId");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Status 2 = process complete
    if (Status === 2) {
      // Retrieve verification summary from Credas
      const CREDAS_API_KEY = Deno.env.get("CREDAS_API_KEY");

      // Find the developer profile by process ID
      const { data: devProfile } = await supabase
        .from("developer_profiles")
        .select("id, credas_entity_id, user_id")
        .eq("credas_process_id", ProcessId)
        .single();

      if (!devProfile) {
        console.error("No developer profile found for ProcessId:", ProcessId);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      let verificationResult: "passed" | "failed" = "passed";

      // If we have the API key and entity ID, fetch the summary
      if (CREDAS_API_KEY && devProfile.credas_entity_id) {
        try {
          const summaryRes = await fetch(
            `https://portal.credas.com/api/v2/ci/entities/${devProfile.credas_entity_id}/summary`,
            { headers: { "X-API-KEY": CREDAS_API_KEY } }
          );

          if (summaryRes.ok) {
            const summary = await summaryRes.json();
            console.log("Credas summary:", JSON.stringify(summary));
            // Check if any checks failed — adjust based on actual Credas response structure
            const hasFailed = summary?.checks?.some(
              (c: any) => c.result === "fail" || c.result === "Failed"
            );
            if (hasFailed) verificationResult = "failed";
          }
        } catch (e) {
          console.error("Failed to fetch Credas summary:", e);
        }
      }

      // Update developer profile
      await supabase
        .from("developer_profiles")
        .update({
          verification_status: verificationResult,
          kyc_status: verificationResult,
          verification_completed_at: new Date().toISOString(),
          kyc_checked_at: new Date().toISOString(),
        })
        .eq("credas_process_id", ProcessId);

      // Audit log
      await supabase.from("audit_logs").insert({
        user_id: devProfile.user_id,
        action: "credas_verification_complete",
        resource_type: "developer_profile",
        resource_id: devProfile.id,
        details: `Credas verification ${verificationResult}. Status: ${StatusDescription}`,
      });

      console.log(`Verification ${verificationResult} for ProcessId: ${ProcessId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
