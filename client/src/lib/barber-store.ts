import { Slot } from "./mock-data";
import { bookingStore } from "./booking-store";

export interface LoggedInBarber {
  id: string;
  name: string;
  email: string;
  shop: string;
  avatar: string;
  slots: { today: Slot[]; tomorrow: Slot[] };
  isLoggedIn: boolean;
}

function generateSlots(prefix: string, bookedTimes: string[] = []): Slot[] {
  const times = [
    "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30"
  ];
  return times.map((time, i) => ({
    id: `${prefix}-s${i + 1}`,
    time,
    status: bookedTimes.includes(time) ? 'booked' as const : 'available' as const,
    type: 'app' as const,
  }));
}

function getRandomAvatar(): string {
  const avatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=60",
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

const STORAGE_KEY = 'barber_store_data';
const LAST_DATE_KEY = 'barber_store_last_date';

// Load initial data from localStorage
const savedBarbers = localStorage.getItem(STORAGE_KEY);
let barbers: LoggedInBarber[] = savedBarbers ? JSON.parse(savedBarbers) : [];

const checkAndRotateSlots = () => {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(LAST_DATE_KEY);

  if (lastDate && lastDate !== today) {
    // It's a new day! Rotate slots.
    barbers = barbers.map(b => ({
      ...b,
      slots: {
        // Yesterday's tomorrow becomes today
        today: b.slots.tomorrow.map(s => ({
          ...s,
          id: s.id.replace('-tomorrow', '-today').replace('-tmrw', '-today')
        })),
        // Generate a fresh tomorrow
        tomorrow: generateSlots(`${b.id}-tomorrow`)
      }
    }));

    // Also rotate bookings in bookingStore
    const allBookings = bookingStore.getBookings();
    
    // First, update all booking dates in the store
    allBookings.forEach(b => {
      if (b.bookingDate === 'tomorrow') {
        bookingStore.updateBooking(b.id, { bookingDate: 'today' });
      } else if (b.bookingDate === 'today' && b.userStatus !== 'completed') {
        bookingStore.updateBooking(b.id, { bookingDate: 'yesterday' as any });
      }
    });

    // Get the updated bookings to reflect changes in the barber slots
    const updatedBookings = bookingStore.getBookings();

    // CRITICAL: Update the slots in the barbers themselves to match the rotation
    barbers = barbers.map(b => {
      const updatedTodaySlots = generateSlots(`${b.id}-today`).map(slot => {
        const matchingBooking = updatedBookings.find(bk => 
          bk.barberId === b.id && 
          bk.slotTime === slot.time && 
          bk.bookingDate === 'today'
        );
        if (matchingBooking) {
          return { ...slot, status: 'booked' as const, clientName: matchingBooking.clientName };
        }
        return slot;
      });

      return {
        ...b,
        slots: {
          today: updatedTodaySlots,
          tomorrow: generateSlots(`${b.id}-tomorrow`)
        }
      };
    });

    persist();
    localStorage.setItem(LAST_DATE_KEY, today);
    listeners.forEach(fn => fn());
  } else if (!lastDate) {
    localStorage.setItem(LAST_DATE_KEY, today);
  }
};

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(barbers));
};

let listeners: (() => void)[] = [];

export const barberStore = {
  getBarbers: () => {
    checkAndRotateSlots();
    return barbers;
  },
  
  getBarbersByShop: (shopName: string): LoggedInBarber[] => {
    checkAndRotateSlots();
    return barbers.filter(b => 
      b.shop === shopName || 
      (shopName === "Urban Cuts" && (b.shop === "urban" || b.shop === "Urban Cuts" || b.shop === "Urban Cut")) || 
      (shopName === "The Gentleman's Den" && (b.shop === "den" || b.shop === "The Gentleman's Den"))
    );
  },

  findByEmail: (email: string): LoggedInBarber | undefined => {
    return barbers.find(b => b.email.toLowerCase() === email.toLowerCase());
  },

  addBarber: (name: string, email: string, shop: string): LoggedInBarber => {
    const existing = barbers.find(b => b.email === email);
    if (existing) {
      barbers = barbers.map(b => b.email === email ? { ...b, isLoggedIn: true } : b);
      persist();
      listeners.forEach(fn => fn());
      return { ...existing, isLoggedIn: true };
    }

    const id = `barber-${Date.now()}`;
    const newBarber: LoggedInBarber = {
      id,
      name,
      email,
      shop,
      avatar: getRandomAvatar(),
      slots: {
        today: generateSlots(`${id}-today`),
        tomorrow: generateSlots(`${id}-tomorrow`),
      },
      isLoggedIn: true,
    };
    barbers = [...barbers, newBarber];
    persist();
    listeners.forEach(fn => fn());
    return newBarber;
  },

  logoutBarber: (email: string) => {
    barbers = barbers.map(b => b.email === email ? { ...b, isLoggedIn: false } : b);
    persist();
    listeners.forEach(fn => fn());
  },

  updateSlot: (barberId: string, day: 'today' | 'tomorrow', slotId: string, updates: Partial<Slot>) => {
    barbers = barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          slots: {
            ...b.slots,
            [day]: b.slots[day].map(s => s.id === slotId ? { ...s, ...updates } : s),
          },
        };
      }
      return b;
    });
    persist();
    listeners.forEach(fn => fn());
  },

  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
};
