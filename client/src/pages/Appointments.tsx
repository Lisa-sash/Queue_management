import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BookingStatusCard } from "@/components/queue/BookingStatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Search, KeyRound } from "lucide-react";
import { Link } from "wouter";
import { bookingStore, BookingWithCode } from "@/lib/booking-store";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [foundBooking, setFoundBooking] = useState<BookingWithCode | null>(null);
  const [searchError, setSearchError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return bookingStore.subscribe(() => {
      if (foundBooking) {
        const updated = bookingStore.findByCode(foundBooking.accessCode);
        if (updated) {
          setFoundBooking(updated);
        }
      }
    });
  }, [foundBooking]);

  const handleSearch = () => {
    if (!accessCodeInput.trim()) return;
    
    const booking = bookingStore.findByCode(accessCodeInput.trim());
    if (booking) {
      setFoundBooking(booking);
      setSearchError(false);
    } else {
      setFoundBooking(null);
      setSearchError(true);
      toast({
        variant: "destructive",
        title: "Not Found",
        description: "No booking found with that access code.",
      });
    }
  };

  const handleStatusChange = (bookingId: string, status: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled') => {
    bookingStore.updateBooking(bookingId, { userStatus: status });

    const messages = {
      'on-the-way': {
        title: 'On the Way!',
        description: 'The barber knows you\'re coming. See you soon!'
      },
      'will-be-late': {
        title: 'Late Notice Sent',
        description: 'The barber has been notified. Your slot is reserved for 15 extra minutes.'
      },
      'pending': {
        title: 'Status Updated',
        description: 'Your booking status has been reset.'
      },
      'cancelled': {
        title: 'Booking Cancelled',
        description: 'Your slot has been released and is now available for others.'
      }
    };

    const msg = messages[status];
    toast({
      title: msg.title,
      description: msg.description,
      className: status === 'cancelled' ? '' : 'bg-primary text-primary-foreground border-none'
    });
  };

  const handleCancel = (bookingId: string) => {
    handleStatusChange(bookingId, 'cancelled');
  };

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Enter your access code to find and manage your booking.</p>
        </div>

        <div className="mb-8 p-6 bg-card border border-white/5 rounded-lg">
          <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Find Your Booking
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your 4-character access code to find your booking.
          </p>
          <div className="flex gap-2">
            <Input
              value={accessCodeInput}
              onChange={(e) => {
                setAccessCodeInput(e.target.value.toUpperCase());
                setSearchError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. AB12"
              maxLength={4}
              data-testid="input-access-code"
              className={`bg-background border-white/10 focus:border-primary/50 uppercase tracking-widest font-mono text-lg ${searchError ? 'border-red-500' : ''}`}
            />
            <Button 
              onClick={handleSearch}
              data-testid="button-search-booking"
              className="bg-primary text-primary-foreground"
            >
              <Search className="w-4 h-4 mr-2" />
              Find
            </Button>
          </div>
        </div>

        {foundBooking ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-heading font-bold">Your Booking</h2>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-mono">{foundBooking.accessCode}</span>
            </div>
            <BookingStatusCard
              booking={foundBooking}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="bg-card border border-white/5 rounded-lg p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">No Booking Found</h2>
            <p className="text-muted-foreground">Enter your access code above to find your booking, or book a new slot.</p>
            <div className="pt-4">
              <Link href="/shops">
                <Button className="bg-primary text-primary-foreground">Find a Barber</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
