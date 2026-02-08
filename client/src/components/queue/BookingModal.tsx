import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
  timeSlot: string;
  accessCode?: string;
}

export function BookingModal({ isOpen, onClose, onConfirm, timeSlot, accessCode }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(name, phone);
      setIsSubmitting(false);
      setShowConfirmation(true);
    }, 1000);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setShowConfirmation(false);
    onClose();
  };

  if (showConfirmation && accessCode) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-center">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your slot at <span className="text-primary font-bold">{timeSlot}</span> is reserved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Access Code</p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 inline-block">
              <span className="font-heading text-4xl font-bold tracking-[0.3em] text-primary" data-testid="text-access-code">
                {accessCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Save this code to find your booking under "My Bookings"
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Confirm Booking</DialogTitle>
          <DialogDescription>
            Book your cut for <span className="text-primary font-bold">{timeSlot}</span>. 
            We'll hold this slot for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-muted-foreground">Your Name</Label>
            <Input
              id="name"
              data-testid="input-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="bg-background border-white/10 focus:border-primary/50"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
            <Input
              id="phone"
              data-testid="input-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +27821234567"
              className="bg-background border-white/10 focus:border-primary/50"
              type="tel"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="button-confirm-booking"
              disabled={!name.trim() || !phone.trim() || isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Slot'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}