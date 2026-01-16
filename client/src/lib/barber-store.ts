import { Slot } from "./mock-data";

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

let barbers: LoggedInBarber[] = [];
let listeners: (() => void)[] = [];

export const barberStore = {
  getBarbers: () => barbers,
  
  getBarbersByShop: (shopName: string): LoggedInBarber[] => {
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
    listeners.forEach(fn => fn());
    return newBarber;
  },

  logoutBarber: (email: string) => {
    barbers = barbers.map(b => b.email === email ? { ...b, isLoggedIn: false } : b);
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
    listeners.forEach(fn => fn());
  },

  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
};
