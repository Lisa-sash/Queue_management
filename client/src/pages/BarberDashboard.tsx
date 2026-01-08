import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { BarberSidebar } from "@/components/barber/BarberSidebar";
import { QueueCard } from "@/components/barber/QueueCard";
import { DashboardStats } from "@/components/barber/DashboardStats";
import { NotificationPanel } from "@/components/barber/NotificationPanel";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface QueueItem {
  id: string;
  time: string;
  clientName: string;
  type: 'app' | 'walk-in';
  status: 'pending' | 'in-progress' | 'completed' | 'no-show';
  userStatus?: 'pending' | 'on-the-way' | 'will-be-late';
}

interface Notification {
  id: string;
  type: 'booking' | 'cancellation' | 'late' | 'walkin';
  message: string;
  timestamp: Date;
}

export default function BarberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [barberName, setBarberName] = useState("Jax");
  const [shopName, setShopName] = useState("");

  // Check if logged in
  useEffect(() => {
    const auth = localStorage.getItem("barberAuth");
    if (!auth) {
      setLocation("/barber/login");
      return;
    }
    const parsed = JSON.parse(auth);
    setBarberName(parsed.name || "Barber");
    setShopName(parsed.shop || "");
  }, [setLocation]);

  const [queue, setQueue] = useState<QueueItem[]>([
    { id: '1', time: '14:00', clientName: 'Mike R.', type: 'app', status: 'completed' },
    { id: '2', time: '14:30', clientName: 'Sarah J.', type: 'walk-in', status: 'in-progress' },
    { id: '3', time: '15:00', clientName: 'Davide', type: 'app', status: 'pending', userStatus: 'on-the-way' },
    { id: '4', time: '15:30', clientName: 'Alex M.', type: 'app', status: 'pending' },
    { id: '5', time: '16:00', clientName: 'James D.', type: 'walk-in', status: 'pending', userStatus: 'will-be-late' },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      message: 'New booking: Davide at 15:00',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      type: 'late',
      message: 'James D. is running late for 16:00 slot',
      timestamp: new Date(Date.now() - 2 * 60000),
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotif: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'booking' : 'walkin',
          message: Math.random() > 0.5 ? 'New walk-in customer arrived' : 'New app booking confirmed',
          timestamp: new Date(),
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleStartCut = (id: string) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'in-progress' as const } : item
      )
    );
    addNotification('booking', `Started cutting ${queue.find(q => q.id === id)?.clientName}`);
  };

  const handleCompleteCut = (id: string) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'completed' as const } : item
      )
    );
    addNotification('booking', `Finished cutting ${queue.find(q => q.id === id)?.clientName}`);
  };

  const handleNoShow = (id: string) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'no-show' as const } : item
      )
    );
    addNotification('cancellation', `${queue.find(q => q.id === id)?.clientName} didn't show up`);
  };

  const addNotification = (type: 'booking' | 'cancellation' | 'late' | 'walkin', message: string) => {
    setNotifications(prev => [
      {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date(),
      },
      ...prev.slice(0, 4),
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem("barberAuth");
    toast({
      title: "Logged Out",
      description: "See you next time!",
    });
    setLocation("/");
  };

  const completedCount = queue.filter(q => q.status === 'completed').length;
  const bookedCount = queue.filter(q => q.status !== 'completed' && q.status !== 'no-show').length;
  const currentWaitTime = bookedCount > 0 ? bookedCount * 30 : 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col">
        <BarberSidebar
          barberName={`${barberName} "The Blade"`}
          barberAvatar="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          activePage="queue"
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-white/5 z-50 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="p-4 border-b border-white/5 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <BarberSidebar
          barberName={`${barberName} "The Blade"`}
          barberAvatar="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          activePage="queue"
          onLogout={handleLogout}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-card border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold" data-testid="text-barber-welcome">
                  Welcome, {barberName}
                </h1>
                <p className="text-xs text-muted-foreground" data-testid="text-barber-shop">
                  {shopName} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 max-w-7xl">
          {/* Stats */}
          <div className="mb-8">
            <DashboardStats
              currentWaitTime={currentWaitTime}
              totalToday={queue.length}
              completedToday={completedCount}
              lateArrivals={queue.filter(q => q.userStatus === 'will-be-late').length}
            />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Queue Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">Today's Queue</h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {queue.map((item) => (
                      <QueueCard
                        key={item.id}
                        id={item.id}
                        time={item.time}
                        clientName={item.clientName}
                        type={item.type}
                        status={item.status}
                        userStatus={item.userStatus}
                        onStartCut={handleStartCut}
                        onCompleteCut={handleCompleteCut}
                        onNoShow={handleNoShow}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Notifications Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-white/5 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold">Alerts</h3>
                  {notifications.length > 0 && (
                    <span className="ml-auto text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <div className="border-t border-white/5 pt-4">
                  <NotificationPanel
                    notifications={notifications}
                    onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}