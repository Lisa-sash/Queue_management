import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, User, AlertCircle, CheckCircle, Phone, Scissors, Pause, Play, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface QueueCardProps {
  id: string;
  time: string;
  clientName: string;
  type: 'app' | 'walk-in';
  status: 'pending' | 'in-progress' | 'completed' | 'no-show' | 'paused';
  userStatus?: 'pending' | 'on-the-way' | 'will-be-late' | 'arrived';
  haircutName?: string;
  onStartCut?: (id: string, haircutName: string) => void;
  onCompleteCut?: (id: string) => void;
  onNoShow?: (id: string) => void;
  onPauseCut?: (id: string) => void;
  onResumeCut?: (id: string) => void;
  onCancelBooking?: (id: string) => void;
}

export function QueueCard({
  id,
  time,
  clientName,
  type,
  status,
  userStatus,
  haircutName,
  onStartCut,
  onCompleteCut,
  onNoShow,
  onPauseCut,
  onResumeCut,
  onCancelBooking,
}: QueueCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHaircutModal, setShowHaircutModal] = useState(false);
  const [haircutInput, setHaircutInput] = useState("");

  const isInProgress = status === 'in-progress';
  const isPending = status === 'pending';
  const isCompleted = status === 'completed';
  const isPaused = status === 'paused';
  const isLate = userStatus === 'will-be-late';
  const hasArrived = userStatus === 'arrived';

  const handleStartCutClick = () => {
    setShowHaircutModal(true);
  };

  const handleConfirmStart = () => {
    if (haircutInput.trim() && onStartCut) {
      onStartCut(id, haircutInput.trim());
      setShowHaircutModal(false);
      setHaircutInput("");
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={cn(
          "relative p-4 rounded-lg border transition-all duration-300",
          isInProgress && "bg-primary/15 border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]",
          isPaused && "bg-orange-500/15 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]",
          isPending && hasArrived && "bg-green-500/10 border-green-500/50",
          isPending && !hasArrived && "bg-card border-white/5 hover:border-primary/30",
          isCompleted && "bg-black/20 border-white/5 opacity-60",
          isLate && !isInProgress && !isPaused && "border-orange-500/50 bg-orange-500/5"
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

        {/* Arrived pulse animation */}
        {hasArrived && isPending && (
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
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
                {isPaused && (
                  <span className="text-xs font-bold text-orange-500 animate-pulse">PAUSED</span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">{clientName}</p>
              {haircutName && isInProgress && (
                <p className="text-xs text-primary/80 mt-1 flex items-center gap-1">
                  <Scissors className="w-3 h-3" />
                  {haircutName}
                </p>
              )}
            </div>

            {/* Status Badge */}
            {hasArrived && isPending && (
              <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold animate-pulse">
                <CheckCircle className="w-3 h-3" />
                ARRIVED
              </div>
            )}
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
          {userStatus && userStatus !== 'pending' && userStatus !== 'arrived' && (
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
                  onClick={handleStartCutClick}
                  className={cn(
                    "flex-1 border",
                    hasArrived 
                      ? "bg-green-500 text-white hover:bg-green-600 border-green-500"
                      : "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border-primary/30"
                  )}
                  data-testid={`button-start-cut-${id}`}
                >
                  <Scissors className="w-4 h-4 mr-1" />
                  Start Cut
                </Button>
              )}
              {isInProgress && onPauseCut && (
                <Button
                  size="sm"
                  onClick={() => onPauseCut(id)}
                  className="flex-1 bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30"
                  data-testid={`button-pause-cut-${id}`}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              )}
              {isInProgress && onCompleteCut && (
                <Button
                  size="sm"
                  onClick={() => onCompleteCut(id)}
                  className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30"
                  data-testid={`button-done-cut-${id}`}
                >
                  Done ✓
                </Button>
              )}
              {isPaused && onResumeCut && (
                <Button
                  size="sm"
                  onClick={() => onResumeCut(id)}
                  className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30"
                  data-testid={`button-resume-cut-${id}`}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              )}
              {isPaused && onCompleteCut && (
                <Button
                  size="sm"
                  onClick={() => onCompleteCut(id)}
                  className="flex-1 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30"
                  data-testid={`button-done-paused-${id}`}
                >
                  Done ✓
                </Button>
              )}
              {isPending && onNoShow && (
                <Button
                  size="sm"
                  onClick={() => onNoShow(id)}
                  variant="outline"
                  className="text-red-500 hover:bg-red-500/10 border-red-500/20"
                  data-testid={`button-noshow-${id}`}
                >
                  No-show
                </Button>
              )}
              {isPending && type === 'app' && onCancelBooking && (
                <Button
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  variant="outline"
                  className="text-orange-500 hover:bg-orange-500/10 border-orange-500/20"
                  data-testid={`button-cancel-booking-${id}`}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Haircut Name Modal */}
      <Dialog open={showHaircutModal} onOpenChange={setShowHaircutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">What haircut for {clientName}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="haircut-name">Haircut Style</Label>
              <Input
                id="haircut-name"
                placeholder="e.g. Fade, Buzz Cut, Trim..."
                value={haircutInput}
                onChange={(e) => setHaircutInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmStart()}
                autoFocus
                data-testid="input-haircut-name"
                className="bg-background border-white/10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['Fade', 'Buzz Cut', 'Trim', 'Taper', 'Line Up', 'Beard Trim'].map((style) => (
                <Button
                  key={style}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHaircutInput(style)}
                  className={cn(
                    "text-xs",
                    haircutInput === style && "bg-primary/20 border-primary text-primary"
                  )}
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowHaircutModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStart}
              disabled={!haircutInput.trim()}
              className="bg-primary text-primary-foreground"
              data-testid="button-confirm-start-cut"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Start Cutting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2 text-orange-500">
              <XCircle className="w-5 h-5" />
              Cancel Booking
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel <span className="font-bold text-foreground">{clientName}'s</span> booking at <span className="font-bold text-foreground">{time}</span>?
            </p>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-sm text-orange-500 font-medium mb-2">
                The client will be notified to:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Book with another available barber</li>
                <li>• Reschedule for a different time</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Booking
            </Button>
            <Button
              onClick={() => {
                onCancelBooking?.(id);
                setShowCancelModal(false);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-confirm-cancel-booking"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
