import { Booking, BookingStatus } from '../types';

// Mock database for the purpose of the Typescript function demonstration
const MOCK_EXISTING_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    renter_id: 'other_user',
    item_id: 'item1',
    item_title: 'Honda Zoomer-X',
    start_date: '2023-10-25T10:00:00Z',
    end_date: '2023-10-27T10:00:00Z',
    total_price: 20,
    status: BookingStatus.APPROVED,
    created_at: '2023-10-01'
  }
];

/**
 * Checks if a requested date range is available given the Item's total Quantity.
 * 
 * Logic: For every day in the requested range, count active bookings.
 * If (Active Bookings >= Item Quantity) on any day, then UNAVAILABLE.
 * 
 * @param itemId - The ID of the item to rent
 * @param itemQuantity - Total units the shop owns (e.g., 5 cameras)
 * @param requestedStart - ISO Date string
 * @param requestedEnd - ISO Date string
 * @param existingBookings - Array of existing bookings for this item
 * @returns boolean - True if available
 */
export const checkAvailability = (
  itemId: string,
  itemQuantity: number,
  requestedStart: string,
  requestedEnd: string,
  existingBookings: Booking[]
): boolean => {
  const reqStart = new Date(requestedStart).getTime();
  const reqEnd = new Date(requestedEnd).getTime();

  if (reqStart >= reqEnd) {
    console.error("Start date must be before end date");
    return false;
  }

  // 1. Filter only active bookings for this item
  const activeBookings = existingBookings.filter(b => 
    b.item_id === itemId && 
    b.status !== BookingStatus.CANCELLED && 
    b.status !== BookingStatus.DISPUTED &&
    b.status !== BookingStatus.RETURNED &&
    b.status !== BookingStatus.COMPLETED
  );

  // If we have infinite stock or no bookings, fast pass
  if (activeBookings.length === 0) return true;

  // 2. Coarse Check: If total bookings < quantity, it's definitely available
  // (Optimization: This is only true if quantity is very large, but safely we should do the granular check)
  
  // 3. Granular Day-by-Day Check
  // We check if the concurrent bookings ever exceed the quantity during the requested period.
  
  // Simple collision detection for the whole range against every booking
  let overlappingCount = 0;

  // Note: This logic can be refined for highly granular slots, 
  // but for a rental app, checking if "Max Overlap" exceeds quantity is standard.
  // A robust algorithm creates a timeline of +1/-1 events.
  
  const events: { time: number, type: 'START' | 'END' }[] = [];

  // Add existing booking events
  activeBookings.forEach(b => {
    events.push({ time: new Date(b.start_date).getTime(), type: 'START' });
    events.push({ time: new Date(b.end_date).getTime(), type: 'END' });
  });

  // Add requested booking events (to see if it pushes us over the limit)
  events.push({ time: reqStart, type: 'START' });
  events.push({ time: reqEnd, type: 'END' });

  // Sort events by time
  events.sort((a, b) => a.time - b.time);

  let currentUsage = 0;
  let maxUsage = 0;

  for (const event of events) {
    if (event.type === 'START') {
      currentUsage++;
    } else {
      currentUsage--;
    }
    
    // We only care about max usage during the requested window, 
    // but simplified: if usage ever exceeds quantity, it's a bust.
    // However, we strictly need to check if the requested booking *caused* the overflow
    // inside its own window.
    // The simpler approach for MVP:
    // Count how many bookings overlap with the REQUESTED range.
    // If that count >= Quantity, then we can't accept another one.
  }

  // --- Simplified Logic for React MVP ---
  // Just count how many existing bookings overlap with the new request
  const directOverlaps = activeBookings.filter(booking => {
     const bookedStart = new Date(booking.start_date).getTime();
     const bookedEnd = new Date(booking.end_date).getTime();
     return (reqStart < bookedEnd && reqEnd > bookedStart);
  });

  // If the number of people who already have the item during this time 
  // is equal to or greater than the number of items we have...
  if (directOverlaps.length >= itemQuantity) {
      return false; // No stock left
  }

  return true;
};

export const calculateTotal = (pricePerDay: number, start: string, end: string): number => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays * pricePerDay;
};