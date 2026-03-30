
import React from 'react';

// Domain Entities

export enum UserRole {
  RENTER = 'RENTER',
  LENDER = 'LENDER', // Individual
  SHOP = 'SHOP',     // Business with high inventory
  ADMIN = 'ADMIN'
}

export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface Profile {
  id: string; // UUID from auth.users
  email: string;
  full_name: string;
  avatar_url: string;
  
  // Module 1: Gamification
  t_points: number; // Trust Score
  tier: UserTier;
  
  is_verified: boolean; // KYC Status
  wallet_address?: string; // Web3 placeholder
  telegram_chat_id?: string; // For Module 3: Notifications
  created_at: string;
}

export interface GamificationLog {
  id: string;
  user_id: string;
  points_change: number;
  reason: string;
  related_booking_id?: string;
  created_at: string;
}

export interface ChargeRecord {
  id: string;
  user_id: string;
  booking_id?: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  description: string;
  location_lat?: number;
  location_long?: number;
  telegram_username?: string;
  is_verified: boolean;
  opening_hours?: string;
  created_at: string;
}

export interface Location {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  gps_lat: number;
  gps_long: number;
  opening_hours: string;
  is_active: boolean;
}

export type ShopLocationType = 'OWNED' | 'PARTNER';

export interface ShopLocation {
  id: string;
  shop_id: string;
  name: string;
  type: ShopLocationType;
  gps_lat: number;
  gps_long: number;
  capacity: number;
  partner_contact_info?: string;
  is_active: boolean;
}

export enum ItemCategory {
  VEHICLE = 'Vehicle',
  ELECTRONICS = 'Electronics',
  FASHION = 'Fashion',
  TOOLS = 'Tools',
  OTHER = 'Other'
}

export interface Item {
  id: string;
  owner_id: string;
  shop_id?: string; // Nullable, links to Shop if applicable
  current_location_id?: string; // Link to Station (Public)
  current_shop_location_id?: string; // Link to Fleet Location (Internal)
  
  title: string;
  description: string;
  category: ItemCategory;
  price_per_day: number;
  currency: 'USD' | 'KHR';
  image_url: string;
  
  // Geospatial
  latitude: number;
  longitude: number;
  
  availability_status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  quantity: number; // Module 1: Inventory Management
  voice_description_url?: string; // Module 3: Voice
  rating_avg: number;
}

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  PICKED_UP = 'PICKED_UP',
  RETURNED = 'RETURNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export interface Booking {
  id: string;
  renter_id: string;
  item_id: string;
  item_title: string; // Denormalized for offline cache display
  
  // Station Logic
  pickup_location_id?: string;
  return_location_id?: string;

  start_date: string; // ISO String
  end_date: string;   // ISO String
  total_price: number;
  status: BookingStatus;
  
  // Overdue Logic
  is_overdue?: boolean;
  late_fee_amount?: number;

  contract_url?: string; // Module 2: Digital Contract PDF
  created_at: string;
}

// UI State Types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  screen: string;
}
