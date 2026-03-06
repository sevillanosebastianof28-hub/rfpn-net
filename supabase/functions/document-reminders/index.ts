import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const REMINDER_DAYS = [14, 7, 3, 1];
    const now = new Date();
    const reminders: Array<{ documentId: string; ownerId: string; fileName: string; documentType: string; daysLeft: number }> = [];

    // Get all documents with a document_date set
    const { data: docs, error } = await supabase
      .from('documents')
      .select('id, owner_id, file_name, document_type, document_date')
      .not('document_date', 'is', null);

    if (error) throw error;

    for (const doc of docs || []) {
      const docDate = new Date(doc.document_date);
      const expiryDate = new Date(docDate);
      expiryDate.setDate(expiryDate.getDate() + 90);
      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (REMINDER_DAYS.includes(daysLeft)) {
        reminders.push({
          documentId: doc.id,
          ownerId: doc.owner_id,
          fileName: doc.file_name,
          documentType: doc.document_type,
          daysLeft,
        });
      }
    }

    // Log reminders (in production, send emails/notifications)
    console.log(`Found ${reminders.length} document expiry reminders`);

    // For each reminder, create an audit log entry so the system tracks it
    for (const r of reminders) {
      await supabase.from('audit_logs').insert({
        action: 'document_expiry_reminder',
        resource_type: 'document',
        resource_id: r.documentId,
        user_id: r.ownerId,
        details: `Document "${r.fileName}" (${r.documentType}) expires in ${r.daysLeft} day(s). Please upload a fresh copy.`,
      });
    }

    return new Response(JSON.stringify({ reminders: reminders.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
