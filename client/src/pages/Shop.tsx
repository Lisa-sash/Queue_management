import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { BookingModal } from "@/components/queue/BookingModal";
import { bookingStore } from "@/lib/booking-store";
import { barberStore } from "@/lib/barber-store";
import { Barber, Slot, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Instagram, ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UnifiedBarber {
  id: string;
  name: string;
  avatar: string;
  shopName: string;
}

export default function Shop() {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAccessCode, setLastAccessCode] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allBarbers, setAllBarbers] = useState<UnifiedBarber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<UnifiedBarber | null>(null);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [todaySlots, setTodaySlots] = useState<Slot[]>([]);
  const [tomorrowSlots, setTomorrowSlots] = useState<Slot[]>([]);

  const shopName = id === '2' ? "Urban Cuts" : "The Gentleman's Den";
  const location = id === '2' ? "45 West End Ave" : "128 High Street, Downtown";

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => {
    const loadBarbers = async () => {
      setIsLoading(true);
      try {
        const barbers = await barberStore.getBarbersByShop(shopName);
        setAllBarbers(barbers.map(b => ({
          id: b.id,
          name: b.name,
          avatar: b.avatar || "",
          shopName: b.shopName,
        })));
      } catch (e) {
        console.error("Failed to load barbers:", e);
      }
      setIsLoading(false);
    };
    loadBarbers();
  }, [shopName]);

  useEffect(() => {
    if (!selectedBarber) return;
    
    const loadSlots = async () => {
      try {
        const [tSlots, tmSlots] = await Promise.all([
          barberStore.getSlots(selectedBarber.id, today),
          barberStore.getSlots(selectedBarber.id, tomorrow),
        ]);
        setTodaySlots(tSlots);
        setTomorrowSlots(tmSlots);
      } catch (e) {
        console.error("Failed to load slots:", e);
      }
    };
    loadSlots();
  }, [selectedBarber, today, tomorrow]);

  const handleBookClick = (slot: Slot) => {
    setSelectedSlotId(slot.id);
    setSelectedSlotTime(slot.time);
    setIsModalOpen(true);
  };

  const handleBookingConfirm = async (name: string, phone: string, notificationPrefs: { sms: boolean; whatsapp: boolean }) => {
    if (!selectedSlotId || !selectedBarber) return;

    setIsSubmitting(true);
    try {
      const slots = selectedDay === 'today' ? todaySlots : tomorrowSlots;
      const slot = slots.find(s => s.id === selectedSlotId);
      if (!slot) return;

      const newBooking = await bookingStore.addBooking({
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        barberAvatar: selectedBarber.avatar,
        clientName: name,
        clientPhone: phone,
        slotTime: slot.time,
        bookingDate: selectedDay === 'today' ? today : tomorrow,
        shopName: shopName,
        shopLocation: location,
        notifySms: notificationPrefs.sms,
        notifyWhatsapp: notificationPrefs.whatsapp,
      });

      setLastAccessCode(newBooking.accessCode);

      const channelText = notificationPrefs.sms && notificationPrefs.whatsapp 
        ? "SMS and WhatsApp" 
        : notificationPrefs.sms ? "SMS" : "WhatsApp";

      toast({
        title: "Booking Confirmed!",
        description: `Your slot at ${slot.time} with ${selectedBarber.name} is booked. A confirmation via ${channelText} with your access code ${newBooking.accessCode} has been sent.`,
      });

      if (selectedDay === 'today') {
        setTodaySlots(prev => prev.map(s => s.id === selectedSlotId ? { ...s, status: 'booked', clientName: name } : s));
      } else {
        setTomorrowSlots(prev => prev.map(s => s.id === selectedSlotId ? { ...s, status: 'booked', clientName: name } : s));
      }
    } catch (e) {
      console.error("Booking failed:", e);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const availableTodayCount = (barberId: string) => {
    if (selectedBarber?.id !== barberId) return "View slots";
    return `${todaySlots.filter(s => s.status === 'available').length} slots today`;
  };

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <Navbar />
      
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
          {isLoading ? (
            <div className="bg-card border border-white/5 rounded-lg p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : allBarbers.length > 0 ? (
            <div className="bg-card border border-white/5 rounded-lg p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Find Barbers
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Select a barber to view their available slots for today and tomorrow (8:30am - 8:00pm)
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {allBarbers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarber(selectedBarber?.id === b.id ? null : b)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      selectedBarber?.id === b.id
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
                      <div className="text-xs text-muted-foreground">{availableTodayCount(b.id)}</div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedBarber && (
                <div className="border-t border-white/5 pt-6">
                  <Tabs value={selectedDay} onValueChange={(v) => setSelectedDay(v as 'today' | 'tomorrow')}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold">{selectedBarber.name}</h3>
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
                        {todaySlots.map((slot) => (
                          <button
                            key={slot.id}
                            disabled={slot.status !== 'available'}
                            onClick={() => handleBookClick(slot)}
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
                        {tomorrowSlots.map((slot) => (
                          <button
                            key={slot.id}
                            disabled={slot.status !== 'available'}
                            onClick={() => handleBookClick(slot)}
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
          ) : (
            <div className="bg-card border border-white/5 rounded-lg p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold mb-2">No Barbers Available Yet</h3>
              <p className="text-muted-foreground">
                Barbers will appear here once they log in to the system.
              </p>
            </div>
          )}
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setLastAccessCode(undefined); }}
        onConfirm={handleBookingConfirm}
        timeSlot={selectedSlotTime}
        accessCode={lastAccessCode}
      />
    </div>
  );
}
