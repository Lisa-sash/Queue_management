import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BookingStatusCard } from "@/components/queue/BookingStatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Calendar, Search, KeyRound } from "lucide-react";
import { Link } from "wouter";
import { bookingStore, BookingWithCode } from "@/lib/booking-store";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [bookings, setBookings] = useState<BookingWithCode[]>(bookingStore.getBookings());
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [foundBooking, setFoundBooking] = useState<BookingWithCode | null>(null);
  const [searchError, setSearchError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return bookingStore.subscribe(() => {
      setBookings(bookingStore.getBookings());
    });
  }, []);

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

  const activeBookings = bookings.filter(b => b.userStatus !== 'cancelled');
  const cancelledBookings = bookings.filter(b => b.userStatus === 'cancelled');

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Track your haircut appointments and update your status in real-time.</p>
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

        {foundBooking && (
          <div className="mb-8">
            <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">Found Booking</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-mono">{foundBooking.accessCode}</span>
            </h2>
            <BookingStatusCard
              booking={foundBooking}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
            />
          </div>
        )}

        {activeBookings.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-heading font-bold text-muted-foreground">All Your Bookings</h2>
            {activeBookings.map(booking => (
              <div key={booking.id} className="relative">
                <div className="absolute -top-2 right-4 bg-card px-2 py-0.5 rounded text-xs font-mono text-primary border border-primary/30">
                  {booking.accessCode}
                </div>
                <BookingStatusCard
                  booking={booking}
                  onStatusChange={handleStatusChange}
                  onCancel={handleCancel}
                />
              </div>
            ))}

            {cancelledBookings.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <h2 className="text-lg font-heading font-bold mb-4 text-muted-foreground">Past / Cancelled</h2>
                <div className="space-y-3">
                  {cancelledBookings.map(booking => (
                    <BookingStatusCard
                      key={booking.id}
                      booking={booking}
                      onStatusChange={handleStatusChange}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !foundBooking ? (
          <div className="bg-card border border-white/5 rounded-lg p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">No Active Bookings</h2>
            <p className="text-muted-foreground">You haven't booked any slots yet. Find a barber to get started.</p>
            <div className="pt-4">
              <Link href="/shops">
                <Button className="bg-primary text-primary-foreground">Find a Barber</Button>
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-12 p-6 bg-card/50 border border-white/5 rounded-lg">
          <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Book a slot and save your 4-character access code</li>
            <li>✓ Use your code to find your booking anytime</li>
            <li>✓ Update your status when you're leaving</li>
            <li>✓ If running late, let the barber know for a 15-min grace period</li>
            <li>✓ Cancel anytime to free the slot for walk-ins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
