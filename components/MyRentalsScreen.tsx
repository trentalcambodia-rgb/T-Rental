import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { getBookings, auth } from '../src/lib/supabase';

type TabType = 'PENDING' | 'ACTIVE' | 'HISTORY';

export const MyRentalsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getBookings({ renter_id: user.id });
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter Logic
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'PENDING') return b.status === BookingStatus.REQUESTED;
    if (activeTab === 'ACTIVE') return [BookingStatus.APPROVED, BookingStatus.PICKED_UP, BookingStatus.CONFIRMED].includes(b.status);
    if (activeTab === 'HISTORY') return [BookingStatus.COMPLETED, BookingStatus.RETURNED, BookingStatus.CANCELLED, BookingStatus.DISPUTED].includes(b.status);
    return false;
  });

  return (
    <div className="bg-background min-h-full flex flex-col relative pb-24">
      
      {/* 1. Header & Tabs */}
      <div className="bg-white pt-12 shadow-sm sticky top-0 z-20">
         <div className="px-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <p className="text-xs text-gray-500 font-medium">Manage your rentals</p>
         </div>
         
         {/* Top Tabs */}
         <div className="flex px-2 border-b border-gray-100">
            <TabButton label="Active" active={activeTab === 'ACTIVE'} onClick={() => setActiveTab('ACTIVE')} />
            <TabButton label="Pending" active={activeTab === 'PENDING'} onClick={() => setActiveTab('PENDING')} />
            <TabButton label="History" active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} />
         </div>
      </div>

      {/* 2. List Content */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
             <div className="col-span-full text-center py-10 text-gray-400">Loading trips...</div>
         ) : filteredBookings.length === 0 ? (
             <div className="col-span-full">
                <EmptyState tab={activeTab} />
             </div>
         ) : (
             filteredBookings.map(booking => {
                 if (activeTab === 'ACTIVE') return <ActiveTripCard key={booking.id} booking={booking} />;
                 if (activeTab === 'PENDING') return <PendingTripCard key={booking.id} booking={booking} />;
                 return <HistoryTripCard key={booking.id} booking={booking} />;
             })
         )}
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${active ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
    >
      {label}
    </button>
);

const ActiveTripCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    // Countdown Timer Hook
    const calculateTimeLeft = () => {
        const difference = +new Date(booking.end_date) - +new Date();
        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60)
            };
        }
        return null; // Overdue
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const isOverdue = !timeLeft;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [booking.end_date]);

    return (
        <div className="bg-white rounded-2xl p-0 shadow-card border border-gray-100 overflow-hidden">
            {/* Countdown Header */}
            <div className={`p-4 text-center ${isOverdue ? 'bg-red-500' : 'bg-primary'} text-white`}>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                    {isOverdue ? '⚠️ Overdue by' : 'Time Remaining'}
                </p>
                {isOverdue ? (
                    <span className="text-2xl font-bold">Return Immediately</span>
                ) : (
                    <div className="flex justify-center items-end gap-1">
                        <span className="text-3xl font-bold">{timeLeft?.days}d</span>
                        <span className="text-xl font-medium opacity-80 mb-1">{timeLeft?.hours}h</span>
                        <span className="text-xl font-medium opacity-80 mb-1">{timeLeft?.minutes}m</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                         <img src={`https://picsum.photos/seed/${booking.item_id}/200`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{booking.item_title}</h3>
                        <p className="text-xs text-gray-500 mt-1">Lender: <span className="font-bold text-gray-700">Sokha V.</span></p>
                        <div className="flex items-center gap-1 mt-2">
                             <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ● In Progress
                             </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <button onClick={() => alert("PDF Downloaded")} className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 border border-gray-200">
                        <span>📄 Contract</span>
                    </button>
                    <button onClick={() => alert("Chat Opened")} className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 border border-gray-200">
                        <span>💬 Message</span>
                    </button>
                </div>
                
                <button onClick={() => alert("Report Flow")} className="w-full text-center text-xs text-red-400 font-bold mt-2">
                    Report an Issue
                </button>
            </div>
        </div>
    );
};

const PendingTripCard: React.FC<{ booking: Booking }> = ({ booking }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">Waiting for approval</span>
            </div>
            <span className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex gap-3">
             <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                 <img src={`https://picsum.photos/seed/${booking.item_id}/200`} className="w-full h-full object-cover" />
             </div>
             <div>
                 <h3 className="font-bold text-gray-900 text-sm">{booking.item_title}</h3>
                 <p className="text-xs text-gray-500">
                     {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                 </p>
                 <p className="font-bold text-gray-900 text-sm mt-1">${booking.total_price}</p>
             </div>
        </div>
        <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500">
            Cancel Request
        </button>
    </div>
);

const HistoryTripCard: React.FC<{ booking: Booking }> = ({ booking }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex justify-between items-start">
             <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 grayscale">
                    <img src={`https://picsum.photos/seed/${booking.item_id}/200`} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{booking.item_title}</h3>
                    <p className="text-xs text-gray-500">
                        {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
                        {booking.status}
                    </span>
                </div>
             </div>
             <div>
                {booking.status === 'COMPLETED' && (
                    <button className="text-primary text-xs font-bold border border-indigo-100 px-3 py-1.5 rounded-lg">
                        Rent Again
                    </button>
                )}
             </div>
        </div>
    </div>
);

const EmptyState = ({ tab }: { tab: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
        <div className="text-4xl mb-2">
            {tab === 'PENDING' ? '⏳' : tab === 'ACTIVE' ? '🚲' : '📜'}
        </div>
        <p className="text-sm font-bold text-gray-600">No {tab.toLowerCase()} trips</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
            {tab === 'ACTIVE' ? "Ready for an adventure? Find something to rent nearby." : "Your history will appear here."}
        </p>
    </div>
);
