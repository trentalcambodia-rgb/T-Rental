import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { BookingRequestCard, RenterRiskProfile } from './BookingRequestCard';
import { getBookings, auth } from '../src/lib/supabase';

// MOCK DATA for Renters (Typically fetched from DB)
const MOCK_RENTERS: Record<string, RenterRiskProfile> = {
  'u_dara': {
    id: 'u_dara',
    email: 'dara@email.com',
    full_name: 'Dara Chan',
    avatar_url: 'https://picsum.photos/seed/dara/150',
    t_points: 250,
    tier: 'GOLD',
    is_verified: true,
    created_at: '2023-01-01',
    completed_rentals: 12,
    late_returns: 0,
    join_date: '2023-01-15'
  },
  'u_vibol': {
    id: 'u_vibol',
    email: 'vibol@email.com',
    full_name: 'Vibol S.',
    avatar_url: 'https://picsum.photos/seed/vibol/150',
    t_points: 40,
    tier: 'BRONZE',
    is_verified: false,
    created_at: '2023-10-01',
    completed_rentals: 0, 
    late_returns: 0,
    join_date: '2023-10-20'
  }
};

export const LenderRequestsScreen: React.FC = () => {
   const [requests, setRequests] = useState<Booking[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchRequests = async () => {
       const user = auth.currentUser;
       if (!user) return;

       try {
         // In a real app, we'd filter by owner_id on the server
         const data = await getBookings();
         // Filter for REQUESTED status
         setRequests(data.filter(b => b.status === BookingStatus.REQUESTED));
       } catch (error) {
         console.error('Error fetching requests:', error);
       } finally {
         setLoading(false);
       }
     };

     fetchRequests();
   }, []);

  const removeRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="bg-background min-h-full pb-20">
       <header className="bg-white pt-12 pb-4 px-6 shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-xs text-gray-500 font-medium">Rental Requests ({requests.length})</p>
      </header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.length === 0 ? (
            <div className="col-span-full text-center py-10 opacity-50">
            <div className="text-4xl mb-2">📭</div>
            <p className="font-bold text-gray-500">All caught up!</p>
            </div>
        ) : (
            requests.map(req => {
                const renter = MOCK_RENTERS[req.renter_id];
                return (
                    <BookingRequestCard 
                    key={req.id}
                    booking={req}
                    renter={renter}
                    onAccept={() => { alert('Accepted & Contract Generated'); removeRequest(req.id); }}
                    onDecline={() => { if(confirm('Decline this request?')) removeRequest(req.id); }}
                    onChat={() => alert(`Chat opened with ${renter.full_name}`)}
                    />
                );
            })
        )}
      </div>
    </div>
  );
}