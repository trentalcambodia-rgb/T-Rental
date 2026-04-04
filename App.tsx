
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { ShopAddItemScreen } from './components/ShopAddItemScreen';
import { LenderListingScreen } from './components/LenderListingScreen';
import { ShopDashboardScreen } from './components/ShopDashboardScreen'; // Retaining for legacy/stats view reference
import { MultiSiteDashboard } from './components/MultiSiteDashboard'; // NEW
import { ShopCalendarScreen } from './components/ShopCalendarScreen';
import { ShopInventoryScreen } from './components/ShopInventoryScreen';
import { ItemDetailsScreen } from './components/ItemDetailsScreen'; 
import { RenterHomeScreen } from './components/RenterHomeScreen'; 
import { MyRentalsScreen } from './components/MyRentalsScreen'; 
import { LenderInventoryScreen } from './components/LenderInventoryScreen'; 
import { LenderRequestsScreen } from './components/LenderRequestsScreen'; 
import { LenderDashboardScreen } from './components/LenderDashboardScreen'; 
import { UserRole, Profile, Item, ItemCategory } from './types';

// --- MOCK DATA ---
const CURRENT_USER: Profile = {
  id: 'u1',
  email: 'sokha@t-rental.kh',
  full_name: 'Sokha Visal',
  avatar_url: 'https://picsum.photos/150',
  t_points: 85,
  tier: 'SILVER',
  is_verified: true, // Set to false to test the Booking Gate in Details Screen
  created_at: new Date().toISOString()
};

const ITEMS: Item[] = [
  {
    id: '1',
    owner_id: 'u2',
    title: 'Honda Dream 2023',
    description: 'Perfect condition, includes 2 helmets. Ideal for city traffic.',
    category: ItemCategory.VEHICLE,
    price_per_day: 8,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    latitude: 11.5564,
    longitude: 104.9282,
    availability_status: 'AVAILABLE',
    rating_avg: 4.8,
    quantity: 2
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.RENTER);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Navigation State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    // Reset tab to default for that role
    if (newRole === UserRole.RENTER) setActiveTab('home');
    else setActiveTab('dashboard');
  };
  
  // --- SCREEN ROUTING LOGIC ---

  // 1. Modal / Full Screen Overlays
  if (isAddingItem) {
    if (currentRole === UserRole.SHOP) {
      return <ShopAddItemScreen onCancel={() => setIsAddingItem(false)} onSuccess={() => setIsAddingItem(false)} />;
    }
    if (currentRole === UserRole.LENDER) {
      return <LenderListingScreen currentUser={CURRENT_USER} onCancel={() => setIsAddingItem(false)} onSuccess={() => setIsAddingItem(false)} />;
    }
  }

  // 2. Item Details (Renter Flow)
  if (selectedItem) {
    return (
      <ItemDetailsScreen 
        item={selectedItem} 
        currentUser={CURRENT_USER}
        onBack={() => setSelectedItem(null)}
        onSuccess={() => setSelectedItem(null)}
      />
    );
  }

  const renderScreen = () => {
    // --- ADMIN VIEWS ---
    if (currentRole === UserRole.ADMIN) {
      if (activeTab === 'dashboard') return <AdminDashboardScreen activeTab="dashboard" />;
      if (activeTab === 'users') return <AdminDashboardScreen activeTab="users" />;
      if (activeTab === 'rentals') return <AdminDashboardScreen activeTab="rentals" />;
      if (activeTab === 'profile') return <ProfileScreen user={CURRENT_USER} role={currentRole} onSwitch={switchRole} />;
      return <AdminDashboardScreen />;
    }

    // --- LENDER VIEWS ---
    if (currentRole === UserRole.LENDER) {
      if (activeTab === 'dashboard') return <LenderDashboardScreen />;
      // Pass ITEMS (filtered by owner in real app) to inventory
      if (activeTab === 'inventory') return <LenderInventoryScreen items={ITEMS} onAddItem={() => setIsAddingItem(true)} />;
      if (activeTab === 'requests') return <LenderRequestsScreen />;
      if (activeTab === 'profile') return <ProfileScreen user={CURRENT_USER} role={currentRole} onSwitch={switchRole} />;
      return <div className="p-8 pt-20 text-center text-text-muted font-medium">Lender Feature Coming Soon</div>;
    }

    // --- SHOP VIEWS ---
    if (currentRole === UserRole.SHOP) {
      // Switched 'dashboard' to use the new MultiSiteDashboard (Fleet Manager)
      if (activeTab === 'dashboard') return <MultiSiteDashboard onAddItem={() => setIsAddingItem(true)} />;
      if (activeTab === 'calendar') return <ShopCalendarScreen />;
      if (activeTab === 'inventory') return <ShopInventoryScreen items={ITEMS} onAddItem={() => setIsAddingItem(true)} />;
      if (activeTab === 'profile') return <ProfileScreen user={CURRENT_USER} role={currentRole} onSwitch={switchRole} />;
      return <div className="p-8 pt-20 text-center text-text-muted font-medium">Shop Feature Coming Soon</div>;
    }

    // --- RENTER VIEWS ---
    switch (activeTab) {
      case 'home': return <RenterHomeScreen onItemClick={setSelectedItem} />;
      case 'map': return <MapScreenPlaceholder />;
      case 'bookings': return <MyRentalsScreen />;
      case 'profile': return <ProfileScreen user={CURRENT_USER} role={currentRole} onSwitch={switchRole} />;
      default: return <div className="p-8 pt-20 text-center text-text-muted font-medium">Feature Coming Soon</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} role={currentRole}>
      {isOffline && (
        <div className="bg-secondary text-white text-xs font-bold text-center py-2 px-2 absolute top-0 w-full z-50 animate-pulse">
          Offline Mode • Showing cached data
        </div>
      )}
      {renderScreen()}
    </Layout>
  );
}

