import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Scissors, Clock, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ratings: RatingData) => void;
  barberName: string;
  shopName: string;
}

export interface RatingData {
  cutRating: number;
  queueRating: number;
  cutFeedback?: string;
  queueFeedback?: string;
}

function StarRating({ 
  rating, 
  onRatingChange, 
  label, 
  icon: Icon 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
  label: string;
  icon: React.ElementType;
}) {
  const [hoveredStar, setHoveredStar] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="font-heading font-bold text-foreground">{label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => onRatingChange(star)}
            className="p-1 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
            data-testid={`star-${label.toLowerCase().replace(/\s/g, '-')}-${star}`}
          >
            <Star
              className={cn(
                "w-8 h-8 transition-all duration-200",
                (hoveredStar >= star || rating >= star)
                  ? "fill-amber-400 text-amber-400"
                  : "text-white/20 hover:text-white/40"
              )}
            />
          </motion.button>
        ))}
      </div>
      {rating > 0 && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {rating <= 2 ? "We're sorry to hear that" : rating === 3 ? "Thanks for the feedback" : rating === 4 ? "Great to hear!" : "Excellent!"}
        </motion.p>
      )}
    </div>
  );
}

export function RatingModal({ isOpen, onClose, onSubmit, barberName, shopName }: RatingModalProps) {
  const [cutRating, setCutRating] = useState(0);
  const [queueRating, setQueueRating] = useState(0);
  const [cutFeedback, setCutFeedback] = useState("");
  const [queueFeedback, setQueueFeedback] = useState("");
  const [step, setStep] = useState<'rating' | 'feedback' | 'thanks'>('rating');

  const needsCutFeedback = cutRating > 0 && cutRating <= 3;
  const needsQueueFeedback = queueRating > 0 && queueRating <= 3;
  const needsFeedback = needsCutFeedback || needsQueueFeedback;

  const handleContinue = () => {
    if (step === 'rating') {
      if (needsFeedback) {
        setStep('feedback');
      } else {
        handleSubmit();
      }
    } else if (step === 'feedback') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setStep('thanks');
    setTimeout(() => {
      onSubmit({
        cutRating,
        queueRating,
        cutFeedback: cutFeedback || undefined,
        queueFeedback: queueFeedback || undefined,
      });
    }, 1500);
  };

  const handleClose = () => {
    setCutRating(0);
    setQueueRating(0);
    setCutFeedback("");
    setQueueFeedback("");
    setStep('rating');
    onClose();
  };

  const canContinue = cutRating > 0 && queueRating > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-white/10 max-w-md">
        <AnimatePresence mode="wait">
          {step === 'rating' && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader className="space-y-3 pb-4">
                <DialogTitle className="font-heading text-2xl">How was your visit?</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Rate your experience with <span className="text-primary font-medium">{barberName}</span> at {shopName}
                </p>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <StarRating
                  rating={cutRating}
                  onRatingChange={setCutRating}
                  label="Haircut Quality"
                  icon={Scissors}
                />
                <div className="h-px bg-white/5" />
                <StarRating
                  rating={queueRating}
                  onRatingChange={setQueueRating}
                  label="Queue Experience"
                  icon={Clock}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-white/10"
                  data-testid="button-skip-rating"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className="flex-1 bg-primary text-primary-foreground"
                  data-testid="button-continue-rating"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader className="space-y-3 pb-4">
                <DialogTitle className="font-heading text-2xl">Help us improve</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  We'd love to know how we can do better
                </p>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {needsCutFeedback && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-primary" />
                      What could be improved about the haircut?
                    </label>
                    <Textarea
                      value={cutFeedback}
                      onChange={(e) => setCutFeedback(e.target.value)}
                      placeholder="e.g., The fade wasn't quite what I asked for..."
                      className="bg-background border-white/10 focus:border-primary/50 min-h-[80px] resize-none"
                      data-testid="textarea-cut-feedback"
                    />
                  </div>
                )}

                {needsQueueFeedback && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      How can we improve the queue experience?
                    </label>
                    <Textarea
                      value={queueFeedback}
                      onChange={(e) => setQueueFeedback(e.target.value)}
                      placeholder="e.g., The wait time was longer than expected..."
                      className="bg-background border-white/10 focus:border-primary/50 min-h-[80px] resize-none"
                      data-testid="textarea-queue-feedback"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('rating')}
                  className="flex-1 border-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 bg-primary text-primary-foreground"
                  data-testid="button-submit-feedback"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'thanks' && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="font-heading text-xl font-bold mb-2">Thank you!</h3>
              <p className="text-sm text-muted-foreground">
                Your feedback helps us improve
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
