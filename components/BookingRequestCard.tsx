import React from 'react';
import { Booking, Profile } from '../types';

// Extended Profile type for the UI to include computed safety stats
// In a real app, these would come from a "reputation" view in Supabase
export interface RenterRiskProfile extends Profile {
  completed_rentals: number;
  late_returns: number;
  join_date: string;
}

interface BookingRequestCardProps {
  booking: Booking;
  renter: RenterRiskProfile;
  onAccept: () => void;
  onDecline: () => void;
  onChat: () => void;
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({ 
  booking, 
  renter, 
  onAccept, 
  onDecline, 
  onChat 
}) => {
  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  // Risk Analysis Logic
  const isHighRisk = renter.t_points < 50 || renter.late_returns > 0;
  const isNewUser = renter.completed_rentals === 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. Renter Header & Trust Badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="relative">
             <img 
               src={renter.avatar_url} 
               alt={renter.full_name} 
               className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
             />
             {renter.is_verified && (
               <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white" title="ID Verified">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
             )}
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{renter.full_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {/* T-Points Badge */}
              <div className={`
                flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border
                ${isHighRisk ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}
              `}>
                <span>🛡️</span>
                <span>{renter.t_points} T-Points</span>
              </div>
              
              {isNewUser && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold border border-blue-100">
                  New
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Date Context */}
        <div className="text-right">
           <span className="block text-2xl font-bold text-primary">${booking.total_price}</span>
           <span className="text-xs text-gray-400 font-medium">{durationDays} Days</span>
        </div>
      </div>

      {/* 2. Safety Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-xl p-2 border border-gray-100">
         <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Rentals</p>
            <p className="font-bold text-gray-900">{renter.completed_rentals}</p>
         </div>
         <div className="text-center border-l border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase">On Time</p>
            <p className="font-bold text-gray-900">
              {renter.completed_rentals > 0 
                ? `${Math.round(((renter.completed_rentals - renter.late_returns) / renter.completed_rentals) * 100)}%`
                : '-'}
            </p>
         </div>
         <div className="text-center border-l border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Join Date</p>
            <p className="font-bold text-gray-900 text-xs mt-0.5">{new Date(renter.join_date).toLocaleDateString(undefined, { month: 'short', year: '2-digit'})}</p>
         </div>
      </div>

      {/* 3. Request Details */}
      <div className="mb-5">
        <p className="text-xs text-gray-500 mb-1">Requesting to rent:</p>
        <div className="flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
           <div className="w-8 h-8 bg-gray-200 rounded-md shrink-0 flex items-center justify-center text-xs">📦</div>
           <p className="font-bold text-sm text-gray-800 truncate">{booking.item_title}</p>
        </div>
        <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                📅 {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
        </div>
      </div>

      {/* 4. Action Area */}
      <div className="space-y-3">
        {/* Chat First CTA */}
        <button 
          onClick={onChat}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
        >
          <span className="text-base">💬</span>
          Ask about trip details
        </button>

        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={onDecline}
             className="py-3 rounded-xl bg-white border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
           >
             Decline
           </button>
           <button 
             onClick={onAccept}
             className="py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <span>Accept Request</span>
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </button>
        </div>
      </div>

    </div>
  );
};