// --- COMPONENTS ---

const MapScreenPlaceholder = () => (
  <div className="h-full w-full bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-4xl">
        🗺️
    </div>
    <h2 className="text-xl font-bold text-text-main mb-2">Explore Nearby</h2>
    <p className="text-text-muted text-sm max-w-xs mb-6">Full Map Screen. Switch to 'Explore' tab to see the new Map Toggle.</p>
  </div>
);

const ProfileScreen = ({ user, role, onSwitch }: { user: Profile, role: UserRole, onSwitch: (r: UserRole) => void }) => (
  <div className="pb-10 bg-background">
    {/* Clean White Header */}
    <div className="bg-white pt-12 pb-8 px-6 border-b border-gray-100 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gray-100 mb-4">
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
        <p className="text-gray-500 text-sm mb-4">{user.email}</p>
        
        <div className="flex gap-4">
             <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-lg font-bold text-primary">{user.t_points}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Score</p>
             </div>
             <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-lg font-bold text-primary">{user.is_verified ? 'Yes' : 'No'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Verified</p>
             </div>
        </div>
    </div>

    <div className="px-6 mt-6 space-y-6">
        {/* 3-Way Role Switcher */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Switch Account Mode</p>
            <div className="grid grid-cols-3 gap-2">
                {[UserRole.RENTER, UserRole.LENDER, UserRole.SHOP, UserRole.ADMIN].map(r => (
                    <button 
                        key={r}
                        onClick={() => onSwitch(r)}
                        className={`
                            py-2.5 rounded-xl text-xs font-bold border transition-all duration-200
                            ${role === r 
                                ? 'bg-text-main text-white border-text-main shadow-md transform scale-105' 
                                : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}
                        `}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Account</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ProfileLink icon="🆔" label="Identity Verification" status={user.is_verified ? 'Verified' : 'Required'} />
                <ProfileLink icon="💳" label="Payment Methods" />
                <ProfileLink icon="🌍" label="Language" value="English" />
            </div>
        </div>
        
        <button className="w-full py-3 text-red-600 font-bold text-sm bg-white border border-red-100 rounded-xl">
            Log Out
        </button>
    </div>
  </div>
);

const ProfileLink = ({ icon, label, value, status }: { icon: string, label: string, value?: string, status?: string }) => (
  <div className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
    <span className="mr-3 text-lg">{icon}</span>
    <span className="flex-1 font-semibold text-gray-700 text-sm">{label}</span>
    {value && <span className="text-xs text-gray-400 font-medium mr-2">{value}</span>}
    {status && <span className={`text-xs font-bold mr-2 ${status === 'Verified' ? 'text-green-500' : 'text-orange-500'}`}>{status}</span>}
    <span className="text-gray-300">›</span>
  </div>
);
