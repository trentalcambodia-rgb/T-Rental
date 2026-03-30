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
import { supabase, signInWithGoogle, signOut as supabaseSignOut, getProfile, createProfile, getItems } from './lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// --- SIGN IN SCREEN ---
// ... (SignInScreen code remains same)
const SignInScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 mb-8">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">T-RENTAL</h1>
      <p className="text-gray-500 mb-12 max-w-[280px]">The most trusted peer-to-peer rental marketplace in Cambodia.</p>
      
      <button 
        onClick={handleSignIn}
        disabled={loading}
        className="w-full max-w-xs py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 flex items-center justify-center gap-3 shadow-xl shadow-gray-100 active:scale-95 transition-all disabled:opacity-50"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
        {loading ? 'Connecting...' : 'Continue with Google'}
      </button>
      
      <p className="mt-8 text-xs text-gray-400 px-8">
        By continuing, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
};

// Simple Profile Screen since it was missing
const ProfileScreen = ({ user, userRole, onRoleChange }: { user: Profile, userRole: UserRole, onRoleChange: (role: UserRole) => void }) => {
  const handleLogout = async () => {
    try {
      await supabaseSignOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold overflow-hidden">
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.full_name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Switch Role</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(UserRole).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                  userRole === role 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-100' 
                    : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button className="w-full py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 text-left px-6 shadow-sm">
          Account Settings
        </button>
        <button className="w-full py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 text-left px-6 shadow-sm">
          Verification Status
        </button>
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-white border border-gray-100 rounded-2xl font-bold text-red-500 text-left px-6 shadow-sm active:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

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

  console.log("AppContent Render:", { isAuthReady, user: user?.id, profile: profile?.id, role });

  useEffect(() => {
    // Check if we are in a popup window that just completed OAuth
    if (window.opener && window.location.hash.includes('access_token')) {
      // Give Supabase a moment to process the token into localStorage
      setTimeout(() => {
        window.close();
      }, 1500);
    }

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
          syncProfile(session.user);
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

  const syncProfile = async (supabaseUser: User) => {
    try {
      let userProfile = await getProfile(supabaseUser.id);
      
      if (!userProfile) {
        // Create profile if it doesn't exist
        userProfile = await createProfile({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'User',
          avatar_url: supabaseUser.user_metadata.avatar_url || 'https://picsum.photos/150',
          email: supabaseUser.email || '',
        });
      }
      
      const mappedProfile: Profile = {
        id: userProfile.id,
        email: supabaseUser.email || '',
        full_name: userProfile.full_name,
        avatar_url: userProfile.avatar_url,
        t_points: userProfile.t_points,
        tier: userProfile.tier,
        is_verified: userProfile.is_verified,
        created_at: userProfile.created_at
      };
      
      setProfile(mappedProfile);
      
      if (userProfile.role) {
        setRole(userProfile.role as UserRole);
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

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <SignInScreen />;
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
        <Route path="/profile" element={<ProfileScreen user={profile} userRole={role} onRoleChange={switchRole} />} />
        
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
