import React, { useState, useEffect } from 'react';
import { Item, Profile, Booking, BookingStatus } from '../types';
import { createBooking, getBookings } from '../src/lib/supabase';

interface ItemDetailsScreenProps {
  item: Item;
  currentUser: Profile;
  onBack: () => void;
  onSuccess: () => void;
}

// Function to fetch existing bookings for this item to block dates
const fetchItemBookings = async (itemId: string): Promise<string[]> => {
  try {
    // In a real app, we'd filter by item_id in the query
    // For now, let's just use getBookings and filter manually if needed, 
    // or better, add a specific query if we had it.
    // Since I didn't add item_id filter to getBookings yet, I'll just return empty for now
    // or I can update getBookings to support item_id.
    return [];
  } catch (error) {
    console.error("Error fetching item bookings", error);
    return [];
  }
};

export const ItemDetailsScreen: React.FC<ItemDetailsScreenProps> = ({ item, currentUser, onBack, onSuccess }) => {
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerifyAlert, setShowVerifyAlert] = useState(false);

  // Load blocked dates on mount
  useEffect(() => {
    fetchItemBookings(item.id).then(dates => setBlockedDates(new Set(dates)));
  }, [item.id]);

  // Derived State
  const daysCount = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  const totalPrice = daysCount * item.price_per_day;

  const handleBookingRequest = async () => {
    if (!startDate || !endDate) return alert("Please select rental dates.");

    // 1. Verification Check
    if (!currentUser.is_verified) {
      setShowVerifyAlert(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await createBooking({
        renter_id: currentUser.id,
        item_id: item.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_price: totalPrice,
        status: 'REQUESTED'
      });
      
      alert("Request Sent! The owner will review it shortly.");
      onSuccess();
    } catch (e) {
      console.error("Booking failed", e);
      alert("Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-full flex flex-col relative z-50 animate-in slide-in-from-right duration-300 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto border-x border-gray-100 shadow-2xl">
      
      {/* 1. Header with Image */}
      <div className="relative h-64 bg-gray-200">
        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        
        {/* Navbar Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onBack} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex gap-2">
             <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">❤️</button>
             <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">↗️</button>
          </div>
        </div>
      </div>

      {/* 2. Content Container */}
      <div className="flex-1 bg-background -mt-6 rounded-t-3xl relative px-6 pt-8 pb-32 overflow-y-auto">
        
        {/* Title & Price */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight w-2/3">{item.title}</h1>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">${item.price_per_day}</p>
            <p className="text-xs text-gray-500">per day</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
           <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{item.category}</span>
           <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
             ⭐ {item.rating_avg} (12 reviews)
           </span>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm mb-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                 <img src={`https://picsum.photos/seed/${item.owner_id}/100`} alt="Owner" />
              </div>
              <div>
                 <p className="text-xs text-gray-400 font-bold uppercase">Lender</p>
                 <p className="font-bold text-gray-900 text-sm">Sokha V.</p>
              </div>
           </div>
           <button className="text-primary text-xs font-bold border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-lg">
             View Profile
           </button>
        </div>

        {/* Description */}
        <div className="mb-8">
           <h3 className="font-bold text-gray-900 mb-2">Description</h3>
           <p className="text-sm text-gray-500 leading-relaxed">
             {item.description || "No description provided. Please contact the lender for more details about the condition and included accessories."}
           </p>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
           <h3 className="font-bold text-gray-900 mb-4">Select Dates</h3>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
              <BookingRangeCalendar 
                blockedDates={blockedDates}
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => { setStartDate(start); setEndDate(end); }}
              />
           </div>
           
           <div className="flex gap-2 mt-3">
              <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3">
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Pick-up</p>
                 <p className="font-bold text-gray-900 text-sm">{startDate ? startDate.toLocaleDateString() : '-'}</p>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3">
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Return</p>
                 <p className="font-bold text-gray-900 text-sm">{endDate ? endDate.toLocaleDateString() : '-'}</p>
              </div>
           </div>
        </div>

      </div>

      {/* 3. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-safe shadow-nav z-50 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto right-0">
        <div className="flex justify-between items-center mb-3">
           <div>
              <p className="text-xs text-gray-500 font-medium">Total Estimated</p>
              <p className="text-2xl font-bold text-gray-900">${totalPrice > 0 ? totalPrice : 0}</p>
           </div>
           {daysCount > 0 && <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-1 rounded">{daysCount} Days</span>}
        </div>
        
        <button 
           onClick={handleBookingRequest}
           disabled={isSubmitting || !startDate || !endDate}
           className={`
             w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95
             ${!startDate || !endDate ? 'bg-gray-300 shadow-none' : 'bg-primary shadow-indigo-200'}
           `}
        >
           {isSubmitting ? 'Processing...' : 'Request to Rent'}
        </button>
      </div>

      {/* Verification Alert Modal */}
      {showVerifyAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🆔
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Verification Required</h3>
              <p className="text-gray-500 text-sm mb-6">
                To build trust in our community, you must verify your ID before making your first rental request.
              </p>
              <button 
                onClick={() => { setShowVerifyAlert(false); /* Navigate to verification */ }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl mb-3"
              >
                Verify Identity
              </button>
              <button 
                onClick={() => setShowVerifyAlert(false)}
                className="text-gray-400 font-bold text-sm"
              >
                Maybe Later
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

// --- Custom Range Calendar Component ---
const BookingRangeCalendar = ({ 
    blockedDates, 
    startDate, 
    endDate, 
    onChange 
}: { 
    blockedDates: Set<string>, 
    startDate: Date | null, 
    endDate: Date | null,
    onChange: (s: Date | null, e: Date | null) => void 
}) => {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const handleDayClick = (day: number) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        if (blockedDates.has(dateStr)) return; // Ignore blocked

        const clickedDate = new Date(year, month, day);

        // Logic for Range Selection
        if (!startDate || (startDate && endDate)) {
            // New Selection Start
            onChange(clickedDate, null);
        } else {
            // Selecting End Date
            if (clickedDate < startDate) {
                // User clicked a date BEFORE start, so swap or reset
                onChange(clickedDate, null);
            } else {
                // Valid range? Check for blocked dates in between
                let valid = true;
                let curr = new Date(startDate);
                while (curr < clickedDate) {
                    curr.setDate(curr.getDate() + 1);
                    if (blockedDates.has(curr.toISOString().split('T')[0])) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    onChange(startDate, clickedDate);
                } else {
                    alert("Selected range includes unavailable dates.");
                    onChange(clickedDate, null); // Reset to new start
                }
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center p-2 mb-2">
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded">◀</button>
                <span className="font-bold text-sm text-gray-800">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded">▶</button>
            </div>
            
            <div className="grid grid-cols-7 text-center mb-1">
                {['S','M','T','W','T','F','S'].map((d, idx) => <span key={`${d}-${idx}`} className="text-[10px] text-gray-400 font-bold">{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(year, month, day);
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const isBlocked = blockedDates.has(dateStr);
                    
                    let isSelected = false;
                    let isRange = false;
                    let isStart = false;
                    let isEnd = false;

                    if (startDate && dateObj.getTime() === startDate.getTime()) { isSelected = true; isStart = true; }
                    if (endDate && dateObj.getTime() === endDate.getTime()) { isSelected = true; isEnd = true; }
                    if (startDate && endDate && dateObj > startDate && dateObj < endDate) isRange = true;

                    return (
                        <div 
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`
                                h-9 flex items-center justify-center text-xs font-medium cursor-pointer relative
                                ${isBlocked ? 'text-gray-300 cursor-not-allowed line-through decoration-gray-300' : ''}
                                ${isRange ? 'bg-indigo-50 text-primary' : ''}
                                ${isStart ? 'bg-primary text-white rounded-l-full z-10' : ''}
                                ${isEnd ? 'bg-primary text-white rounded-r-full z-10' : ''}
                                ${!isRange && !isSelected && !isBlocked ? 'hover:bg-gray-100 rounded-full' : ''}
                            `}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
