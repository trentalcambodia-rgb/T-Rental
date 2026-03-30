import { createClient } from '@supabase/supabase-js';
import { Item } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
export const auth = supabase.auth;

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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createProfile = async (profile: { id: string; full_name: string; avatar_url: string; email: string }) => {
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
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getBookings = async (filters?: { renter_id?: string; owner_id?: string }) => {
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
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
