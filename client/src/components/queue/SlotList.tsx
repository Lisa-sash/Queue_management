import { motion, AnimatePresence } from "framer-motion";
import { Slot } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Clock, UserCheck, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotListProps {
  slots: Slot[];
  onBook: (slotId: string) => void;
}

export function SlotList({ slots, onBook }: SlotListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-bold text-foreground/80 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Today's Schedule
      </h3>
      
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {slots.map((slot) => (
            <SlotItem key={slot.id} slot={slot} onBook={onBook} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SlotItem({ slot, onBook }: { slot: Slot, onBook: (id: string) => void }) {
  const isAvailable = slot.status === 'available';
  const isInProgress = slot.status === 'in-progress';
  const isBooked = slot.status === 'booked';
  const isCompleted = slot.status === 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-between p-4 rounded-md border transition-all duration-300",
        isInProgress && "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]",
        isBooked && "bg-card border-white/5 opacity-80",
        isAvailable && "bg-card border-white/5 hover:border-primary/30 hover:bg-card/80",
        isCompleted && "bg-black/20 border-transparent opacity-40 grayscale"
      )}
    >
      <div className="flex items-center gap-6">
        <span className={cn(
          "font-heading text-xl font-bold w-16",
          isInProgress ? "text-primary" : "text-foreground"
        )}>
          {slot.time}
        </span>
        
        <div className="flex flex-col">
          <span className={cn(
            "text-sm font-medium uppercase tracking-wider",
            isInProgress ? "text-primary" : "text-muted-foreground"
          )}>
            {isInProgress ? 'Cutting Now' : slot.status}
          </span>
          {(isBooked || isInProgress) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {slot.type === 'walk-in' ? <Footprints className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {isInProgress ? (slot.clientName || 'In Progress') : 'Booked'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAvailable && (
          <Button 
            onClick={() => onBook(slot.id)}
            size="sm"
            className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20"
          >
            Book Slot
          </Button>
        )}
        {isInProgress && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        )}
      </div>
    </motion.div>
  );
}