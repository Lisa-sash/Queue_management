import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { bookingStore, BookingWithCode } from "@/lib/booking-store";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Calendar, Clock, MapPin, Scissors, 
  ArrowRight, Ticket, User, Phone, AlertCircle,
  History, LogIn
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookingStatusCard } from "@/components/queue/BookingStatusCard";

export default function Appointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'code' | 'phone'>('code');
  const [foundBookings, setFoundBookings] = useState<BookingWithCode[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return bookingStore.subscribe(() => {
      if (foundBookings.length > 0) {
        const updated = foundBookings.map(fb => 
          bookingStore.getBookings().find(b => b.id === fb.id)
        ).filter(Boolean) as BookingWithCode[];
        setFoundBookings(updated);
      }
    });
  }, [foundBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let results: BookingWithCode[] = [];
    if (activeTab === 'code') {
      const booking = bookingStore.findByCode(searchQuery.trim());
      if (booking) results = [booking];
    } else {
      results = bookingStore.findByPhone(searchQuery.trim());
    }

    setFoundBookings(results);
    setHasSearched(true);

    if (results.length === 0) {
      toast({
        title: "No appointments found",
        description: `We couldn't find any bookings matching that ${activeTab === 'code' ? 'access code' : 'phone number'}.`,
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (bookingId: string, status: any) => {
    if (status === 'completed') {
      bookingStore.updateBooking(bookingId, { userStatus: 'arrived', isCompleted: true } as any);
    } else {
      bookingStore.updateBooking(bookingId, { userStatus: status });
    }
    toast({ title: "Status Updated", description: "Your barber has been notified." });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4 bg-gradient-to-b from-card to-background border-b border-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Track Your Appointment</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Lost your code? No problem. Search for your booking using either your unique access code or the phone number used during booking.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex p-1 bg-white/5 rounded-xl mb-8">
              <button onClick={() => { setActiveTab('code'); setHasSearched(false); setSearchQuery(""); }} className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all", activeTab === 'code' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Access Code</button>
              <button onClick={() => { setActiveTab('phone'); setHasSearched(false); setSearchQuery(""); }} className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all", activeTab === 'phone' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Phone Number</button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={activeTab === 'code' ? "Enter 4-digit code" : "Enter phone number"} className="flex-1 h-14 bg-background border-white/10 text-lg" />
              <Button type="submit" size="lg" className="h-14 px-8 font-bold">Search</Button>
            </form>
          </motion.div>

          <div className="mt-12 space-y-6">
            <AnimatePresence>
              {hasSearched && foundBookings.length > 0 ? (
                foundBookings.map((booking) => (
                  <BookingStatusCard key={booking.id} booking={booking} onStatusChange={handleStatusChange} onCancel={() => {}} onRate={() => {}} />
                ))
              ) : hasSearched && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold">No Appointments Found</h3>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}