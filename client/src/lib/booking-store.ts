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

let bookings: BookingWithCode[] = [];
let listeners: (() => void)[] = [];

export const bookingStore = {
  getBookings: () => bookings,
  
  addBooking: (booking: Omit<Booking, 'id'> & { bookingDate?: 'today' | 'tomorrow', clientPhone?: string }): BookingWithCode => {
    const newBooking: BookingWithCode = {
      ...booking,
      id: `booking-${Date.now()}`,
      accessCode: generateAccessCode(),
      bookingDate: booking.bookingDate || 'today',
      clientPhone: booking.clientPhone,
    };
    bookings = [...bookings, newBooking];
    listeners.forEach(fn => fn());
    return newBooking;
  },
  
  updateBooking: (id: string, updates: Partial<BookingWithCode>) => {
    bookings = bookings.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
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
