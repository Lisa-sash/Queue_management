export interface Slot {
  id: string;
  time: string;
  status: 'available' | 'booked' | 'in-progress' | 'completed';
  clientName?: string;
  type: 'app' | 'walk-in';
  userStatus?: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled';
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  isAvailable: boolean;
  currentWaitTime: number; // in minutes
  slots: Slot[];
}

export interface Booking {
  id: string;
  barberId: string;
  barberName: string;
  barberAvatar: string;
  slotId: string;
  slotTime: string;
  clientName: string;
  userStatus: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled';
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
    slots: [
      { id: 's1', time: '14:00', status: 'completed', clientName: 'Mike R.', type: 'app' },
      { id: 's2', time: '14:30', status: 'in-progress', clientName: 'Sarah J.', type: 'walk-in' },
      { id: 's3', time: '15:00', status: 'booked', clientName: 'Davide', type: 'app', userStatus: 'pending' },
      { id: 's4', time: '15:30', status: 'available', type: 'app' },
      { id: 's5', time: '16:00', status: 'available', type: 'app' },
      { id: 's6', time: '16:30', status: 'available', type: 'app' },
    ]
  },
  {
    id: '2',
    name: 'Elena Cuts',
    avatar: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    isAvailable: true,
    currentWaitTime: 45,
    slots: [
      { id: 'e1', time: '14:00', status: 'completed', clientName: 'Tom', type: 'walk-in' },
      { id: 'e2', time: '14:30', status: 'in-progress', clientName: 'Jerry', type: 'app' },
      { id: 'e3', time: '15:00', status: 'booked', clientName: 'Spike', type: 'app', userStatus: 'pending' },
      { id: 'e4', time: '15:30', status: 'booked', clientName: 'Tyke', type: 'walk-in' },
      { id: 'e5', time: '16:00', status: 'available', type: 'app' },
    ]
  }
];
