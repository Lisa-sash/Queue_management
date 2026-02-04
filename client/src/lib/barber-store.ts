import { api, Barber, Slot } from "./api";

export interface LoggedInBarber {
  id: string;
  name: string;
  email: string;
  shop: string;
  avatar: string;
  isLoggedIn: boolean;
}

const LOGGED_IN_KEY = 'logged_in_barber';

let currentBarber: LoggedInBarber | null = null;

const savedBarber = localStorage.getItem(LOGGED_IN_KEY);
if (savedBarber) {
  try {
    currentBarber = JSON.parse(savedBarber);
  } catch {
    localStorage.removeItem(LOGGED_IN_KEY);
  }
}

let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const barberStore = {
  getBarbers: async (): Promise<Barber[]> => {
    return api.barbers.list();
  },
  
  getBarbersByShop: async (shopName: string): Promise<Barber[]> => {
    return api.barbers.listByShop(shopName);
  },

  getSlots: async (barberId: string, date: string): Promise<Slot[]> => {
    return api.slots.list(barberId, date);
  },

  updateSlot: async (slotId: string, updates: Partial<Slot>) => {
    return api.slots.update(slotId, updates);
  },

  login: async (email: string, password: string): Promise<LoggedInBarber> => {
    const barber = await api.barbers.login(email, password);
    currentBarber = {
      id: barber.id,
      name: barber.name,
      email: barber.email,
      shop: barber.shopName,
      avatar: barber.avatar || "",
      isLoggedIn: true,
    };
    localStorage.setItem(LOGGED_IN_KEY, JSON.stringify(currentBarber));
    notifyListeners();
    return currentBarber;
  },

  register: async (name: string, email: string, password: string, shopName: string): Promise<LoggedInBarber> => {
    const barber = await api.barbers.register(name, email, password, shopName);
    currentBarber = {
      id: barber.id,
      name: barber.name,
      email: barber.email,
      shop: barber.shopName,
      avatar: barber.avatar || "",
      isLoggedIn: true,
    };
    localStorage.setItem(LOGGED_IN_KEY, JSON.stringify(currentBarber));
    notifyListeners();
    return currentBarber;
  },

  logout: () => {
    currentBarber = null;
    localStorage.removeItem(LOGGED_IN_KEY);
    notifyListeners();
  },

  getCurrentBarber: (): LoggedInBarber | null => {
    return currentBarber;
  },

  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
};
