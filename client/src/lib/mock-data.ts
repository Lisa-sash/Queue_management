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

export const MOCK_BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Jax "The Blade"',
    avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    isAvailable: true,
    currentWaitTime: 15,
    shop: "The Gentleman's Den",
    slots: [
      { id: 's1', time: '8:30', status: 'completed', clientName: 'Mike R.', type: 'app' },
      { id: 's2', time: '9:00', status: 'completed', clientName: 'Sarah J.', type: 'walk-in' },
      { id: 's3', time: '9:30', status: 'completed', clientName: 'Tom B.', type: 'app' },
      { id: 's4', time: '10:00', status: 'completed', clientName: 'Chris M.', type: 'walk-in' },
      { id: 's5', time: '10:30', status: 'in-progress', clientName: 'Davide', type: 'app', userStatus: 'pending' },
      { id: 's6', time: '11:00', status: 'booked', clientName: 'Alex P.', type: 'app' },
      { id: 's7', time: '11:30', status: 'available', type: 'app' },
      { id: 's8', time: '12:00', status: 'available', type: 'app' },
      { id: 's9', time: '12:30', status: 'available', type: 'app' },
      { id: 's10', time: '13:00', status: 'available', type: 'app' },
      { id: 's11', time: '13:30', status: 'available', type: 'app' },
      { id: 's12', time: '14:00', status: 'available', type: 'app' },
      { id: 's13', time: '14:30', status: 'available', type: 'app' },
      { id: 's14', time: '15:00', status: 'available', type: 'app' },
      { id: 's15', time: '15:30', status: 'available', type: 'app' },
      { id: 's16', time: '16:00', status: 'available', type: 'app' },
      { id: 's17', time: '16:30', status: 'available', type: 'app' },
      { id: 's18', time: '17:00', status: 'available', type: 'app' },
      { id: 's19', time: '17:30', status: 'available', type: 'app' },
      { id: 's20', time: '18:00', status: 'available', type: 'app' },
      { id: 's21', time: '18:30', status: 'available', type: 'app' },
      { id: 's22', time: '19:00', status: 'available', type: 'app' },
      { id: 's23', time: '19:30', status: 'available', type: 'app' },
      { id: 's24', time: '20:00', status: 'available', type: 'app' },
      { id: 's25', time: '20:30', status: 'available', type: 'app' },
    ]
  },
  {
    id: '2',
    name: 'Elena Cuts',
    avatar: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    isAvailable: true,
    currentWaitTime: 45,
    shop: "Urban Cuts",
    slots: [
      { id: 'e1', time: '8:30', status: 'completed', clientName: 'Tom', type: 'walk-in' },
      { id: 'e2', time: '9:00', status: 'completed', clientName: 'Jerry', type: 'app' },
      { id: 'e3', time: '9:30', status: 'completed', clientName: 'Spike', type: 'app' },
      { id: 'e4', time: '10:00', status: 'in-progress', clientName: 'Tyke', type: 'walk-in' },
      { id: 'e5', time: '10:30', status: 'booked', clientName: 'Marcus L.', type: 'app', userStatus: 'pending' },
      { id: 'e6', time: '11:00', status: 'booked', clientName: 'Nina K.', type: 'app' },
      { id: 'e7', time: '11:30', status: 'available', type: 'app' },
      { id: 'e8', time: '12:00', status: 'available', type: 'app' },
      { id: 'e9', time: '12:30', status: 'available', type: 'app' },
      { id: 'e10', time: '13:00', status: 'available', type: 'app' },
      { id: 'e11', time: '13:30', status: 'available', type: 'app' },
      { id: 'e12', time: '14:00', status: 'available', type: 'app' },
      { id: 'e13', time: '14:30', status: 'available', type: 'app' },
      { id: 'e14', time: '15:00', status: 'available', type: 'app' },
      { id: 'e15', time: '15:30', status: 'available', type: 'app' },
      { id: 'e16', time: '16:00', status: 'available', type: 'app' },
      { id: 'e17', time: '16:30', status: 'available', type: 'app' },
      { id: 'e18', time: '17:00', status: 'available', type: 'app' },
      { id: 'e19', time: '17:30', status: 'available', type: 'app' },
      { id: 'e20', time: '18:00', status: 'available', type: 'app' },
      { id: 'e21', time: '18:30', status: 'available', type: 'app' },
      { id: 'e22', time: '19:00', status: 'available', type: 'app' },
      { id: 'e23', time: '19:30', status: 'available', type: 'app' },
      { id: 'e24', time: '20:00', status: 'available', type: 'app' },
      { id: 'e25', time: '20:30', status: 'available', type: 'app' },
    ]
  }
];

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
