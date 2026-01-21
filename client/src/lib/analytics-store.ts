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
      const now = new Date();
      // Calculate current week's Monday
      const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + dayOffset);
      
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const count = barberBookings.filter(b => {
        const bDate = new Date(parseInt(b.id.split('-')[1]));
        return b.userStatus === 'completed' && bDate.toDateString() === targetDate.toDateString();
      }).length;
      return { day: dayName, current: count };
    };

    const realWeeklyData = [0, 1, 2, 3, 4, 5, 6].map(offset => getDayStats(offset));

    const serviceDataMap: Record<string, number> = {};
    const hourDataMap: Record<string, number> = {};
    
    barberBookings.filter(b => b.userStatus === 'completed').forEach(b => {
      // Service distribution
      const service = (b as any).haircutName || 'Standard Cut';
      serviceDataMap[service] = (serviceDataMap[service] || 0) + 1;
      
      // Peak hours
      const hour = b.slotTime.split(':')[0] + ':00';
      hourDataMap[hour] = (hourDataMap[hour] || 0) + 1;
    });

    const realServiceData = Object.entries(serviceDataMap).map(([name, value], i) => ({
      name,
      value,
      color: ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#eab308'][i % 5]
    }));

    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const realPeakHours = hours.map(h => ({
      hour: h,
      clients: hourDataMap[h] || 0
    }));

    return {
      cutsToday,
      cutsThisMonth,
      completionRate,
      totalRevenue: barberBookings.reduce((acc, b) => acc + (b.userStatus === 'completed' ? 250 : 0), 0),
      weeklyData: realWeeklyData,
      serviceData: realServiceData,
      peakHours: realPeakHours
    };
  },

  getManagerStats: (shopName?: string) => {
    const allBookings = bookingStore.getBookings();
    const filteredBookings = shopName && shopName !== 'both' 
      ? allBookings.filter(b => b.shopName.toLowerCase().includes(shopName.toLowerCase()) || (shopName === "Gentleman's Den" && b.shopName === "The Gentleman's Den"))
      : allBookings;
    
    const cutsToday = filteredBookings.filter(b => 
      b.bookingDate === 'today' && b.userStatus === 'completed'
    ).length;

    const cutsThisMonth = filteredBookings.filter(b => {
      const bDate = new Date(parseInt(b.id.split('-')[1]));
      const now = new Date();
      return b.userStatus === 'completed' && bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
    }).length;

    const completionRate = filteredBookings.length > 0 
      ? Math.round((filteredBookings.filter(b => b.userStatus === 'completed').length / filteredBookings.length) * 100)
      : 0;

    const getDayStats = (dayOffset: number) => {
      const now = new Date();
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + dayOffset);
      
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const count = filteredBookings.filter(b => {
        const bDate = new Date(parseInt(b.id.split('-')[1]));
        return b.userStatus === 'completed' && bDate.toDateString() === targetDate.toDateString();
      }).length;
      return { day: dayName, count };
    };

    const weeklyData = [0, 1, 2, 3, 4, 5, 6].map(offset => getDayStats(offset));

    return {
      totalRevenue: filteredBookings.reduce((acc, b) => acc + (b.userStatus === 'completed' ? 250 : 0), 0),
      totalClients: filteredBookings.length,
      avgWaitTime: 12, // Still mock for now as we don't track start/end times precisely
      rating: 4.8,
      weeklyData,
      cutsToday,
      completionRate
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
