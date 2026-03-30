import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record: any
  schema: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();

    // Only process updates to the 'profiles' table
    if (payload.table !== 'profiles') {
      return new Response(JSON.stringify({ message: "Ignored table" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { record, old_record } = payload;

    // Logic: If ID Card URLs have changed and are not empty, set status to PENDING
    const idFrontChanged = record.id_card_front_url !== old_record.id_card_front_url;
    const idBackChanged = record.id_card_back_url !== old_record.id_card_back_url;
    const hasImages = record.id_card_front_url && record.id_card_back_url;

    if ((idFrontChanged || idBackChanged) && hasImages && record.verification_status === 'UNVERIFIED') {
      
      // 1. Update Profile Status to PENDING (System Action)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_status: 'PENDING' })
        .eq('id', record.id);

      if (updateError) throw updateError;

      // 2. Notify Admin
      const { error: notifyError } = await supabase
        .from('admin_notifications')
        .insert({
          user_id: record.id,
          type: 'KYC_REVIEW',
          message: `User ${record.full_name || 'Unknown'} has submitted ID documents for review.`,
          status: 'UNREAD'
        });

      if (notifyError) throw notifyError;

      return new Response(JSON.stringify({ message: "Verification status updated to PENDING and Admin notified." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: "No action required." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});