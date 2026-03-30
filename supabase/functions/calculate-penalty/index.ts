
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { booking_id, actual_return_time } = await req.json();

    if (!booking_id || !actual_return_time) {
      throw new Error("Missing booking_id or actual_return_time");
    }

    // 1. Fetch Booking and Item details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        items ( price_per_day, title )
      `)
      .eq('id', booking_id)
      .single();

    if (fetchError || !booking) throw new Error("Booking not found");

    const expectedEnd = new Date(booking.end_date);
    const actualReturn = new Date(actual_return_time);
    
    // Calculate Delay in Hours
    const diffMs = actualReturn.getTime() - expectedEnd.getTime();
    const hoursLate = Math.ceil(diffMs / (1000 * 60 * 60));

    // If returned early or on time, no penalty
    if (hoursLate <= 0) {
       return new Response(JSON.stringify({ 
           penalty_fee: 0, 
           points_deducted: 0, 
           message: "Returned on time." 
       }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let penaltyFee = 0;
    let pointsDeducted = 0;
    let penaltyReason = '';

    // 2. Logic Rules
    if (hoursLate < 2) {
        // Minor Delay Rule
        penaltyFee = 2.00;
        pointsDeducted = 50;
        penaltyReason = 'LATE_RETURN_MINOR';
    } else if (hoursLate > 24) {
        // Major Delay Rule
        // Penalty is 2 days worth of rental
        penaltyFee = booking.items.price_per_day * 2;
        pointsDeducted = 500;
        penaltyReason = 'LATE_RETURN_MAJOR';
    } else {
        // Standard Gap Logic (2-24 hours) - Fallback logic as per business standard
        // $2 per hour
        penaltyFee = hoursLate * 2.00; 
        pointsDeducted = 100; // Flat deduction for significant lateness
        penaltyReason = 'LATE_RETURN_STANDARD';
    }

    const negativePoints = -Math.abs(pointsDeducted);

    // 3. Execute Updates (Transaction-like)
    
    // A. Log Penalty in Ledger
    const { error: logError } = await supabase.from('gamification_log').insert({
        user_id: booking.renter_id,
        points_change: negativePoints,
        reason: penaltyReason,
        related_booking_id: booking_id,
        metadata: { hours_late: hoursLate }
    });
    if (logError) throw logError;

    // B. Create Charge Record
    const { error: chargeError } = await supabase.from('charge_records').insert({
        user_id: booking.renter_id,
        booking_id: booking_id,
        amount: penaltyFee,
        currency: 'USD',
        reason: penaltyReason,
        status: 'PENDING'
    });
    if (chargeError) throw chargeError;

    // C. Update Booking
    await supabase.from('bookings').update({
        is_overdue: true,
        late_fee_amount: penaltyFee
    }).eq('id', booking_id);

    return new Response(JSON.stringify({
      penalty_fee: penaltyFee,
      points_deducted: pointsDeducted,
      message: `You were ${hoursLate} hours late.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
