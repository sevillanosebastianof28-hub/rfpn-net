import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface KycRequest {
  applicationId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  city: string;
  postcode: string;
  country?: string;
  email?: string;
  phone?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Parse request
    const body: KycRequest = await req.json();
    if (!body.firstName || !body.lastName || !body.dateOfBirth || !body.postcode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: firstName, lastName, dateOfBirth, postcode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate date format
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(body.dateOfBirth)) {
      return new Response(
        JSON.stringify({ error: "dateOfBirth must be in YYYY-MM-DD format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load Experian credentials
    const EXPERIAN_BASE_URL = Deno.env.get("EXPERIAN_BASE_URL");
    const EXPERIAN_USERNAME = Deno.env.get("EXPERIAN_USERNAME");
    const EXPERIAN_PASSWORD = Deno.env.get("EXPERIAN_PASSWORD");
    const EXPERIAN_API_KEY = Deno.env.get("EXPERIAN_API_KEY");

    if (!EXPERIAN_BASE_URL || !EXPERIAN_USERNAME || !EXPERIAN_PASSWORD || !EXPERIAN_API_KEY) {
      console.error("Missing Experian configuration");
      return new Response(
        JSON.stringify({ error: "Identity verification service is not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestTimestamp = new Date().toISOString();
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Get OAuth token from Experian using password grant
    const authUrl = `${EXPERIAN_BASE_URL}/oauth2/v1/token`;
    const authBody = new URLSearchParams({
      grant_type: "password",
      username: EXPERIAN_USERNAME,
      password: EXPERIAN_PASSWORD,
      client_id: EXPERIAN_API_KEY,
    });

    console.log(`Requesting token from: ${authUrl}`);

    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: authBody.toString(),
    });

    if (!authResponse.ok) {
      const authErrorBody = await authResponse.text();
      console.error(`Experian auth failed [${authResponse.status}]: ${authErrorBody}`);

      // Save failed attempt
      await adminClient.from("kyc_verifications").insert({
        application_id: body.applicationId || null,
        applicant_user_id: userId,
        provider: "experian",
        verification_status: "FAILED",
        error_message: `OAuth failed: HTTP ${authResponse.status}`,
        request_timestamp: requestTimestamp,
        response_timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: "Unable to complete verification at this time",
          status: "FAILED",
          debug: `Auth returned ${authResponse.status}`,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authResult = await authResponse.json();
    const accessToken = authResult.access_token;
    console.log("Experian OAuth token obtained successfully");

    // Step 2: Build CrossCore KYC request payload (matching sandbox spec)
    const kycPayload = {
      header: {
        tenantId: "",
        requestType: "UKCCIS-QA",
        clientReferenceId: body.applicationId || `rfpn-${Date.now()}`,
        expRequestId: "",
        messageTime: new Date().toISOString(),
        txnId: "",
        time: "",
        options: {},
      },
      payload: {
        control: [
          { option: "KYC_CLIENTTIERVERSION", value: "version1" },
        ],
        contacts: [
          {
            id: "MAINCONTACT_1",
            person: {
              personDetails: {
                dateOfBirth: body.dateOfBirth,
                typeOfPerson: "APPLICANT",
              },
              names: [
                {
                  id: "MAINPERSONNAME_1",
                  type: "CURRENT",
                  firstName: body.firstName.trim(),
                  middleNames: body.middleName?.trim() || "",
                  surName: body.lastName.trim(),
                },
              ],
            },
            addresses: [
              {
                id: "MAINAPPADDRESS_1",
                addressIdentifier: "ADDRESS_1",
                indicator: "RESIDENTIAL",
                addressType: "CURRENT",
                street: body.address.trim(),
                postTown: body.city.trim(),
                postal: body.postcode.trim().toUpperCase(),
                countryCode: body.country || "GBR",
              },
            ],
          },
        ],
        application: {
          applicants: [
            {
              id: "APPLICANT_1",
              contactId: "MAINCONTACT_1",
              type: "INDIVIDUAL",
              applicantType: "APPLICANT",
              consent: true,
            },
          ],
        },
      },
    };

    // Step 3: Call Experian KYC endpoint (sandbox path)
    const kycUrl = `${EXPERIAN_BASE_URL}/da/ccis-devportalapis/v1/KYC`;
    console.log(`Calling KYC endpoint: ${kycUrl}`);

    const kycResponse = await fetch(kycUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(kycPayload),
    });

    const responseTimestamp = new Date().toISOString();

    if (!kycResponse.ok) {
      const errorText = await kycResponse.text();
      console.error(`Experian KYC call failed [${kycResponse.status}]: ${errorText}`);

      await adminClient.from("kyc_verifications").insert({
        application_id: body.applicationId || null,
        applicant_user_id: userId,
        provider: "experian",
        verification_status: "FAILED",
        error_message: `KYC endpoint returned HTTP ${kycResponse.status}`,
        request_timestamp: requestTimestamp,
        response_timestamp: responseTimestamp,
      });

      return new Response(
        JSON.stringify({
          status: "FAILED",
          message: "Unable to complete verification at this time. Please try again later.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const kycResult = await kycResponse.json();
    console.log("Experian KYC response received:", JSON.stringify(kycResult).substring(0, 500));

    // Step 4: Normalize Experian response
    const responseHeader = kycResult?.responseHeader || kycResult?.header || {};
    const overallResponse = responseHeader?.overallResponse || {};
    const overallDecision = overallResponse?.decision || "UNKNOWN";
    const providerReference = responseHeader?.expRequestId || responseHeader?.clientReferenceId || null;
    const score = overallResponse?.score ?? null;

    // Map Experian decisions to RFPN statuses
    let verificationStatus: string;
    let userMessage: string;

    switch (overallDecision.toUpperCase()) {
      case "ACCEPT":
        verificationStatus = "VERIFIED";
        userMessage = "Identity verified successfully";
        break;
      case "REFER":
      case "MANUAL":
        verificationStatus = "REVIEW_REQUIRED";
        userMessage = "Verification requires manual review";
        break;
      case "DECLINE":
      case "REJECT":
      case "STOP":
        verificationStatus = "FAILED";
        userMessage = "Verification was not successful";
        break;
      default:
        verificationStatus = "REVIEW_REQUIRED";
        userMessage = `Verification returned decision: ${overallDecision}`;
    }

    // Extract sub-decisions
    const decisionElements = kycResult?.clientResponsePayload?.decisionElements || [];
    const orchestrationDecisions = kycResult?.clientResponsePayload?.orchestrationDecisions || [];
    const subDecisions = overallResponse?.decisionReasons || [];

    const matchSummary = {
      overallDecision,
      decisionReasons: subDecisions,
      decisionElements: decisionElements.length,
      orchestrationDecisions: orchestrationDecisions.length,
      score,
    };

    // Build verified fields if accepted
    const verifiedFields: Record<string, unknown> = {};
    if (verificationStatus === "VERIFIED") {
      verifiedFields.firstName = body.firstName;
      verifiedFields.middleName = body.middleName || null;
      verifiedFields.lastName = body.lastName;
      verifiedFields.dateOfBirth = body.dateOfBirth;
      verifiedFields.address = body.address;
      verifiedFields.city = body.city;
      verifiedFields.postcode = body.postcode;
      verifiedFields.country = body.country || "GBR";
    }

    // Step 5: Save verification record
    const { data: savedRecord, error: saveError } = await adminClient
      .from("kyc_verifications")
      .insert({
        application_id: body.applicationId || null,
        applicant_user_id: userId,
        provider: "experian",
        verification_status: verificationStatus,
        provider_reference: providerReference,
        match_summary: matchSummary,
        score,
        decision: overallDecision,
        sub_decisions: { decisionElements, orchestrationDecisions, subDecisions },
        verified_fields: verifiedFields,
        request_timestamp: requestTimestamp,
        response_timestamp: responseTimestamp,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Failed to save KYC record:", saveError.message);
    }

    // Step 6: Return response to frontend
    return new Response(
      JSON.stringify({
        status: verificationStatus,
        message: userMessage,
        verificationId: savedRecord?.id || null,
        providerReference,
        score,
        matchSummary: {
          decision: overallDecision,
          decisionElementCount: decisionElements.length,
          reasonCount: subDecisions.length,
        },
        verifiedFields: verificationStatus === "VERIFIED" ? verifiedFields : null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("KYC verification error:", error);
    return new Response(
      JSON.stringify({
        status: "FAILED",
        error: "An unexpected error occurred during verification",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
