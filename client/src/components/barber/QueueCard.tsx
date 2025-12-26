import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, User, AlertCircle, CheckCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueCardProps {
  id: string;
  time: string;
  clientName: string;
  type: 'app' | 'walk-in';
  status: 'pending' | 'in-progress' | 'completed' | 'no-show';
  userStatus?: 'pending' | 'on-the-way' | 'will-be-late';
  onStartCut?: (id: string) => void;
  onCompleteCut?: (id: string) => void;
  onNoShow?: (id: string) => void;
}

export function QueueCard({
  id,
  time,
  clientName,
  type,
  status,
  userStatus,
  onStartCut,
  onCompleteCut,
  onNoShow,
}: QueueCardProps) {
  const isInProgress = status === 'in-progress';
  const isPending = status === 'pending';
  const isCompleted = status === 'completed';
  const isLate = userStatus === 'will-be-late';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-300",
        isInProgress && "bg-primary/15 border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]",
        isPending && "bg-card border-white/5 hover:border-primary/30",
        isCompleted && "bg-black/20 border-white/5 opacity-60",
        isLate && !isInProgress && "border-orange-500/50 bg-orange-500/5"
      )}
    >
      {/* Pulse animation for in-progress */}
      {isInProgress && (
        <>
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-lg border border-primary/30"
          />
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
        </>
      )}

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "font-heading text-lg font-bold",
                isInProgress ? "text-primary" : "text-foreground"
              )}>
                {time}
              </span>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                type === 'walk-in' ? "bg-blue-500/20 text-blue-500" : "bg-green-500/20 text-green-500"
              )}>
                {type === 'walk-in' ? 'Walk-in' : 'Booked'}
              </span>
              {isInProgress && (
                <span className="text-xs font-bold text-primary animate-pulse">CUTTING</span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">{clientName}</p>
          </div>

          {/* Status Badge */}
          {isLate && (
            <div className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-1 rounded text-xs font-bold">
              <AlertCircle className="w-3 h-3" />
              Late
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
              <CheckCircle className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* User Status */}
        {userStatus && userStatus !== 'pending' && (
          <div className={cn(
            "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded w-fit",
            userStatus === 'on-the-way' && "bg-green-500/15 text-green-500",
            userStatus === 'will-be-late' && "bg-orange-500/15 text-orange-500"
          )}>
            {userStatus === 'on-the-way' ? '🚗 On the Way' : '⏰ Running Late'}
          </div>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="flex gap-2 pt-2 border-t border-white/5">
            {isPending && onStartCut && (
              <Button
                size="sm"
                onClick={() => onStartCut(id)}
                className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30"
              >
                Start Cut
              </Button>
            )}
            {isInProgress && onCompleteCut && (
              <Button
                size="sm"
                onClick={() => onCompleteCut(id)}
                className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30"
              >
                Done ✓
              </Button>
            )}
            {isPending && onNoShow && (
              <Button
                size="sm"
                onClick={() => onNoShow(id)}
                variant="outline"
                className="flex-1 text-red-500 hover:bg-red-500/10 border-red-500/20"
              >
                No-show
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}