import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: 'booking' | 'cancellation' | 'late' | 'walkin';
  message: string;
  timestamp: Date;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationPanel({ notifications, onDismiss }: NotificationPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'cancellation': return '❌';
      case 'late': return '⏰';
      case 'walkin': return '🚶';
      default: return '📢';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'booking': return 'border-green-500/30 bg-green-500/5';
      case 'cancellation': return 'border-red-500/30 bg-red-500/5';
      case 'late': return 'border-orange-500/30 bg-orange-500/5';
      case 'walkin': return 'border-blue-500/30 bg-blue-500/5';
      default: return 'border-white/10 bg-white/5';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Bell className="w-8 h-8 opacity-40 mb-2" />
        <p className="text-sm">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getColor(notif.type)}`}
          >
            <span className="text-lg mt-0.5">{getIcon(notif.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground break-words">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(notif.id)}
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}