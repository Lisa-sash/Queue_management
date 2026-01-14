import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { BarberSidebar } from "@/components/barber/BarberSidebar";
import { QueueCard } from "@/components/barber/QueueCard";
import { DashboardStats } from "@/components/barber/DashboardStats";
import { NotificationPanel } from "@/components/barber/NotificationPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Settings, Menu, X, UserPlus, Scissors, CalendarDays, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { bookingStore, BookingWithCode } from "@/lib/booking-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AnalyticsPanel } from "@/components/barber/AnalyticsPanel";

interface QueueItem {
  id: string;
  time: string;
  clientName: string;
  type: 'app' | 'walk-in';
  status: 'pending' | 'in-progress' | 'completed' | 'no-show' | 'paused';
  userStatus?: 'pending' | 'on-the-way' | 'will-be-late' | 'arrived';
  haircutName?: string;
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

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [walkIns, setWalkIns] = useState<QueueItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [barberId, setBarberId] = useState<string>("");
  const [prevBookingCount, setPrevBookingCount] = useState(0);
  
  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInHaircut, setWalkInHaircut] = useState("");
  
  // Queue view tab
  const [queueTab, setQueueTab] = useState<'today' | 'tomorrow'>('today');
  
  // Dashboard page view
  const [activePage, setActivePage] = useState<'queue' | 'analytics' | 'settings'>('queue');
  
  // Tomorrow's bookings from store
  const [tomorrowQueue, setTomorrowQueue] = useState<QueueItem[]>([]);

  // Load walk-ins and notifications from localStorage on mount
  useEffect(() => {
    const auth = localStorage.getItem("barberAuth");
    if (auth) {
      const parsed = JSON.parse(auth);
      const odayKey = new Date().toISOString().split('T')[0];
      const savedWalkIns = localStorage.getItem(`walkIns_${parsed.barberId}_${odayKey}`);
      const savedNotifications = localStorage.getItem(`notifications_${parsed.barberId}_${odayKey}`);
      
      if (savedWalkIns) {
        try {
          setWalkIns(JSON.parse(savedWalkIns));
        } catch (e) {}
      }
      if (savedNotifications) {
        try {
          const notifs = JSON.parse(savedNotifications);
          setNotifications(notifs.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
        } catch (e) {}
      }
    }
  }, []);

  // Save walk-ins to localStorage whenever they change
  useEffect(() => {
    if (barberId) {
      const todayKey = new Date().toISOString().split('T')[0];
      localStorage.setItem(`walkIns_${barberId}_${todayKey}`, JSON.stringify(walkIns));
    }
  }, [walkIns, barberId]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (barberId) {
      const todayKey = new Date().toISOString().split('T')[0];
      localStorage.setItem(`notifications_${barberId}_${todayKey}`, JSON.stringify(notifications));
    }
  }, [notifications, barberId]);

  // Load real bookings from bookingStore
  useEffect(() => {
    const auth = localStorage.getItem("barberAuth");
    if (auth) {
      const parsed = JSON.parse(auth);
      setBarberId(parsed.barberId || "");
    }
  }, []);

  // Subscribe to booking store and sync real bookings
  useEffect(() => {
    const syncBookings = () => {
      const allBookings = bookingStore.getBookings();
      const myBookings = allBookings.filter(b => b.barberId === barberId);
      
      // Separate today and tomorrow bookings
      const todayBookings = myBookings.filter(b => b.bookingDate === 'today' || !b.bookingDate);
      const tomorrowBookings = myBookings.filter(b => b.bookingDate === 'tomorrow');
      
      // Convert today's bookings to queue items
      const queueItems: QueueItem[] = todayBookings.map(booking => {
        // Map userStatus to queue status - arrived doesn't auto-start cutting
        let status: 'pending' | 'in-progress' | 'completed' | 'no-show' = 'pending';
        if (booking.userStatus === 'cancelled') {
          status = 'no-show';
        } else if (booking.userStatus === 'cutting') {
          status = 'in-progress';
        } else if (booking.userStatus === 'completed') {
          status = 'completed';
        }
        
        return {
          id: booking.id,
          time: booking.slotTime,
          clientName: booking.clientName,
          type: 'app' as const,
          status,
          userStatus: booking.userStatus === 'on-the-way' ? 'on-the-way' : 
                      booking.userStatus === 'will-be-late' ? 'will-be-late' : 
                      booking.userStatus === 'pending' ? 'pending' :
                      booking.userStatus === 'arrived' ? 'arrived' : undefined,
          haircutName: (booking as any).haircutName,
        };
      });
      
      // Convert tomorrow's bookings to queue items
      const tomorrowItems: QueueItem[] = tomorrowBookings.map(booking => ({
        id: booking.id,
        time: booking.slotTime,
        clientName: booking.clientName,
        type: 'app' as const,
        status: 'pending' as const,
        haircutName: (booking as any).haircutName,
      }));
      tomorrowItems.sort((a, b) => a.time.localeCompare(b.time));
      setTomorrowQueue(tomorrowItems);
      
      // Merge with walk-ins and sort by time
      const allItems = [...queueItems, ...walkIns];
      allItems.sort((a, b) => a.time.localeCompare(b.time));
      
      setQueue(allItems);
      
      // Add notification for new bookings
      if (myBookings.length > prevBookingCount && prevBookingCount > 0) {
        const latestBooking = myBookings[myBookings.length - 1];
        const newNotif: Notification = {
          id: Date.now().toString(),
          type: 'booking',
          message: `New booking: ${latestBooking.clientName} at ${latestBooking.slotTime}`,
          timestamp: new Date(),
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
      }
      setPrevBookingCount(myBookings.length);
    };
    
    if (barberId) {
      syncBookings();
      return bookingStore.subscribe(syncBookings);
    }
  }, [barberId, prevBookingCount, walkIns]);

  const handleStartCut = (id: string, haircutName: string) => {
    const client = queue.find(q => q.id === id);
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'in-progress' as const, haircutName } : item
      )
    );
    bookingStore.updateBooking(id, { userStatus: 'cutting' as any, haircutName } as any);
    addNotification('booking', `Started cutting ${client?.clientName} - ${haircutName}`);
  };

  const handleCompleteCut = (id: string) => {
    const client = queue.find(q => q.id === id);
    const isWalkIn = id.startsWith('walkin-');
    
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'completed' as const } : item
      )
    );
    
    if (isWalkIn) {
      setWalkIns(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'completed' as const } : item
        )
      );
    } else {
      bookingStore.updateBooking(id, { userStatus: 'completed' as any });
    }
    addNotification('booking', `Finished cutting ${client?.clientName}`);
    
    toast.success("Cut completed!");
    toast("Feedback request sent to client", {
      description: "A rating notification has been sent to their device.",
      icon: "✨"
    });
  };

  const handlePauseCut = (id: string) => {
    const client = queue.find(q => q.id === id);
    const isWalkIn = id.startsWith('walkin-');
    
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'paused' as const } : item
      )
    );
    
    if (isWalkIn) {
      setWalkIns(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'paused' as const } : item
        )
      );
    }
    
    toast({
      title: "Cut Paused",
      description: `${client?.clientName}'s cut has been paused. Booked client can take their spot.`,
    });
    addNotification('booking', `Paused ${client?.clientName}'s cut`);
  };

  const handleResumeCut = (id: string) => {
    const client = queue.find(q => q.id === id);
    const isWalkIn = id.startsWith('walkin-');
    
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'in-progress' as const } : item
      )
    );
    
    if (isWalkIn) {
      setWalkIns(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'in-progress' as const } : item
        )
      );
    }
    
    toast({
      title: "Cut Resumed",
      description: `Continuing ${client?.clientName}'s cut.`,
    });
    addNotification('booking', `Resumed ${client?.clientName}'s cut`);
  };

  const handleNoShow = (id: string) => {
    const client = queue.find(q => q.id === id);
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'no-show' as const } : item
      )
    );
    bookingStore.updateBooking(id, { userStatus: 'cancelled' });
    addNotification('cancellation', `${client?.clientName} didn't show up`);
  };

  const handleCancelBooking = (id: string, makeSlotAvailable: boolean) => {
    const client = queue.find(q => q.id === id);
    setQueue(prev => prev.filter(item => item.id !== id));
    bookingStore.updateBooking(id, { 
      userStatus: 'cancelled', 
      cancelledByBarber: true,
      slotAvailable: makeSlotAvailable 
    } as any);
    
    if (makeSlotAvailable) {
      addNotification('cancellation', `Cancelled ${client?.clientName}'s booking - slot now available for others`);
      toast({
        title: "Booking Cancelled",
        description: `${client?.clientName} has been notified. The ${client?.time} slot is now available.`,
      });
    } else {
      addNotification('cancellation', `Cancelled ${client?.clientName}'s booking - slot removed (emergency)`);
      toast({
        title: "Booking Cancelled",
        description: `${client?.clientName} has been notified. The slot has been removed.`,
        variant: "destructive",
      });
    }
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
  const bookedCount = queue.filter(q => q.type === 'app').length;
  const walkInsCount = queue.filter(q => q.type === 'walk-in').length;
  const pendingCount = queue.filter(q => q.status !== 'completed' && q.status !== 'no-show').length;
  const currentWaitTime = pendingCount > 0 ? pendingCount * 30 : 0;

  const handleAddWalkIn = () => {
    if (!walkInName.trim() || !walkInHaircut.trim()) return;
    
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const walkInItem: QueueItem = {
      id: `walkin-${Date.now()}`,
      time: timeStr,
      clientName: walkInName.trim(),
      type: 'walk-in',
      status: 'in-progress',
      haircutName: walkInHaircut.trim(),
    };
    
    // Add to walkIns state (will be persisted to localStorage)
    setWalkIns(prev => [...prev, walkInItem]);
    addNotification('walkin', `Walk-in: ${walkInName} - ${walkInHaircut}`);
    
    toast({
      title: "Walk-in Added",
      description: `Started cutting ${walkInName}`,
    });
    
    setShowWalkInModal(false);
    setWalkInName("");
    setWalkInHaircut("");
  };

  // Helper to update walk-in status
  const updateWalkInStatus = (id: string, status: QueueItem['status']) => {
    setWalkIns(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col">
        <BarberSidebar
          barberName={barberName}
          barberAvatar="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          activePage={activePage}
          onLogout={handleLogout}
          onNavigate={(page) => setActivePage(page as any)}
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
          barberName={barberName}
          barberAvatar="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          activePage={activePage}
          onLogout={handleLogout}
          onNavigate={(page) => { setActivePage(page as any); setMobileMenuOpen(false); }}
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
          {activePage === 'analytics' ? (
            <AnalyticsPanel barberId={barberId} />
          ) : activePage === 'settings' ? (
            <div className="text-center py-20 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-heading font-bold mb-2">Settings</h2>
              <p>Settings panel coming soon</p>
            </div>
          ) : (
          <>
          {/* Stats */}
          <div className="mb-8">
            <DashboardStats
              currentWaitTime={currentWaitTime}
              bookedToday={bookedCount}
              walkInsToday={walkInsCount}
              completedToday={completedCount}
              lateArrivals={queue.filter(q => q.userStatus === 'will-be-late').length}
            />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Queue Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                {/* Queue Tabs */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={queueTab === 'today' ? 'default' : 'outline'}
                      onClick={() => setQueueTab('today')}
                      className={cn(
                        queueTab === 'today' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border-white/10 hover:bg-white/5'
                      )}
                      data-testid="tab-today-queue"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Today's Queue
                      <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">{queue.length}</span>
                    </Button>
                    <Button
                      variant={queueTab === 'tomorrow' ? 'default' : 'outline'}
                      onClick={() => setQueueTab('tomorrow')}
                      className={cn(
                        queueTab === 'tomorrow' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border-white/10 hover:bg-white/5'
                      )}
                      data-testid="tab-tomorrow-queue"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Tomorrow
                      <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">{tomorrowQueue.length}</span>
                    </Button>
                  </div>
                  {queueTab === 'today' && (
                    <Button
                      onClick={() => setShowWalkInModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      data-testid="button-add-walkin"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Walk-in
                    </Button>
                  )}
                </div>

                {/* Today's Queue */}
                {queueTab === 'today' && (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {queue.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Scissors className="w-8 h-8 mx-auto mb-3 opacity-50" />
                          <p>No clients in queue yet</p>
                        </div>
                      ) : (
                        queue.map((item) => (
                          <QueueCard
                            key={item.id}
                            id={item.id}
                            time={item.time}
                            clientName={item.clientName}
                            type={item.type}
                            status={item.status}
                            userStatus={item.userStatus}
                            haircutName={item.haircutName}
                            onStartCut={handleStartCut}
                            onCompleteCut={handleCompleteCut}
                            onNoShow={handleNoShow}
                            onPauseCut={handlePauseCut}
                            onResumeCut={handleResumeCut}
                            onCancelBooking={handleCancelBooking}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Tomorrow's Queue */}
                {queueTab === 'tomorrow' && (
                  <div className="space-y-3">
                    {tomorrowQueue.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No bookings for tomorrow yet</p>
                      </div>
                    ) : (
                      tomorrowQueue.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg border bg-card border-white/5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-heading text-lg font-bold text-primary">{item.time}</span>
                              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-500">
                                Booked
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-foreground mt-2">{item.clientName}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
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
          </>
          )}
        </div>
      </div>

      {/* Walk-in Modal */}
      <Dialog open={showWalkInModal} onOpenChange={setShowWalkInModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Add Walk-in Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="walkin-name">Client Name</Label>
              <Input
                id="walkin-name"
                placeholder="Enter client's name"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                autoFocus
                data-testid="input-walkin-name"
                className="bg-background border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walkin-haircut">Haircut Style</Label>
              <Input
                id="walkin-haircut"
                placeholder="e.g. Fade, Buzz Cut, Trim..."
                value={walkInHaircut}
                onChange={(e) => setWalkInHaircut(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWalkIn()}
                data-testid="input-walkin-haircut"
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
                  onClick={() => setWalkInHaircut(style)}
                  className={cn(
                    "text-xs",
                    walkInHaircut === style && "bg-blue-500/20 border-blue-500 text-blue-500"
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
              onClick={() => setShowWalkInModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddWalkIn}
              disabled={!walkInName.trim() || !walkInHaircut.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              data-testid="button-confirm-walkin"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Start Cutting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}