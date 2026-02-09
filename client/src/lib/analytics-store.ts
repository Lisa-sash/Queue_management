import { bookingStore } from "./booking-store";
import { barberStore } from "./barber-store";

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
    const cutsToday = barberBookings.filter(b => {
      if (b.userStatus !== 'completed') return false;
      if (b.bookingDate === 'today') return true;
      
      // Fallback: check ID timestamp for walk-ins/converted bookings
      const parts = b.id.split('-');
      // ID format: booking-TIMESTAMP-RANDOM
      if (parts.length >= 2) {
        const timestamp = parseInt(parts[1]);
        if (!isNaN(timestamp)) {
           const bDate = new Date(timestamp);
           return bDate.toDateString() === today;
        }
      }
      return false;
    }).length;

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

    const hours = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];
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
    
    // Get the list of barber IDs that belong to this shop
    const shopBarbers = shopName && shopName !== 'both' 
      ? barberStore.getBarbersByShop(shopName)
      : barberStore.getBarbers();
    
    const shopBarberIds = new Set(shopBarbers.map(b => b.id));
    
    const filteredBookings = allBookings.filter(b => shopBarberIds.has(b.barberId));
    
    // Only count COMPLETED bookings for the stats
    const completedBookings = filteredBookings.filter(b => b.userStatus === 'completed');
    
    const totalClients = completedBookings.length;

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
      const count = completedBookings.filter(b => {
        // Robust ID parsing for dates
        const parts = b.id.split('-');
        // IDs are: booking-<timestamp>-<rand>
        // Or: booking-today-<timestamp>-<rand>
        const timestampPart = parts.find(p => !isNaN(parseInt(p)) && p.length > 10);
        
        if (timestampPart) {
          const bDate = new Date(parseInt(timestampPart));
          return bDate.toDateString() === targetDate.toDateString();
        }
        
        // Fallback for mock data or legacy IDs
        if (b.bookingDate === 'today' && targetDate.toDateString() === new Date().toDateString()) {
          return true;
        }
        
        return false;
      }).length;
      return { day: dayName, count };
    };

    const weeklyData = [0, 1, 2, 3, 4, 5, 6].map(offset => getDayStats(offset));

    return {
      totalRevenue: totalClients * 250,
      totalClients: totalClients,
      avgWaitTime: 12,
      rating: 4.8,
      weeklyData,
      cutsToday: completedBookings.filter(b => b.bookingDate === 'today').length,
      completionRate: filteredBookings.length > 0 ? Math.round((completedBookings.length / filteredBookings.length) * 100) : 0
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
