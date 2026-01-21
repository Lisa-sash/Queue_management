import { bookingStore } from "./booking-store";

export type AnalyticsTier = 'basic' | 'professional' | 'enterprise';

export interface BarberAnalyticsAccess {
  barberId: string;
  tier: AnalyticsTier;
  purchasedAt?: Date;
}

let analyticsAccess: BarberAnalyticsAccess[] = [];
let listeners: (() => void)[] = [];

export const analyticsStore = {
  getTier: (barberId: string): AnalyticsTier => {
    const access = analyticsAccess.find(a => a.barberId === barberId);
    return access?.tier || 'basic';
  },

  getRealTimeStats: (barberId: string) => {
    const allBookings = bookingStore.getBookings();
    const barberBookings = allBookings.filter(b => b.barberId === barberId);
    
    const today = new Date().toDateString();
    const cutsToday = barberBookings.filter(b => 
      b.bookingDate === 'today' && b.userStatus === 'completed'
    ).length;

    const cutsThisMonth = barberBookings.filter(b => {
      const bDate = new Date(parseInt(b.id.split('-')[1]));
      const now = new Date();
      return b.userStatus === 'completed' && bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
    }).length;

    const completionRate = barberBookings.length > 0 
      ? Math.round((barberBookings.filter(b => b.userStatus === 'completed').length / barberBookings.length) * 100)
      : 0;

    const getDayStats = (dayOffset: number) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - dayOffset);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const count = barberBookings.filter(b => {
        const bDate = new Date(parseInt(b.id.split('-')[1]));
        return b.userStatus === 'completed' && bDate.toDateString() === targetDate.toDateString();
      }).length;
      return { day: dayName, current: count };
    };

    const realWeeklyData = [6, 5, 4, 3, 2, 1, 0].map(offset => getDayStats(offset)).reverse();

    return {
      cutsToday,
      cutsThisMonth,
      completionRate,
      totalRevenue: barberBookings.reduce((acc, b) => acc + (b.userStatus === 'completed' ? 250 : 0), 0),
      weeklyData: realWeeklyData
    };
  },

  upgradeTier: (barberId: string, tier: AnalyticsTier) => {
    const existing = analyticsAccess.find(a => a.barberId === barberId);
    if (existing) {
      analyticsAccess = analyticsAccess.map(a => 
        a.barberId === barberId ? { ...a, tier, purchasedAt: new Date() } : a
      );
    } else {
      analyticsAccess.push({ barberId, tier, purchasedAt: new Date() });
    }
    localStorage.setItem('analyticsAccess', JSON.stringify(analyticsAccess));
    listeners.forEach(fn => fn());
  },

  loadFromStorage: () => {
    const saved = localStorage.getItem('analyticsAccess');
    if (saved) {
      try {
        analyticsAccess = JSON.parse(saved);
      } catch (e) {}
    }
  },

  subscribe: (fn: () => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },
};

analyticsStore.loadFromStorage();
