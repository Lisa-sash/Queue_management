import { 
  type Shop, type InsertShop, shops,
  type Barber, type InsertBarber, barbers,
  type Booking, type InsertBooking, bookings,
  type Slot, type InsertSlot, slots
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

const SLOT_TIMES = [
  "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00"
];

export interface IStorage {
  getShops(): Promise<Shop[]>;
  getShop(id: string): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  
  getBarbers(): Promise<Barber[]>;
  getBarber(id: string): Promise<Barber | undefined>;
  getBarberByEmail(email: string): Promise<Barber | undefined>;
  getBarbersByShop(shopName: string): Promise<Barber[]>;
  createBarber(barber: InsertBarber): Promise<Barber>;
  
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByCode(code: string): Promise<Booking | undefined>;
  getBookingsByBarber(barberId: string): Promise<Booking[]>;
  getBookingsByPhone(phone: string): Promise<Booking[]>;
  createBooking(booking: Omit<InsertBooking, 'accessCode'>): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  
  getSlots(barberId: string, date: string): Promise<Slot[]>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlot(id: string, updates: Partial<Slot>): Promise<Slot | undefined>;
  generateSlotsForBarber(barberId: string, date: string): Promise<Slot[]>;
}

export class DatabaseStorage implements IStorage {
  async getShops(): Promise<Shop[]> {
    return db.select().from(shops);
  }

  async getShop(id: string): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async createShop(shop: InsertShop): Promise<Shop> {
    const [created] = await db.insert(shops).values(shop).returning();
    return created;
  }

  async getBarbers(): Promise<Barber[]> {
    return db.select().from(barbers);
  }

  async getBarber(id: string): Promise<Barber | undefined> {
    const [barber] = await db.select().from(barbers).where(eq(barbers.id, id));
    return barber;
  }

  async getBarberByEmail(email: string): Promise<Barber | undefined> {
    const [barber] = await db.select().from(barbers).where(eq(barbers.email, email.toLowerCase()));
    return barber;
  }

  async getBarbersByShop(shopName: string): Promise<Barber[]> {
    return db.select().from(barbers).where(eq(barbers.shopName, shopName));
  }

  async createBarber(barber: InsertBarber): Promise<Barber> {
    const [created] = await db.insert(barbers).values({
      ...barber,
      email: barber.email.toLowerCase(),
      avatar: barber.avatar || getRandomAvatar(),
    }).returning();
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    await this.generateSlotsForBarber(created.id, today);
    await this.generateSlotsForBarber(created.id, tomorrow);
    
    return created;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByCode(code: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.accessCode, code.toUpperCase()));
    return booking;
  }

  async getBookingsByBarber(barberId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.barberId, barberId));
  }

  async getBookingsByPhone(phone: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.clientPhone, phone));
  }

  async createBooking(booking: Omit<InsertBooking, 'accessCode'>): Promise<Booking> {
    const accessCode = generateAccessCode();
    const [created] = await db.insert(bookings).values({
      ...booking,
      accessCode,
    }).returning();
    
    const existingSlots = await db.select().from(slots).where(
      and(
        eq(slots.barberId, booking.barberId),
        eq(slots.time, booking.slotTime),
        eq(slots.date, booking.bookingDate)
      )
    );
    
    if (existingSlots.length > 0) {
      await db.update(slots)
        .set({ status: 'booked', clientName: booking.clientName, bookingId: created.id })
        .where(eq(slots.id, existingSlots[0].id));
    }
    
    return created;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const [updated] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async getSlots(barberId: string, date: string): Promise<Slot[]> {
    return db.select().from(slots).where(
      and(eq(slots.barberId, barberId), eq(slots.date, date))
    );
  }

  async createSlot(slot: InsertSlot): Promise<Slot> {
    const [created] = await db.insert(slots).values(slot).returning();
    return created;
  }

  async updateSlot(id: string, updates: Partial<Slot>): Promise<Slot | undefined> {
    const [updated] = await db.update(slots).set(updates).where(eq(slots.id, id)).returning();
    return updated;
  }

  async generateSlotsForBarber(barberId: string, date: string): Promise<Slot[]> {
    const existing = await this.getSlots(barberId, date);
    if (existing.length > 0) return existing;
    
    const newSlots: Slot[] = [];
    for (const time of SLOT_TIMES) {
      const [slot] = await db.insert(slots).values({
        barberId,
        time,
        date,
        status: 'available',
      }).returning();
      newSlots.push(slot);
    }
    return newSlots;
  }
}

export const storage = new DatabaseStorage();
