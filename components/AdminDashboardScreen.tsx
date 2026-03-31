import React, { useState } from 'react';
import { UserRole, Profile, Booking, BookingStatus } from '../types';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter,
  MoreVertical,
  CircleCheck,
  ExternalLink
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_STATS = {
  totalUsers: 1240,
  activeRentals: 86,
  totalRevenue: 15420,
  pendingVerifications: 12,
  openDisputes: 3
};

const MOCK_USERS: Profile[] = [
  {
    id: 'u1',
    email: 'sokha.v@email.com',
    full_name: 'Sokha Visal',
    avatar_url: 'https://picsum.photos/seed/sokha/150',
    t_points: 450,
    tier: 'GOLD',
    is_verified: true,
    created_at: '2023-01-15'
  },
  {
    id: 'u2',
    email: 'dara.c@email.com',
    full_name: 'Dara Chan',
    avatar_url: 'https://picsum.photos/seed/dara/150',
    t_points: 120,
    tier: 'BRONZE',
    is_verified: false,
    created_at: '2024-02-10'
  },
  {
    id: 'u3',
    email: 'vibol.s@email.com',
    full_name: 'Vibol Samnang',
    avatar_url: 'https://picsum.photos/seed/vibol/150',
    t_points: 280,
    tier: 'SILVER',
    is_verified: true,
    created_at: '2023-11-20'
  }
];

const MOCK_DISPUTES: Booking[] = [
  {
    id: 'b_disp_1',
    renter_id: 'u2',
    item_id: 'i1',
    item_title: 'Honda Dream 2023',
    start_date: '2024-03-20',
    end_date: '2024-03-22',
    total_price: 24,
    status: BookingStatus.DISPUTED,
    created_at: '2024-03-22'
  }
];

const MOCK_RENTALS: Booking[] = [
  {
    id: 'b1',
    renter_id: 'u1',
    item_id: 'i1',
    item_title: 'Honda Dream 2023',
    start_date: '2024-03-25',
    end_date: '2024-03-27',
    total_price: 24,
    status: BookingStatus.REQUESTED,
    created_at: '2024-03-24'
  },
  {
    id: 'b2',
    renter_id: 'u2',
    item_id: 'i2',
    item_title: 'MacBook Pro',
    start_date: '2024-03-26',
    end_date: '2024-03-28',
    total_price: 100,
    status: BookingStatus.APPROVED,
    created_at: '2024-03-25'
  }
];

