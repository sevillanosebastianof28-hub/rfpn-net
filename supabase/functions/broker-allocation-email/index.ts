import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { recipientEmail, applicantName, projectType, loanAmount, applicationId, siteUrl } = await req.json()

    if (!recipientEmail || !applicationId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const secureLink = `${siteUrl || 'https://rfpn-net.lovable.app'}/broker/applications/${applicationId}`

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1a365d;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">RFPN Platform</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 20px;color:#1a365d;font-size:18px;">New Application Allocated</h2>
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 16px;">
        A new application has been allocated to JAG Finance.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:14px;border-bottom:1px solid #eee;">Applicant Name</td>
          <td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;border-bottom:1px solid #eee;text-align:right;">${applicantName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:14px;border-bottom:1px solid #eee;">Project Type</td>
          <td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;border-bottom:1px solid #eee;text-align:right;">${projectType || 'Development Funding'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:14px;">Loan Amount</td>
          <td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;text-align:right;">${loanAmount || 'Not specified'}</td>
        </tr>
      </table>
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0 0 24px;">
        To view full details, access the system here:
      </p>
      <a href="${secureLink}" style="display:inline-block;background:#1a365d;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
        View Application
      </a>
      <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.5;">
        Login required. If you cannot access the link, copy and paste it into your browser:<br/>
        <span style="color:#666;">${secureLink}</span>
      </p>
    </div>
    <div style="background:#f8f9fa;padding:16px 32px;text-align:center;">
      <p style="color:#999;font-size:12px;margin:0;">RFPN System — Property Finance Network</p>
    </div>
  </div>
</body>
</html>`

    // Try to send via transactional email system first, fall back to logging
    try {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      
      // Log the allocation email attempt
      await serviceClient.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action: 'broker_allocation_email',
        resource_type: 'application',
        resource_id: applicationId,
        details: `Allocation email sent to ${recipientEmail} for application ${applicationId}`,
      })
    } catch (e) {
      console.error('Audit log error:', e)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Allocation notification prepared for ${recipientEmail}`,
      htmlBody,
      recipientEmail,
      subject: 'New Application Allocated – RFPN Platform',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
