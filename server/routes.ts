import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBarberSchema, insertBookingSchema, insertShopSchema } from "@shared/schema";
import { z } from "zod";
import { sendBookingConfirmation } from "./twilio";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/shops", async (req, res) => {
    const allShops = await storage.getShops();
    res.json(allShops);
  });

  app.get("/api/shops/:id", async (req, res) => {
    const shop = await storage.getShop(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    res.json(shop);
  });

  app.post("/api/shops", async (req, res) => {
    try {
      const parsed = insertShopSchema.parse(req.body);
      const shop = await storage.createShop(parsed);
      res.status(201).json(shop);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: e.errors });
      }
      throw e;
    }
  });

  app.get("/api/barbers", async (req, res) => {
    const shopName = req.query.shop as string | undefined;
    if (shopName) {
      const barbersList = await storage.getBarbersByShop(shopName);
      return res.json(barbersList);
    }
    const allBarbers = await storage.getBarbers();
    res.json(allBarbers);
  });

  app.get("/api/barbers/:id", async (req, res) => {
    const barber = await storage.getBarber(req.params.id);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }
    res.json(barber);
  });

  app.post("/api/barbers/login", async (req, res) => {
    const { email, password } = req.body;
    const barber = await storage.getBarberByEmail(email);
    if (!barber || barber.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
      id: barber.id,
      name: barber.name,
      email: barber.email,
      shopName: barber.shopName,
      avatar: barber.avatar,
    });
  });

  app.post("/api/barbers/register", async (req, res) => {
    try {
      const { name, email, password, shopName } = req.body;
      
      const existing = await storage.getBarberByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const barber = await storage.createBarber({
        name,
        email,
        password,
        shopName,
        shopId: null,
        avatar: null,
        isAvailable: true,
      });
      
      res.status(201).json({
        id: barber.id,
        name: barber.name,
        email: barber.email,
        shopName: barber.shopName,
        avatar: barber.avatar,
      });
    } catch (e) {
      console.error("Register error:", e);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.get("/api/barbers/:id/slots", async (req, res) => {
    const { date } = req.query;
    const barberId = req.params.id;
    
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    
    let slotsList = await storage.getSlots(barberId, date as string);
    if (slotsList.length === 0) {
      slotsList = await storage.generateSlotsForBarber(barberId, date as string);
    }
    
    res.json(slotsList);
  });

  app.patch("/api/slots/:id", async (req, res) => {
    const updated = await storage.updateSlot(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.json(updated);
  });

  app.get("/api/bookings", async (req, res) => {
    const { barberId, phone, code } = req.query;
    
    if (code) {
      const booking = await storage.getBookingByCode(code as string);
      return res.json(booking ? [booking] : []);
    }
    
    if (phone) {
      const bookingsList = await storage.getBookingsByPhone(phone as string);
      return res.json(bookingsList);
    }
    
    if (barberId) {
      const bookingsList = await storage.getBookingsByBarber(barberId as string);
      return res.json(bookingsList);
    }
    
    const allBookings = await storage.getBookings();
    res.json(allBookings);
  });

  app.get("/api/bookings/:id", async (req, res) => {
    const booking = await storage.getBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const {
        barberId,
        barberName,
        barberAvatar,
        clientName,
        clientPhone,
        slotTime,
        bookingDate,
        shopName,
        shopLocation,
        notifySms,
        notifyWhatsapp,
        haircutName,
      } = req.body;
      
      const booking = await storage.createBooking({
        barberId,
        barberName,
        barberAvatar,
        clientName,
        clientPhone,
        slotTime,
        bookingDate,
        shopName,
        shopLocation,
        userStatus: "pending",
        haircutName,
        notifySms: notifySms ?? true,
        notifyWhatsapp: notifyWhatsapp ?? false,
      });
      
      sendBookingConfirmation(
        clientPhone,
        clientName,
        booking.accessCode,
        shopName,
        barberName,
        slotTime,
        bookingDate,
        notifySms ?? true,
        notifyWhatsapp ?? false
      ).catch(err => console.error("Notification error:", err));
      
      res.status(201).json(booking);
    } catch (e) {
      console.error("Booking error:", e);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    const updated = await storage.updateBooking(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(updated);
  });

  app.get("/api/bookings/code/:code", async (req, res) => {
    const booking = await storage.getBookingByCode(req.params.code);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  });

  return httpServer;
}
