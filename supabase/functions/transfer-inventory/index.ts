
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

    // Get input: Item ID, To Location ID, User performing action
    const { item_id, to_location_id, moved_by_id } = await req.json();

    if (!item_id || !to_location_id || !moved_by_id) {
      throw new Error("Missing required fields: item_id, to_location_id, moved_by_id");
    }

    // 1. Fetch Destination Location Details (Capacity)
    const { data: destLocation, error: locError } = await supabase
      .from('shop_locations')
      .select('id, capacity, name, gps_lat, gps_long')
      .eq('id', to_location_id)
      .single();

    if (locError || !destLocation) throw new Error("Destination location not found.");

    // 2. Check Current Capacity at Destination
    const { count: currentCount, error: countError } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('current_shop_location_id', to_location_id);
    
    if (countError) throw countError;

    if (currentCount !== null && currentCount >= destLocation.capacity) {
        return new Response(JSON.stringify({ 
            success: false, 
            message: `Transfer Failed: ${destLocation.name} is at full capacity (${currentCount}/${destLocation.capacity}).` 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });
    }

    // 3. Fetch Item to get 'From' location (for audit)
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('current_shop_location_id')
      .eq('id', item_id)
      .single();
    
    if (itemError) throw new Error("Item not found");

    const from_location_id = item.current_shop_location_id;

    if (from_location_id === to_location_id) {
         return new Response(JSON.stringify({ 
            success: true, 
            message: "Item is already at this location." 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Perform Transfer & Audit Log (Atomic-ish via separate calls, better with RPC but okay for Edge Fn)
    
    // A. Update Item
    const { error: updateError } = await supabase
        .from('items')
        .update({ 
            current_shop_location_id: to_location_id,
            // Update GPS coords to match the new location automatically
            latitude: destLocation.gps_lat,
            longitude: destLocation.gps_long
        })
        .eq('id', item_id);

    if (updateError) throw updateError;

    // B. Log Movement
    const { error: logError } = await supabase
        .from('inventory_movements')
        .insert({
            item_id: item_id,
            from_location_id: from_location_id,
            to_location_id: to_location_id,
            moved_by_id: moved_by_id,
            reason: 'FLEET_REBALANCING'
        });

    if (logError) console.error("Failed to log movement", logError); // Non-blocking error

    return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully transferred to ${destLocation.name}`,
        new_location: destLocation.name
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
