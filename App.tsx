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
import { supabase, signInWithGoogle, signOut } from './src/lib/supabase';

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
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
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

    // Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        const newProfile: Profile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || 'https://picsum.photos/150',
          t_points: 0,
          tier: 'BRONZE',
          is_verified: true,
          created_at: user.created_at
        };
        setCurrentUser(newProfile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to login with Google.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setActiveTab('home');
      setCurrentRole(UserRole.RENTER);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    // Reset tab to default for that role
    if (newRole === UserRole.RENTER) setActiveTab('home');
    else setActiveTab('dashboard');
  };
  
  // --- SCREEN ROUTING LOGIC ---

  if (!currentUser) {
    return <LoginScreen onLogin={handleGoogleLogin} />;
  }

  // 1. Modal / Full Screen Overlays
  if (isAddingItem) {
    if (currentRole === UserRole.SHOP) {
      return <ShopAddItemScreen onCancel={() => setIsAddingItem(false)} onSuccess={() => setIsAddingItem(false)} />;
    }
    if (currentRole === UserRole.LENDER) {
      return <LenderListingScreen currentUser={currentUser} onCancel={() => setIsAddingItem(false)} onSuccess={() => setIsAddingItem(false)} />;
    }
  }

  // 2. Item Details (Renter Flow)
  if (selectedItem) {
    return (
      <ItemDetailsScreen 
        item={selectedItem} 
        currentUser={currentUser}
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
      if (activeTab === 'profile') return <ProfileScreen user={currentUser} role={currentRole} onSwitch={switchRole} onLogout={handleLogout} />;
      return <AdminDashboardScreen />;
    }

    // --- LENDER VIEWS ---
    if (currentRole === UserRole.LENDER) {
      if (activeTab === 'dashboard') return <LenderDashboardScreen />;
      // Pass ITEMS (filtered by owner in real app) to inventory
      if (activeTab === 'inventory') return <LenderInventoryScreen items={ITEMS} onAddItem={() => setIsAddingItem(true)} />;
      if (activeTab === 'requests') return <LenderRequestsScreen />;
      if (activeTab === 'profile') return <ProfileScreen user={currentUser} role={currentRole} onSwitch={switchRole} onLogout={handleLogout} />;
      return <div className="p-8 pt-20 text-center text-text-muted font-medium">Lender Feature Coming Soon</div>;
    }

    // --- SHOP VIEWS ---
    if (currentRole === UserRole.SHOP) {
      // Switched 'dashboard' to use the new MultiSiteDashboard (Fleet Manager)
      if (activeTab === 'dashboard') return <MultiSiteDashboard onAddItem={() => setIsAddingItem(true)} />;
      if (activeTab === 'calendar') return <ShopCalendarScreen />;
      if (activeTab === 'inventory') return <ShopInventoryScreen items={ITEMS} onAddItem={() => setIsAddingItem(true)} />;
      if (activeTab === 'profile') return <ProfileScreen user={currentUser} role={currentRole} onSwitch={switchRole} onLogout={handleLogout} />;
      return <div className="p-8 pt-20 text-center text-text-muted font-medium">Shop Feature Coming Soon</div>;
    }

    // --- RENTER VIEWS ---
    switch (activeTab) {
      case 'home': return <RenterHomeScreen onItemClick={setSelectedItem} />;
      case 'map': return <MapScreenPlaceholder />;
      case 'bookings': return <MyRentalsScreen />;
      case 'profile': return <ProfileScreen user={currentUser} role={currentRole} onSwitch={switchRole} onLogout={handleLogout} />;
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

const ProfileScreen = ({ user, role, onSwitch, onLogout }: { user: Profile, role: UserRole, onSwitch: (r: UserRole) => void, onLogout: () => void }) => (
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
        
        <button onClick={onLogout} className="w-full py-3 text-red-600 font-bold text-sm bg-white border border-red-100 rounded-xl">
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

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
    <div className="w-24 h-24 bg-primary text-white rounded-3xl flex items-center justify-center mb-8 text-4xl shadow-lg">
      T
    </div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to T-Rental</h1>
    <p className="text-gray-500 text-center mb-10 max-w-xs">Rent vehicles, equipment, and more from trusted locals.</p>
    
    <button 
      onClick={onLogin}
      className="w-full max-w-sm flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  </div>
);
