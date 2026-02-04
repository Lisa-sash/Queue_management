import { bookingStore } from "./booking-store";

export type AnalyticsTier = 'basic' | 'professional' | 'enterprise';

// Helper to get walk-ins from localStorage
const getWalkInsForBarber = (barberId: string): Array<{id: string, status: string, clientName: string, time: string, haircutName?: string}> => {
  const todayKey = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`walkIns_${barberId}_${todayKey}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

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
    
    // Get walk-ins from localStorage
    const walkIns = getWalkInsForBarber(barberId);
    const completedWalkIns = walkIns.filter(w => w.status === 'completed').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date().toDateString();
    
    // Count completed bookings for today
    const completedBookingsToday = barberBookings.filter(b => {
      if (b.userStatus !== 'completed') return false;
      // Check if booking date matches today
      if (b.bookingDate === todayStr) return true;
      return false;
    }).length;
    
    // Total cuts today = completed bookings + completed walk-ins
    const cutsToday = completedBookingsToday + completedWalkIns;

    // Cuts this month (bookings only - walk-ins are daily)
    const cutsThisMonth = barberBookings.filter(b => {
      if (b.userStatus !== 'completed') return false;
      if (!b.bookingDate) return false;
      const bDate = new Date(b.bookingDate);
      const now = new Date();
      return bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear();
    }).length + completedWalkIns;

    const totalItems = barberBookings.length + walkIns.length;
    const completedItems = barberBookings.filter(b => b.userStatus === 'completed').length + completedWalkIns;
    const completionRate = totalItems > 0 
      ? Math.round((completedItems / totalItems) * 100)
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
      const targetDateStr = targetDate.toISOString().split('T')[0];
      
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count bookings for this day
      let count = barberBookings.filter(b => {
        return b.userStatus === 'completed' && b.bookingDate === targetDateStr;
      }).length;
      
      // Add walk-ins for today only
      if (targetDateStr === todayStr) {
        count += completedWalkIns;
      }
      
      return { day: dayName, current: count };
    };

    const realWeeklyData = [0, 1, 2, 3, 4, 5, 6].map(offset => getDayStats(offset));

    const serviceDataMap: Record<string, number> = {};
    const hourDataMap: Record<string, number> = {};
    
    // Process completed bookings
    barberBookings.filter(b => b.userStatus === 'completed').forEach(b => {
      const service = (b as any).haircutName || 'Standard Cut';
      serviceDataMap[service] = (serviceDataMap[service] || 0) + 1;
      
      const hour = b.slotTime.split(':')[0].padStart(2, '0') + ':00';
      hourDataMap[hour] = (hourDataMap[hour] || 0) + 1;
    });
    
    // Process walk-ins
    walkIns.filter(w => w.status === 'completed').forEach(w => {
      const service = w.haircutName || 'Standard Cut';
      serviceDataMap[service] = (serviceDataMap[service] || 0) + 1;
      
      const hour = w.time.split(':')[0].padStart(2, '0') + ':00';
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

    // Revenue includes completed bookings + completed walk-ins
    const bookingRevenue = barberBookings.reduce((acc, b) => acc + (b.userStatus === 'completed' ? 250 : 0), 0);
    const walkInRevenue = completedWalkIns * 250;
    
    return {
      cutsToday,
      cutsThisMonth,
      completionRate,
      totalRevenue: bookingRevenue + walkInRevenue,
      weeklyData: realWeeklyData,
      serviceData: realServiceData,
      peakHours: realPeakHours
    };
  },

  getManagerStats: (shopName?: string) => {
    const allBookings = bookingStore.getBookings();
    
    // Filter bookings by shop name directly from booking data
    const filteredBookings = shopName 
      ? allBookings.filter(b => b.shopName?.toLowerCase().includes(shopName.toLowerCase()))
      : allBookings;
    
    // Only count COMPLETED bookings for the stats
    const completedBookings = filteredBookings.filter(b => b.userStatus === 'completed');
    
    // Get all walk-ins from localStorage (check all barber IDs from bookings)
    const todayKey = new Date().toISOString().split('T')[0];
    const barberIds = new Set(allBookings.map(b => b.barberId));
    let totalWalkIns = 0;
    barberIds.forEach(barberId => {
      const saved = localStorage.getItem(`walkIns_${barberId}_${todayKey}`);
      if (saved) {
        try {
          const walkIns = JSON.parse(saved);
          totalWalkIns += walkIns.filter((w: any) => w.status === 'completed').length;
        } catch {}
      }
    });
    
    const totalClients = completedBookings.length + totalWalkIns;

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
