import { createClient } from '@supabase/supabase-js';
import { Item } from '../../types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Sanitize the URL and Key to remove any accidental whitespace or quotes from env vars
const supabaseUrl = rawUrl ? rawUrl.trim().replace(/^["']|["']$/g, '') : '';
const supabaseKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your environment variables.');
} else {
  console.log("Supabase URL and Key found, initializing client...");
}

// Ensure we have a valid URL before calling createClient to avoid the "Invalid supabaseUrl" error
export const supabase = (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (supabase) {
  console.log("SUPABASE_CONNECTED");
} else if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  console.error(`Invalid Supabase URL format: ${supabaseUrl}. Must start with http:// or https://`);
}

export const auth = supabase?.auth;

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getProfile = async (userId: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createProfile = async (profile: { id: string; full_name: string; avatar_url: string; email: string }) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getItems = async (filters?: { owner_id?: string; category?: string }) => {
  if (!supabase) return [];
  let query = supabase.from('items').select('*');
  
  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }
  
  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createItem = async (item: Partial<Item>) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getBookings = async (filters?: { renter_id?: string; owner_id?: string }) => {
  if (!supabase) return [];
  let query = supabase.from('bookings').select('*, items(*)');
  
  if (filters?.renter_id) {
    query = query.eq('renter_id', filters.renter_id);
  }
  
  if (filters?.owner_id) {
    // This would require a join or a different query if we want to filter by item owner
    // For now, let's assume we fetch all and filter client-side if needed, 
    // or we can implement a more complex query.
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createBooking = async (booking: any) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
