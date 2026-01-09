import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertCircle, CheckCircle, X } from "lucide-react";
import { Booking } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface BookingStatusCardProps {
  booking: Booking;
  onStatusChange: (bookingId: string, status: 'pending' | 'on-the-way' | 'will-be-late' | 'cancelled' | 'arrived') => void;
  onCancel: (bookingId: string) => void;
}

export function BookingStatusCard({ booking, onStatusChange, onCancel }: BookingStatusCardProps) {
  const isLate = booking.userStatus === 'will-be-late';
  const isOnTheWay = booking.userStatus === 'on-the-way';
  const isCancelled = booking.userStatus === 'cancelled';
  const isArrived = booking.userStatus === 'arrived';
  const showArrivedButton = isOnTheWay || isLate;

  const statusColor = {
    'pending': 'text-muted-foreground',
    'on-the-way': 'text-green-500',
    'will-be-late': 'text-orange-500',
    'cancelled': 'text-red-500',
    'arrived': 'text-primary'
  };

  const statusLabel = {
    'pending': 'Pending',
    'on-the-way': 'On the Way',
    'will-be-late': 'Will Be Late',
    'cancelled': 'Cancelled',
    'arrived': 'Arrived'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-6 rounded-lg border transition-all duration-300",
        isCancelled && "bg-red-500/5 border-red-500/20 opacity-60",
        !isCancelled && "bg-card border-white/5 hover:border-primary/20"
      )}
    >
      {isCancelled && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-lg" />
      )}

      <div className="relative z-10 space-y-4">
        {/* Barber & Shop Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
              <span className="text-primary font-heading font-bold text-lg uppercase">
                {booking.barberName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground">{booking.barberName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {booking.shopName}
              </p>
            </div>
          </div>
          <div className={cn("text-xs font-bold uppercase tracking-wider", statusColor[booking.userStatus])}>
            {statusLabel[booking.userStatus]}
          </div>
        </div>

        {/* Client Name */}
        <div className="p-3 bg-primary/5 border border-primary/10 rounded">
          <p className="text-xs text-muted-foreground mb-1">Booking for</p>
          <p className="font-heading font-bold text-foreground">{booking.clientName}</p>
        </div>

        {/* Time & Status Separator */}
        <div className="h-px bg-white/5" />

        {/* Booking Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <span className="font-heading font-bold text-foreground">{booking.slotTime}</span>
              <span className="text-xs text-muted-foreground ml-2">Your Slot</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {isLate && (
          <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded text-orange-500 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Let the barber know you're running late. They'll hold your slot.</span>
          </div>
        )}

        {isOnTheWay && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Great! You're on the way. See you soon!</span>
          </div>
        )}

        {isArrived && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded text-primary text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>You've arrived! The barber has been notified.</span>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
            <X className="w-4 h-4 flex-shrink-0" />
            <span>This booking has been cancelled. The slot is now available for others.</span>
          </div>
        )}

        {/* Action Buttons */}
        {!isCancelled && !isArrived && (
          <div className="flex gap-2 pt-2">
            {showArrivedButton ? (
              <Button
                size="sm"
                onClick={() => onStatusChange(booking.id, 'arrived')}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I've Arrived
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(booking.id, 'on-the-way')}
                  className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  variant="outline"
                >
                  I'm On The Way
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(booking.id, 'will-be-late')}
                  className="flex-1 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10 border border-orange-500/20"
                  variant="outline"
                >
                  I'll Be Late
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={() => onCancel(booking.id)}
              variant="outline"
              className="text-red-500 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/30"
              data-testid="button-cancel-booking"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel Booking
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}