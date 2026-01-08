export interface Slot {
  id: string;
  time: string;
  status: 'available' | 'booked' | 'in-progress' | 'completed';
  clientName?: string;
  type: 'app' | 'walk-in';
  userStatus?: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled' | 'arrived';
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  isAvailable: boolean;
  currentWaitTime: number; // in minutes
  slots: Slot[];
  shop: string;
}

export interface Booking {
  id: string;
  barberId: string;
  barberName: string;
  barberAvatar: string;
  slotId: string;
  slotTime: string;
  clientName: string;
  userStatus: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled' | 'arrived';
  shopName: string;
  shopLocation: string;
}

export const MOCK_BARBERS: Barber[] = [];

export function generateTomorrowSlots(prefix: string): Slot[] {
  const times = [
    "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30"
  ];
  return times.map((time, i) => ({
    id: `${prefix}-tmrw-s${i + 1}`,
    time,
    status: 'available' as const,
    type: 'app' as const,
  }));
}
