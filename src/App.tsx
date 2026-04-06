import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserRole, Item, Profile, ItemCategory } from '../types';
import { Layout } from '../components/Layout';
import { RenterHomeScreen } from '../components/RenterHomeScreen';
import { ItemDetailsScreen } from '../components/ItemDetailsScreen';
import { MyRentalsScreen } from '../components/MyRentalsScreen';
import { LenderDashboardScreen } from '../components/LenderDashboardScreen';
import { LenderInventoryScreen } from '../components/LenderInventoryScreen';
import { LenderRequestsScreen } from '../components/LenderRequestsScreen';
import { ShopDashboardScreen } from '../components/ShopDashboardScreen';
import { ShopCalendarScreen } from '../components/ShopCalendarScreen';
import { ShopInventoryScreen } from '../components/ShopInventoryScreen';
import { AdminDashboardScreen } from '../components/AdminDashboardScreen';
import { ShopAddItemScreen } from '../components/ShopAddItemScreen';
import { LenderListingScreen } from '../components/LenderListingScreen';
import { Login } from '../components/Login';
import { supabase, signInWithGoogle, signOut as supabaseSignOut, getProfile, createProfile, getItems } from './lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Simple Profile Screen since it was missing
const ProfileScreen = ({ user, userRole, onRoleChange, onLogout }: { user: Profile, userRole: UserRole, onRoleChange: (role: UserRole) => void, onLogout: () => void }) => {
  return (
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
};

const ProfileLink = ({ icon, label, value, status }: { icon: string, label: string, value?: string, status?: string }) => (
  <div className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
    <span className="mr-3 text-lg">{icon}</span>
    <span className="flex-1 font-semibold text-gray-700 text-sm">{label}</span>
    {value && <span className="text-xs text-gray-400 font-medium mr-2">{value}</span>}
    {status && <span className={`text-xs font-bold mr-2 ${status === 'Verified' ? 'text-green-500' : 'text-orange-500'}`}>{status}</span>}
    <span className="text-gray-300">›</span>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.RENTER);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout to prevent indefinite loading screen
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn("Auth check timed out, forcing ready state");
        setIsAuthReady(true);
      }
    }, 5000);

    // Check current session
    if (supabase) {
      console.log("Supabase initialized, checking session...");
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        clearTimeout(timeout);
        if (!isMounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
          setIsAuthReady(true);
          return;
        }
        console.log("Session check complete:", session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          syncProfile(session.user);
        }
        setIsAuthReady(true);
      }).catch(err => {
        clearTimeout(timeout);
        if (!isMounted) return;
        console.error("Fatal error in getSession:", err);
        setIsAuthReady(true);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed:", _event, session?.user?.id);
        if (!isMounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          syncProfile(session.user, _event === 'SIGNED_IN');
        } else {
          setProfile(null);
          setItems([]);
        }
        setIsAuthReady(true);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    } else {
      console.warn("Supabase NOT initialized - check environment variables");
      setIsAuthReady(true);
      clearTimeout(timeout);
    }
  }, []);

  const syncProfile = async (supabaseUser: User, isLoginEvent: boolean = false) => {
    try {
      let userProfile = await getProfile(supabaseUser.id);
      
      if (!userProfile) {
        // Create profile if it doesn't exist
        userProfile = await createProfile({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
          avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || 'https://picsum.photos/150',
          email: supabaseUser.email || '',
        });
      }
      
      const mappedProfile: Profile = {
        id: userProfile.id,
        email: supabaseUser.email || '',
        full_name: userProfile.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
        avatar_url: userProfile.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || 'https://picsum.photos/150',
        t_points: userProfile.t_points || 0,
        tier: userProfile.tier || 'BRONZE',
        is_verified: userProfile.is_verified || false,
        created_at: userProfile.created_at
      };
      
      setProfile(mappedProfile);
      
      if (userProfile.role) {
        setRole(userProfile.role as UserRole);
      }
      
      if (isLoginEvent || !userProfile.role) {
        setNeedsRoleSelection(true);
      } else {
        setNeedsRoleSelection(false);
      }

      // Fetch items for this user if they are a lender or shop
      const userItems = await getItems({ owner_id: supabaseUser.id });
      setItems(userItems as Item[]);

    } catch (error) {
      console.error("Error syncing profile", error);
    }
  };

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
    setRole(newRole);
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      await supabaseSignOut();
      console.log("Logout successful");
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile || needsRoleSelection) {
    return (
      <Login 
        user={user} 
        onRoleSelect={async (r) => {
          if (user) {
            try {
              await supabase.from('profiles').update({ role: r }).eq('id', user.id);
            } catch (error) {
              console.error("Failed to save role", error);
            }
          }
          setRole(r);
          setNeedsRoleSelection(false);
        }} 
      />
    );
  }

  return (
    <Layout role={role}>
      {isOffline && (
        <div className="bg-secondary text-white text-xs font-bold text-center py-2 px-2 absolute top-0 w-full z-50 animate-pulse">
          Offline Mode • Showing cached data
        </div>
      )}
      
      <Routes>
        {/* Renter Routes */}
        {role === UserRole.RENTER && (
          <>
            <Route path="/" element={<RenterHomeScreen onItemClick={(item) => navigate(`/item/${item.id}`, { state: { item } })} />} />
            <Route path="/bookings" element={<MyRentalsScreen />} />
            <Route path="/item/:id" element={<ItemDetailsWrapper profile={profile} />} />
          </>
        )}

        {/* Lender Routes */}
        {role === UserRole.LENDER && (
          <>
            <Route path="/" element={<LenderDashboardScreen />} />
            <Route path="/inventory" element={<LenderInventoryScreen items={items} onAddItem={() => navigate('/add-item')} />} />
            <Route path="/requests" element={<LenderRequestsScreen />} />
            <Route path="/add-item" element={<LenderListingScreen currentUser={profile} onCancel={() => navigate(-1)} onSuccess={() => navigate('/inventory')} />} />
          </>
        )}

        {/* Shop Routes */}
        {role === UserRole.SHOP && (
          <>
            <Route path="/" element={<ShopDashboardScreen onAddItem={() => navigate('/add-item')} />} />
            <Route path="/calendar" element={<ShopCalendarScreen />} />
            <Route path="/inventory" element={<ShopInventoryScreen items={items} onAddItem={() => navigate('/add-item')} />} />
            <Route path="/add-item" element={<ShopAddItemScreen onCancel={() => navigate(-1)} onSuccess={() => navigate('/inventory')} />} />
          </>
        )}

        {/* Admin Routes */}
        {role === UserRole.ADMIN && (
          <>
            <Route path="/" element={<AdminDashboardScreen activeTab="dashboard" />} />
            <Route path="/users" element={<AdminDashboardScreen activeTab="users" />} />
            <Route path="/disputes" element={<AdminDashboardScreen activeTab="disputes" />} />
          </>
        )}

        {/* Common Routes */}
        <Route path="/profile" element={<ProfileScreen user={profile} userRole={role} onRoleChange={switchRole} onLogout={handleLogout} />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

// Helper to handle item details with route params
function ItemDetailsWrapper({ profile }: { profile: Profile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  // In a real app, we would fetch the item by ID if not in state
  if (!item) return <Navigate to="/" replace />;

  return (
    <ItemDetailsScreen 
      item={item} 
      currentUser={profile} 
      onBack={() => navigate(-1)} 
      onSuccess={() => navigate('/bookings')} 
    />
  );
}
