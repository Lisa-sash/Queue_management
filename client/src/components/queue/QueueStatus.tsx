import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { Barber } from "@/lib/mock-data";

interface QueueStatusProps {
  barber: Barber;
}

export function QueueStatus({ barber }: QueueStatusProps) {
  const isBusy = barber.currentWaitTime > 30;

  return (
    <div className="w-full bg-card/50 border border-white/5 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden">
      {/* Background Gradient Pulse */}
      <motion.div 
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute inset-0 bg-gradient-to-r ${isBusy ? 'from-red-500/20 to-orange-500/20' : 'from-green-500/20 to-emerald-500/20'}`}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={barber.avatar} 
              alt={barber.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/50"
            />
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${barber.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">{barber.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${barber.isAvailable ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              {barber.isAvailable ? 'Cutting Now' : 'On Break'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Queue</span>
            </div>
            <span className="text-2xl font-bold font-heading">{barber.slots.filter(s => s.status === 'booked' || s.status === 'in-progress').length}</span>
          </div>
          
          <div className="w-px h-12 bg-white/10" />

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Est. Wait</span>
            </div>
            <span className={`text-2xl font-bold font-heading ${isBusy ? 'text-orange-500' : 'text-green-500'}`}>
              {barber.currentWaitTime} <span className="text-sm font-sans font-normal text-muted-foreground">min</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}