export const AdminDashboardScreen: React.FC<{ activeTab?: string }> = ({ activeTab: layoutTab }) => {
  const [internalTab, setInternalTab] = useState<'OVERVIEW' | 'USERS' | 'DISPUTES' | 'RENTALS'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with layout tab if provided
  const currentTab = layoutTab === 'users' ? 'USERS' : 
                     layoutTab === 'disputes' ? 'DISPUTES' : 
                     layoutTab === 'rentals' ? 'RENTALS' :
                     layoutTab === 'dashboard' ? 'OVERVIEW' : internalTab;

  return (
    <div className="bg-gray-50 min-h-full pb-20 pt-12">
      {/* Header */}
      <div className="px-6 mb-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Platform management & oversight</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-start">
            <TabButton 
              label="Overview" 
              active={currentTab === 'OVERVIEW'} 
              onClick={() => setInternalTab('OVERVIEW')} 
            />
            <TabButton 
              label="Users" 
              active={currentTab === 'USERS'} 
              onClick={() => setInternalTab('USERS')} 
            />
            <TabButton 
              label="Rentals" 
              active={currentTab === 'RENTALS'} 
              onClick={() => setInternalTab('RENTALS')} 
            />
            <TabButton 
              label="Disputes" 
              active={currentTab === 'DISPUTES'} 
              onClick={() => setInternalTab('DISPUTES')} 
            />
          </div>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {currentTab === 'OVERVIEW' && <OverviewTab />}
        {currentTab === 'USERS' && <UsersTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {currentTab === 'RENTALS' && <RentalsTab />}
        {currentTab === 'DISPUTES' && <DisputesTab />}
      </div>
    </div>
  );
};

// --- TABS ---

const OverviewTab = () => (
  <div className="space-y-8">
    {/* Header Actions */}
    <div className="flex justify-between items-center">
      <h3 className="font-bold text-gray-900 text-xl">Dashboard Overview</h3>
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-600">System Healthy</span>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm">
          Export Report
        </button>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Users" 
        value={MOCK_STATS.totalUsers.toLocaleString()} 
        icon={<Users className="w-6 h-6 text-blue-600" />} 
        trend="+12% this month"
        color="blue"
      />
      <StatCard 
        title="Active Rentals" 
        value={MOCK_STATS.activeRentals.toString()} 
        icon={<TrendingUp className="w-6 h-6 text-green-600" />} 
        trend="8 active now"
        color="green"
      />
      <StatCard 
        title="Pending KYC" 
        value={MOCK_STATS.pendingVerifications.toString()} 
        icon={<ShieldCheck className="w-6 h-6 text-orange-600" />} 
        trend="Requires action"
        color="orange"
      />
      <StatCard 
        title="Open Disputes" 
        value={MOCK_STATS.openDisputes.toString()} 
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />} 
        trend="High priority"
        color="red"
      />
    </div>

    {/* Secondary Section */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Revenue Growth</h3>
        <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
          <span className="text-gray-400 text-sm font-medium italic">Revenue Chart Placeholder</span>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem 
            title="New User Registered" 
            time="2 mins ago" 
            user="Dara C." 
            type="user"
          />
          <ActivityItem 
            title="Booking Completed" 
            time="15 mins ago" 
            user="Sokha V." 
            type="booking"
          />
          <ActivityItem 
            title="KYC Submitted" 
            time="1 hour ago" 
            user="Vibol S." 
            type="kyc"
          />
        </div>
      </div>
    </div>
  </div>
);

const UsersTab = ({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (s: string) => void }) => (
  <div className="space-y-6">
    {/* Search & Filter */}
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by name, email or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>
      <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl flex items-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
        <Filter className="w-5 h-5" />
        <span>Filters</span>
      </button>
    </div>

    {/* Users List */}
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_USERS.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                      <CircleCheck className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100">
                      <AlertTriangle className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{user.t_points}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      user.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-700' : 
                      user.tier === 'SILVER' ? 'bg-gray-100 text-gray-600' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {user.tier}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DisputesTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_DISPUTES.map(dispute => (
        <div key={dispute.id} className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider">
            High Priority
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
              <img src={`https://picsum.photos/seed/${dispute.item_id}/200`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg leading-tight">{dispute.item_title}</h4>
              <p className="text-xs text-gray-500 mt-1">Booking ID: <span className="font-mono">{dispute.id}</span></p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  Disputed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Renter</span>
              <span className="font-bold text-gray-900">Dara Chan (u2)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Lender</span>
              <span className="font-bold text-gray-900">Sokha Visal (u1)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-red-600">${dispute.total_price} (Held)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all">
              Review Case
            </button>
            <button className="py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all">
              Contact Parties
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RentalsTab = () => {
  const [rentals, setRentals] = useState<Booking[]>(MOCK_RENTALS);

  const handleAction = (id: string, status: BookingStatus) => {
    setRentals(rentals.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Renter</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dates</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rentals.map(rental => (
            <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900 text-sm">{rental.item_title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{rental.renter_id}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{rental.start_date} - {rental.end_date}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  rental.status === BookingStatus.REQUESTED ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                  rental.status === BookingStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-100' :
                  'bg-gray-50 text-gray-700 border-gray-100'
                }`}>
                  {rental.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {rental.status === BookingStatus.REQUESTED && (
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(rental.id, BookingStatus.APPROVED)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleAction(rental.id, BookingStatus.CANCELLED)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- HELPERS ---

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
      active 
        ? 'bg-primary text-white shadow-md' 
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ title, value, icon, trend, color }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-50 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
        <ExternalLink className="w-4 h-4 text-gray-400" />
      </button>
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
    <h4 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{value}</h4>
    <p className={`text-[10px] font-bold ${color === 'red' ? 'text-red-500' : 'text-green-500'}`}>{trend}</p>
  </div>
);

const ActivityItem = ({ title, time, user, type }: { title: string, time: string, user: string, type: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
      type === 'user' ? 'bg-blue-400' : type === 'booking' ? 'bg-green-400' : 'bg-orange-400'
    }`} />
    <div className="flex-1">
      <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{title}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] text-gray-400 font-medium">{time}</span>
        <span className="text-[10px] text-gray-500 font-bold">• {user}</span>
      </div>
    </div>
  </div>
);
