import { Booking } from "./mock-data";

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface BookingWithCode extends Booking {
  accessCode: string;
  bookingDate: 'today' | 'tomorrow';
  clientPhone?: string;
}

const STORAGE_KEY = 'booking_store_data';

// Load initial data from localStorage
const savedBookings = localStorage.getItem(STORAGE_KEY);
let bookings: BookingWithCode[] = savedBookings ? JSON.parse(savedBookings) : [];

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

let listeners: (() => void)[] = [];

export const bookingStore = {
  getBookings: () => bookings,
  
  addBooking: (booking: Omit<Booking, 'id'> & { bookingDate?: 'today' | 'tomorrow', clientPhone?: string }): BookingWithCode => {
    const accessCode = generateAccessCode();
    const newBooking: BookingWithCode = {
      ...booking,
      id: `booking-${Date.now()}`,
      accessCode,
      bookingDate: booking.bookingDate || 'today',
      clientPhone: booking.clientPhone,
    };
    bookings = [...bookings, newBooking];
    persist();
    
    // Simulate SMS notification
    console.log(`[SMS Simulation] Sending to ${booking.clientPhone}: Your QueueCut access code is ${accessCode}. Shop: ${booking.shopName}`);
    
    listeners.forEach(fn => fn());
    return newBooking;
  },
  
  updateBooking: (id: string, updates: Partial<BookingWithCode>) => {
    bookings = bookings.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    persist();
    listeners.forEach(fn => fn());
  },
  
  findByCode: (code: string): BookingWithCode | undefined => {
    return bookings.find(b => b.accessCode.toUpperCase() === code.toUpperCase());
  },
  
  findByPhone: (phone: string): BookingWithCode[] => {
    return bookings.filter(b => b.clientPhone === phone);
  },
  
  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }
};
