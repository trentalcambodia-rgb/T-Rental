import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';

// Mock Data specific for Calendar visualization
const TODAY = new Date();
const TOMORROW = new Date(TODAY); TOMORROW.setDate(TODAY.getDate() + 1);
const NEXT_WEEK = new Date(TODAY); NEXT_WEEK.setDate(TODAY.getDate() + 5);

const MOCK_CALENDAR_BOOKINGS: Booking[] = [
  {
    id: 'c1',
    renter_id: 'u5',
    item_id: 'i1',
    item_title: 'Honda Dream 2023',
    start_date: TODAY.toISOString(),
    end_date: new Date(TODAY.getTime() + 86400000 * 3).toISOString(), // 3 days
    total_price: 24,
    status: BookingStatus.PICKED_UP,
    created_at: TODAY.toISOString()
  },
  {
    id: 'c2',
    renter_id: 'u6',
    item_id: 'i2',
    item_title: 'Canon 5D Mark IV',
    start_date: TOMORROW.toISOString(),
    end_date: new Date(TOMORROW.getTime() + 86400000).toISOString(),
    total_price: 35,
    status: BookingStatus.REQUESTED,
    created_at: TODAY.toISOString()
  },
  {
    id: 'c3',
    renter_id: 'u7',
    item_id: 'i3',
    item_title: 'Camping Set',
    start_date: new Date(TODAY.getTime() - 86400000).toISOString(), // Started yesterday
    end_date: TODAY.toISOString(), // Ends today
    total_price: 30,
    status: BookingStatus.RETURNED,
    created_at: TODAY.toISOString()
  }
];

export const ShopCalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to check if a booking overlaps with a specific day
  const getBookingsForDay = (day: number) => {
    const checkDate = new Date(year, month, day);
    // Reset times for simpler comparison
    checkDate.setHours(0,0,0,0);

    return MOCK_CALENDAR_BOOKINGS.filter(b => {
      const start = new Date(b.start_date); start.setHours(0,0,0,0);
      const end = new Date(b.end_date); end.setHours(0,0,0,0);
      return checkDate >= start && checkDate <= end;
    });
  };

  const selectedBookings = getBookingsForDay(selectedDate.getDate()).filter(b => {
      // Ensure we are looking at the selected date's bookings regardless of the month view being swiped
      // (Simplified for this MVP: we assume selectedDate is updated when clicking grid)
      const sel = new Date(selectedDate); sel.setHours(0,0,0,0);
      const start = new Date(b.start_date); start.setHours(0,0,0,0);
      const end = new Date(b.end_date); end.setHours(0,0,0,0);
      return sel >= start && sel <= end;
  });

  return (
    <div className="bg-background min-h-full pb-20 flex flex-col lg:flex-row lg:gap-6 lg:p-6">
      {/* Header - Hidden on desktop if using split layout, or integrated */}
      <header className="bg-white pt-12 pb-4 px-6 shadow-sm border-b border-gray-100 sticky top-0 z-10 lg:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-xs text-gray-500 font-medium">Availability & Bookings</p>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row lg:gap-6">
        {/* Calendar Control */}
        <div className="bg-white p-4 mb-2 lg:mb-0 lg:rounded-3xl lg:shadow-sm lg:border lg:border-gray-100 lg:w-1/2 xl:w-2/5">
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            <p className="text-xs text-gray-500 font-medium">Availability & Bookings</p>
          </div>

          <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-primary">◀</button>
              <h2 className="font-bold text-lg text-gray-800">{monthNames[month]} {year}</h2>
              <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-primary">▶</button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center mb-2">
              {['S','M','T','W','T','F','S'].map((d, idx) => (
                  <div key={`${d}-${idx}`} className="text-xs font-bold text-gray-400">{d}</div>
              ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const bookings = getBookingsForDay(day);
                  const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                  const isToday = day === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();

                  return (
                      <div 
                          key={day} 
                          onClick={() => setSelectedDate(new Date(year, month, day))}
                          className={`
                              h-10 flex flex-col items-center justify-center rounded-lg relative cursor-pointer
                              ${isSelected ? 'bg-primary text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}
                              ${isToday && !isSelected ? 'border border-primary text-primary font-bold' : ''}
                          `}
                      >
                          <span className="text-sm font-medium">{day}</span>
                          {/* Status Dots */}
                          <div className="flex gap-0.5 mt-0.5">
                              {bookings.slice(0, 3).map((b, idx) => {
                                  let dotColor = 'bg-gray-300';
                                  if (b.status === BookingStatus.REQUESTED) dotColor = 'bg-orange-400';
                                  if (b.status === BookingStatus.PICKED_UP || b.status === BookingStatus.APPROVED) dotColor = 'bg-green-400';
                                  if (b.status === BookingStatus.RETURNED) dotColor = 'bg-gray-400';
                                  
                                  return <div key={idx} className={`w-1 h-1 rounded-full ${dotColor}`} />;
                              })}
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="flex-1 bg-gray-50 p-4 lg:bg-white lg:rounded-3xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-500">
                  {selectedBookings.length} Events
              </span>
          </div>

          <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-3">
              {selectedBookings.length === 0 && (
                  <div className="col-span-full text-center py-10 opacity-50">
                      <p className="text-sm text-gray-500">No bookings for this day.</p>
                      <button className="mt-2 text-primary text-xs font-bold">Block Date for Maintenance</button>
                  </div>
              )}

              {selectedBookings.map(booking => (
                  <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-primary flex gap-4 lg:border lg:border-gray-100 lg:border-l-4">
                      <div className="flex flex-col items-center justify-center px-2 border-r border-gray-100">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Price</span>
                          <span className="font-bold text-gray-900">${booking.total_price}</span>
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between">
                              <h4 className="font-bold text-gray-900 text-sm">{booking.item_title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                              </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                              {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: BookingStatus) => {
    switch(status) {
        case BookingStatus.REQUESTED: return 'bg-orange-100 text-orange-600';
        case BookingStatus.APPROVED: return 'bg-blue-100 text-blue-600';
        case BookingStatus.PICKED_UP: return 'bg-green-100 text-green-600';
        case BookingStatus.RETURNED: return 'bg-gray-100 text-gray-500';
        default: return 'bg-gray-100 text-gray-500';
    }
};
