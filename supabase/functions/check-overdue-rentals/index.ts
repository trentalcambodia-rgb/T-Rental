
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CONSTANTS
const HOURLY_LATE_FEE_USD = 2.00;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Admin Client (Service Role) to bypass RLS for background jobs
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();

    // 2. Find Active Bookings that are Past Due
    // Status must be 'PICKED_UP' (not yet Returned) and End Date < Now
    const { data: overdueBookings, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        renter_id,
        start_date,
        end_date,
        total_price,
        items ( title ),
        locations ( name )
      `)
      .eq('status', 'PICKED_UP')
      .lt('end_date', now);

    if (fetchError) throw fetchError;

    if (!overdueBookings || overdueBookings.length === 0) {
      return new Response(JSON.stringify({ message: "No overdue rentals found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updates = [];
    const notifications = [];

    // 3. Calculate Fees & Prepare Updates
    for (const booking of overdueBookings) {
      const endDate = new Date(booking.end_date);
      const currentDate = new Date();
      
      // Calculate hours late (milliseconds -> hours)
      const diffMs = currentDate.getTime() - endDate.getTime();
      // Ceiling ensures that 1 min late = 1 hour charged (strict policy)
      const hoursLate = Math.ceil(diffMs / (1000 * 60 * 60));

      if (hoursLate > 0) {
        const fee = hoursLate * HOURLY_LATE_FEE_USD;

        // Update Booking Record
        updates.push(
            supabaseAdmin
                .from('bookings')
                .update({ 
                    is_overdue: true,
                    late_fee_amount: fee 
                })
                .eq('id', booking.id)
        );

        // Prepare Notification
        notifications.push({
            user_id: booking.renter_id,
            type: 'LATE_ALERT',
            message: `URGENT: Your rental '${booking.items.title}' is ${hoursLate} hours late. Current Late Fee: $${fee}. Please return to ${booking.locations?.name || 'the station'} immediately.`,
            status: 'UNREAD'
        });
      }
    }

    // 4. Execute Batch Updates
    await Promise.all(updates);
    
    if (notifications.length > 0) {
        await supabaseAdmin.from('admin_notifications').insert(notifications);
    }

    return new Response(JSON.stringify({ 
        success: true, 
        processed: overdueBookings.length,
        message: `Processed ${overdueBookings.length} overdue rentals.` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
