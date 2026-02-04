import { api, Booking } from "./api";

export interface BookingWithCode extends Booking {
  bookingDate: string;
}

let bookings: BookingWithCode[] = [];
let listeners: (() => void)[] = [];
let initialized = false;
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

const loadBookings = async () => {
  try {
    const data = await api.bookings.list();
    bookings = data as BookingWithCode[];
    notifyListeners();
    initialized = true;
  } catch (e) {
    console.error("Failed to load bookings:", e);
  }
};

const startAutoRefresh = () => {
  if (refreshInterval) return;
  refreshInterval = setInterval(() => {
    loadBookings();
  }, 5000);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

loadBookings();
startAutoRefresh();

export const bookingStore = {
  getBookings: () => bookings,
  
  addBooking: async (booking: {
    barberId: string;
    barberName: string;
    barberAvatar?: string;
    clientName: string;
    clientPhone: string;
    slotTime: string;
    bookingDate: string;
    shopName: string;
    shopLocation?: string;
    notifySms?: boolean;
    notifyWhatsapp?: boolean;
    haircutName?: string;
  }): Promise<BookingWithCode> => {
    const newBooking = await api.bookings.create(booking);
    bookings = [...bookings, newBooking as BookingWithCode];
    notifyListeners();
    return newBooking as BookingWithCode;
  },
  
  updateBooking: async (id: string, updates: Partial<BookingWithCode>) => {
    const updated = await api.bookings.update(id, updates);
    bookings = bookings.map(b => b.id === id ? (updated as BookingWithCode) : b);
    notifyListeners();
    return updated;
  },
  
  findByCode: async (code: string): Promise<BookingWithCode | undefined> => {
    try {
      const booking = await api.bookings.getByCode(code);
      return booking as BookingWithCode;
    } catch {
      return undefined;
    }
  },
  
  findByPhone: async (phone: string): Promise<BookingWithCode[]> => {
    try {
      const results = await api.bookings.listByPhone(phone);
      return results as BookingWithCode[];
    } catch {
      return [];
    }
  },
  
  refresh: async () => {
    await loadBookings();
  },
  
  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
  
  stopAutoRefresh,
  startAutoRefresh,
};
