const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (networkError) {
    throw new Error('Network error. Please check your connection and try again.');
  }
  
  if (!response.ok) {
    let errorMessage = 'Something went wrong. Please try again.';
    try {
      const errorData = await response.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch {
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  shopName: string;
  avatar: string | null;
  isAvailable: boolean | null;
}

export interface Slot {
  id: string;
  barberId: string;
  time: string;
  date: string;
  status: string | null;
  clientName: string | null;
  bookingId: string | null;
}

export interface Booking {
  id: string;
  barberId: string;
  barberName: string;
  barberAvatar: string | null;
  clientName: string;
  clientPhone: string;
  slotTime: string;
  bookingDate: string;
  shopName: string;
  shopLocation: string | null;
  accessCode: string;
  userStatus: string | null;
  haircutName: string | null;
}

export const api = {
  barbers: {
    list: () => request<Barber[]>('/barbers'),
    listByShop: (shopName: string) => request<Barber[]>(`/barbers?shop=${encodeURIComponent(shopName)}`),
    get: (id: string) => request<Barber>(`/barbers/${id}`),
    login: (email: string, password: string) => 
      request<Barber>('/barbers/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string, shopName: string) =>
      request<Barber>('/barbers/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, shopName }),
      }),
  },
  
  slots: {
    list: (barberId: string, date: string) => request<Slot[]>(`/barbers/${barberId}/slots?date=${date}`),
    update: (id: string, updates: Partial<Slot>) => 
      request<Slot>(`/slots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  },
  
  bookings: {
    list: () => request<Booking[]>('/bookings'),
    listByBarber: (barberId: string) => request<Booking[]>(`/bookings?barberId=${barberId}`),
    listByPhone: (phone: string) => request<Booking[]>(`/bookings?phone=${encodeURIComponent(phone)}`),
    get: (id: string) => request<Booking>(`/bookings/${id}`),
    getByCode: (code: string) => request<Booking>(`/bookings/code/${code}`),
    create: (booking: {
      barberId: string;
      barberName: string;
      barberAvatar?: string;
      clientName: string;
      clientPhone: string;
      slotTime: string;
      bookingDate: string;
      shopName: string;
      shopLocation?: string;
      haircutName?: string;
    }) => request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
    update: (id: string, updates: Partial<Booking>) =>
      request<Booking>(`/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  },
};
