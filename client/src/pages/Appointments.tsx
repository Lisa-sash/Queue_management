import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BookingStatusCard } from "@/components/queue/BookingStatusCard";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Booking } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'booking-1',
      barberId: '1',
      barberName: 'Jax "The Blade"',
      barberAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      slotId: 's3',
      slotTime: '15:00',
      clientName: 'You',
      userStatus: 'pending',
      shopName: "The Gentleman's Den",
      shopLocation: '128 High Street, Downtown',
    }
  ]);
  const { toast } = useToast();

  const handleStatusChange = (bookingId: string, status: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled') => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? { ...booking, userStatus: status } : booking
      )
    );

    const messages = {
      'on-the-way': {
        title: 'On the Way! 🚗',
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

        {activeBookings.length > 0 ? (
          <div className="space-y-6">
            {activeBookings.map(booking => (
              <BookingStatusCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                onCancel={handleCancel}
              />
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
        ) : (
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
        )}

        {/* Helpful Info */}
        <div className="mt-12 p-6 bg-card/50 border border-white/5 rounded-lg">
          <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Book a slot and set a reminder on your phone</li>
            <li>✓ Update your status when you're leaving</li>
            <li>✓ If running late, let the barber know for a 15-min grace period</li>
            <li>✓ Cancel anytime to free the slot for walk-ins</li>
            <li>✓ Get notifications if the queue moves faster</li>
          </ul>
        </div>
      </div>
    </div>
  );
}