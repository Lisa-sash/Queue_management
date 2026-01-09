import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { QueueStatus } from "@/components/queue/QueueStatus";
import { SlotList } from "@/components/queue/SlotList";
import { BookingModal } from "@/components/queue/BookingModal";
import { MOCK_BARBERS, Barber, Slot } from "@/lib/mock-data";
import { bookingStore } from "@/lib/booking-store";
import { barberStore, LoggedInBarber } from "@/lib/barber-store";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Instagram, ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Shop() {
  const { id } = useParams();
  const { toast } = useToast();
  
  // Initialize based on ID, fallback to first
  const initialBarber = MOCK_BARBERS.find(b => b.id === id) || MOCK_BARBERS[0];
  const [barber, setBarber] = useState<Barber>(initialBarber);
  
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAccessCode, setLastAccessCode] = useState<string | undefined>(undefined);

  // Simulation: Random queue updates
  useEffect(() => {
    // Reset if ID changes
    const current = MOCK_BARBERS.find(b => b.id === id) || MOCK_BARBERS[0];
    setBarber(current);

    const interval = setInterval(() => {
      setBarber(prev => {
        const newSlots = [...prev.slots];
        const random = Math.random();
        
        // Scenario 1: Progress (Slot finishes) - 30% chance
        if (random < 0.3) {
          const inProgressIdx = newSlots.findIndex(s => s.status === 'in-progress');
          const nextBookedIdx = newSlots.findIndex(s => s.status === 'booked');
          
          if (inProgressIdx !== -1) {
             newSlots[inProgressIdx] = { ...newSlots[inProgressIdx], status: 'completed' };
             
             // Auto-fill with next booking if available
             if (nextBookedIdx !== -1) {
                newSlots[nextBookedIdx] = { ...newSlots[nextBookedIdx], status: 'in-progress' };
                toast({
                  title: "Queue Moving",
                  description: `${newSlots[nextBookedIdx].clientName || 'Next client'} is now in the chair.`,
                });
             } else {
                // Or maybe a walk-in takes it immediately?
                toast({
                  title: "Chair Available",
                  description: "Previous cut finished. Chair is open.",
                });
             }
             return { ...prev, slots: newSlots, currentWaitTime: Math.max(0, prev.currentWaitTime - 20) };
          }
        }
        
        // Scenario 2: Cancellation (Booked slot becomes available) - 10% chance
        else if (random > 0.3 && random < 0.4) {
           const bookedSlots = newSlots.filter(s => s.status === 'booked');
           if (bookedSlots.length > 0) {
             const randomBooked = bookedSlots[Math.floor(Math.random() * bookedSlots.length)];
             const idx = newSlots.findIndex(s => s.id === randomBooked.id);
             
             newSlots[idx] = { ...newSlots[idx], status: 'available', clientName: undefined, type: 'app' };
             toast({
               variant: "destructive", // Use default style but maybe warning color
               title: "Slot Cancelled!",
               description: `${randomBooked.time} just opened up! Grab it now.`,
               className: "border-l-4 border-orange-500"
             });
             return { ...prev, slots: newSlots, currentWaitTime: Math.max(0, prev.currentWaitTime - 15) };
           }
        }

        // Scenario 3: Walk-in fills an empty slot - 10% chance
        else if (random > 0.4 && random < 0.5) {
           const availableSlots = newSlots.filter(s => s.status === 'available');
           if (availableSlots.length > 0) {
             // Pick the earliest available slot
             const firstAvailable = availableSlots[0]; 
             const idx = newSlots.findIndex(s => s.id === firstAvailable.id);
             
             newSlots[idx] = { ...newSlots[idx], status: 'booked', clientName: 'Walk-in', type: 'walk-in' };
             toast({
               title: "New Walk-in",
               description: `A walk-in client just took the ${firstAvailable.time} slot.`,
             });
             return { ...prev, slots: newSlots, currentWaitTime: prev.currentWaitTime + 15 };
           }
        }

        return prev;
      });
    }, 5000); // Check every 5 seconds for more activity during demo

    return () => clearInterval(interval);
  }, [id, toast]);

  const [bookingForLoggedBarber, setBookingForLoggedBarber] = useState<{ barber: LoggedInBarber; day: 'today' | 'tomorrow' } | null>(null);

  const handleBookClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    setBookingForLoggedBarber(null);
    setIsModalOpen(true);
  };

  const handleLoggedBarberBookClick = (unifiedBarber: UnifiedBarber, day: 'today' | 'tomorrow', slotId: string) => {
    setSelectedSlotId(slotId);
    setBookingForLoggedBarber({ barber: unifiedBarber as any, day });
    setIsModalOpen(true);
  };

  const handleBookingConfirm = (name: string) => {
    if (!selectedSlotId) return;

    if (bookingForLoggedBarber) {
      const { barber: loggedBarber, day } = bookingForLoggedBarber;
      const slot = loggedBarber.slots[day].find(s => s.id === selectedSlotId);
      if (!slot) return;

      const newBooking = bookingStore.addBooking({
        barberId: loggedBarber.id,
        barberName: loggedBarber.name,
        barberAvatar: loggedBarber.avatar,
        slotId: selectedSlotId,
        slotTime: slot.time,
        clientName: name,
        userStatus: 'pending',
        shopName: shopName,
        shopLocation: location,
      });

      setLastAccessCode(newBooking.accessCode);

      barberStore.updateSlot(loggedBarber.id, day, selectedSlotId, {
        status: 'booked',
        clientName: name,
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your slot at ${slot.time} with ${loggedBarber.name} is booked.`,
      });
    } else {
      const slot = barber.slots.find(s => s.id === selectedSlotId);
      if (!slot) return;

      const newBooking = bookingStore.addBooking({
        barberId: barber.id,
        barberName: barber.name,
        barberAvatar: barber.avatar,
        slotId: selectedSlotId,
        slotTime: slot.time,
        clientName: name,
        userStatus: 'pending',
        shopName: shopName,
        shopLocation: location,
      });

      setLastAccessCode(newBooking.accessCode);

      setBarber(prev => {
        const newSlots = prev.slots.map(s => {
          if (s.id === selectedSlotId) {
            return { ...s, status: 'booked' as const, clientName: name, type: 'app' as const };
          }
          return s;
        });
        return { ...prev, slots: newSlots, currentWaitTime: prev.currentWaitTime + 30 };
      });
    }
  };

  const getSelectedSlotTime = () => {
    if (bookingForLoggedBarber) {
      const { barber: loggedBarber, day } = bookingForLoggedBarber;
      return loggedBarber.slots[day].find(s => s.id === selectedSlotId)?.time || "";
    }
    return barber.slots.find(s => s.id === selectedSlotId)?.time || "";
  };

  // Mock Shop Details based on ID (usually would come from backend)
  const shopName = id === '2' ? "Urban Cuts" : "The Gentleman's Den";
  const location = id === '2' ? "45 West End Ave" : "128 High Street, Downtown";

  interface UnifiedBarber {
    id: string;
    name: string;
    avatar: string;
    slots: { today: Slot[]; tomorrow: Slot[] };
  }

  const [allBarbers, setAllBarbers] = useState<UnifiedBarber[]>([]);
  const [selectedLoggedBarber, setSelectedLoggedBarber] = useState<UnifiedBarber | null>(null);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');

  useEffect(() => {
    const updateBarbers = () => {
      const registeredBarbers = barberStore.getBarbersByShop(shopName).map(b => ({
        id: b.id,
        name: b.name,
        avatar: b.avatar,
        slots: b.slots,
      }));

      setAllBarbers(registeredBarbers);
    };
    updateBarbers();
    return barberStore.subscribe(updateBarbers);
  }, [shopName]);

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <Navbar />
      
      {/* Shop Header */}
      <div className="pt-24 pb-8 px-4 bg-card border-b border-white/5">
        <div className="container mx-auto">
          <div className="mb-6">
            <Link href="/shops">
              <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shops
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">{shopName}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {location}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-primary" /> (555) 123-4567</span>
                <span className="flex items-center gap-1"><Instagram className="w-4 h-4 text-primary" /> @{shopName.replace(/\s/g, '').toLowerCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
               <span className="text-sm font-bold text-green-500 uppercase tracking-wider">Shop Open</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {allBarbers.length > 0 && (
            <div className="bg-card border border-white/5 rounded-lg p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Find Barbers
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Select a barber to view their available slots for today and tomorrow (8:30am - 8:30pm)
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {allBarbers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedLoggedBarber(selectedLoggedBarber?.id === b.id ? null : b)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      selectedLoggedBarber?.id === b.id
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50 bg-background'
                    }`}
                    data-testid={`select-barber-${b.id}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{b.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm" data-testid={`barber-name-${b.id}`}>{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.slots.today.filter(s => s.status === 'available').length} slots today</div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedLoggedBarber && (
                <div className="border-t border-white/5 pt-6">
                  <Tabs value={selectedDay} onValueChange={(v) => setSelectedDay(v as 'today' | 'tomorrow')}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold">{selectedLoggedBarber.name}</h3>
                      </div>
                      <TabsList>
                        <TabsTrigger value="today" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Today
                        </TabsTrigger>
                        <TabsTrigger value="tomorrow" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Tomorrow
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="today">
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {selectedLoggedBarber.slots.today.map((slot) => (
                          <button
                            key={slot.id}
                            disabled={slot.status !== 'available'}
                            onClick={() => handleLoggedBarberBookClick(selectedLoggedBarber, 'today', slot.id)}
                            className={`p-2 rounded text-xs font-medium transition-all ${
                              slot.status === 'available'
                                ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            }`}
                            data-testid={`slot-today-${slot.id}`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="tomorrow">
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {selectedLoggedBarber.slots.tomorrow.map((slot) => (
                          <button
                            key={slot.id}
                            disabled={slot.status !== 'available'}
                            onClick={() => handleLoggedBarberBookClick(selectedLoggedBarber, 'tomorrow', slot.id)}
                            className={`p-2 rounded text-xs font-medium transition-all ${
                              slot.status === 'available'
                                ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            }`}
                            data-testid={`slot-tomorrow-${slot.id}`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}

          <QueueStatus barber={barber} />
          
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-heading font-bold">Available Slots</h2>
             <div className="text-sm text-muted-foreground">
               Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
             </div>
          </div>

          <SlotList slots={barber.slots} onBook={handleBookClick} />
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setLastAccessCode(undefined); }}
        onConfirm={handleBookingConfirm}
        timeSlot={getSelectedSlotTime()}
        accessCode={lastAccessCode}
      />
    </div>
  );
}