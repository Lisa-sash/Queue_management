import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shops = pgTable("shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  phone: text("phone"),
  instagram: text("instagram"),
  isOpen: boolean("is_open").default(true),
  rating: text("rating").default("4.9"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const barbers = pgTable("barbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  shopId: varchar("shop_id").references(() => shops.id),
  shopName: text("shop_name").notNull(),
  avatar: text("avatar"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  barberId: varchar("barber_id").references(() => barbers.id).notNull(),
  barberName: text("barber_name").notNull(),
  barberAvatar: text("barber_avatar"),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  slotTime: text("slot_time").notNull(),
  bookingDate: text("booking_date").notNull(),
  shopName: text("shop_name").notNull(),
  shopLocation: text("shop_location"),
  accessCode: text("access_code").notNull(),
  userStatus: text("user_status").default("pending"),
  haircutName: text("haircut_name"),
  notifySms: boolean("notify_sms").default(true),
  notifyWhatsapp: boolean("notify_whatsapp").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const slots = pgTable("slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  barberId: varchar("barber_id").references(() => barbers.id).notNull(),
  time: text("time").notNull(),
  date: text("date").notNull(),
  status: text("status").default("available"),
  clientName: text("client_name"),
  bookingId: varchar("booking_id").references(() => bookings.id),
});

export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true });
export const insertBarberSchema = createInsertSchema(barbers).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertSlotSchema = createInsertSchema(slots).omit({ id: true });

export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shops.$inferSelect;

export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Barber = typeof barbers.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertSlot = z.infer<typeof insertSlotSchema>;
export type Slot = typeof slots.$inferSelect;
