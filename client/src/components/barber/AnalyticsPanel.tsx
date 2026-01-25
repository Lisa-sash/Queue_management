import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, DollarSign, Clock, Calendar,
  Lock, Crown, Zap, Star, Target, PieChart, Activity, Award,
  ArrowUpRight, ArrowDownRight, Scissors, CheckCircle, Store, Layers,
  Info, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyticsStore, AnalyticsTier } from "@/lib/analytics-store";
import { bookingStore } from "@/lib/booking-store";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const weeklyData = [
  { day: 'Mon', current: 8, previous: 7, den: 420, urban: 380, denPrev: 390, urbanPrev: 350 },
  { day: 'Tue', current: 12, previous: 14, den: 450, urban: 410, denPrev: 430, urbanPrev: 380 },
  { day: 'Wed', current: 10, previous: 9, den: 480, urban: 440, denPrev: 460, urbanPrev: 410 },
  { day: 'Thu', current: 15, previous: 13, den: 510, urban: 470, denPrev: 490, urbanPrev: 430 },
  { day: 'Fri', current: 18, previous: 16, den: 650, urban: 610, denPrev: 580, urbanPrev: 540 },
  { day: 'Sat', current: 22, previous: 20, den: 850, urban: 790, denPrev: 750, urbanPrev: 700 },
  { day: 'Sun', current: 6, previous: 8, den: 540, urban: 500, denPrev: 510, urbanPrev: 460 },
];

const weeklyCutsData = [
  { day: 'Mon', den: 6, urban: 5, denPrev: 5, urbanPrev: 4 },
  { day: 'Tue', den: 9, urban: 7, denPrev: 8, urbanPrev: 6 },
  { day: 'Wed', den: 8, urban: 6, denPrev: 7, urbanPrev: 5 },
  { day: 'Thu', den: 11, urban: 9, denPrev: 10, urbanPrev: 8 },
  { day: 'Fri', den: 14, urban: 12, denPrev: 13, urbanPrev: 10 },
  { day: 'Sat', den: 18, urban: 15, denPrev: 16, urbanPrev: 14 },
  { day: 'Sun', den: 5, urban: 4, denPrev: 6, urbanPrev: 5 },
];

const serviceBreakdownWeekly = [
  { name: 'Skin Fade', value: 35, color: '#f97316' },
  { name: 'Classic Scissors', value: 28, color: '#3b82f6' },
  { name: 'Beard Sculpt', value: 18, color: '#22c55e' },
  { name: 'Buzz Cut', value: 12, color: '#a855f7' },
  { name: 'The Den Special', value: 7, color: '#eab308' },
];

const serviceBreakdownMonthly = [
  { name: 'Skin Fade', value: 145, color: '#f97316' },
  { name: 'Classic Scissors', value: 112, color: '#3b82f6' },
  { name: 'Beard Sculpt', value: 78, color: '#22c55e' },
  { name: 'Buzz Cut', value: 45, color: '#a855f7' },
  { name: 'The Den Special', value: 32, color: '#eab308' },
];

const shopComparisonData = [
  { metric: 'Revenue', den: 4200, urban: 3800 },
  { metric: 'Clients', den: 120, urban: 110 },
  { metric: 'Wait Time', den: 12, urban: 15 },
  { metric: 'Rating', den: 4.8, urban: 4.6 },
];

const peakHoursWeekly = [
  { hour: '08:00', clients: 2 },
  { hour: '10:00', clients: 5 },
  { hour: '12:00', clients: 4 },
  { hour: '14:00', clients: 8 },
  { hour: '16:00', clients: 9 },
  { hour: '18:00', clients: 6 },
  { hour: '20:00', clients: 3 },
];

const peakHoursMonthly = [
  { hour: '08:00', clients: 12 },
  { hour: '10:00', clients: 25 },
  { hour: '12:00', clients: 22 },
  { hour: '14:00', clients: 45 },
  { hour: '16:00', clients: 48 },
  { hour: '18:00', clients: 32 },
  { hour: '20:00', clients: 15 },
];

const monthlyComparisonData = [
  { month: 'Jan', den: 4200, urban: 3800 },
  { month: 'Feb', den: 4500, urban: 4100 },
  { month: 'Mar', den: 4800, urban: 4400 },
  { month: 'Apr', den: 5100, urban: 4700 },
  { month: 'May', den: 5400, urban: 5000 },
  { month: 'Jun', den: 5800, urban: 5400 },
];

const monthlyCutsData = [
  { month: 'Jan', den: 120, urban: 110 },
  { month: 'Feb', den: 145, urban: 125 },
  { month: 'Mar', den: 160, urban: 140 },
  { month: 'Apr', den: 175, urban: 165 },
  { month: 'May', den: 190, urban: 180 },
  { month: 'Jun', den: 210, urban: 195 },
];

const yearToDateComparisonData = [
  { metric: 'Revenue', den: 28800, urban: 25200 },
  { metric: 'Clients', den: 840, urban: 780 },
  { metric: 'Wait Time', den: 14, urban: 16 },
  { metric: 'Rating', den: 4.8, urban: 4.6 },
];

export function AnalyticsPanel({ barberId, mode = 'professional' }: { barberId: string; mode?: 'professional' | 'enterprise' }) {
  const { toast } = useToast();
  const [activeShop, setActiveShop] = useState<'both' | 'den' | 'urban'>('both');
  const [realStats, setRealStats] = useState(analyticsStore.getRealTimeStats(barberId));
  const [managerStats, setManagerStats] = useState(analyticsStore.getManagerStats(activeShop === 'both' ? undefined : (activeShop === 'den' ? "Gentleman's Den" : "Urban Cuts")));

  useEffect(() => {
    const updateStats = () => {
      setRealStats(analyticsStore.getRealTimeStats(barberId));
      const targetShop = activeShop === 'both' ? undefined : (activeShop === 'den' ? "Gentleman's Den" : "Urban Cuts");
      setManagerStats(analyticsStore.getManagerStats(targetShop));
    };
    
    // Initial update when activeShop changes
    updateStats();
    
    // Subscribe to future changes
    return bookingStore.subscribe(updateStats);
  }, [barberId, activeShop]);

  const StatCard = ({ icon: Icon, label, value, change, positive, description, period }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-white/5 rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded",
              positive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </div>
          )}
          {period && <span className="text-[9px] text-muted-foreground/60 uppercase font-medium">{period}</span>}
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help inline-block">
              <p className="text-2xl font-heading font-bold flex items-center gap-2 group">
                {label.toLowerCase().includes('revenue') ? `R ${value.replace('$', '')}` : value}
                <Info className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px] text-xs p-3">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );

  if (mode === 'professional') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Your personal performance metrics</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard 
            icon={Scissors} 
            label="Cuts Today" 
            value={realStats.cutsToday.toString()} 
            change="+100%" 
            positive 
            period="Real-time"
            description="Total number of completed haircuts today from actual bookings."
          />
          <StatCard 
            icon={Users} 
            label="Total Clients (Month)" 
            value={realStats.cutsThisMonth.toString()} 
            change="Live" 
            positive 
            period="Current Month"
            description="Total number of real client visits served during the current calendar month."
          />
          <StatCard 
            icon={DollarSign} 
            label="Estimated Revenue" 
            value={`R ${realStats.totalRevenue}`} 
            change="Live" 
            positive 
            period="Total"
            description="Estimated revenue based on completed bookings (calculated at R250 per service)."
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completion Rate" 
            value={`${realStats.completionRate}%`} 
            change="Live" 
            positive 
            period="Overall"
            description="Actual percentage of your bookings that resulted in a completed service."
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-white/5 rounded-xl p-6">
            <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Performance
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 bg-primary" />
                  <span className="text-foreground">Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 bg-white/20 border-t border-dashed" />
                  <span className="text-muted-foreground">Previous</span>
                </div>
              </div>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realStats.weeklyData || weeklyData}>
                  <defs>
                    <linearGradient id="colorPersonal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="previous" stroke="#ffffff33" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="current" stroke="#f97316" fill="url(#colorPersonal)" strokeWidth={2} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a1a' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-xl p-6">
            <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                Service Breakdown
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Weekly</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={realStats.serviceData?.length ? realStats.serviceData : serviceBreakdownWeekly} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(realStats.serviceData?.length ? realStats.serviceData : serviceBreakdownWeekly).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6 mb-8">
          <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              Service Breakdown
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly</span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={realStats.serviceData?.length ? realStats.serviceData : serviceBreakdownMonthly} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {(realStats.serviceData?.length ? realStats.serviceData : serviceBreakdownMonthly).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-white/5 rounded-xl p-6">
            <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Peak Hours
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Weekly</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realStats.peakHours?.length ? realStats.peakHours : peakHoursWeekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="hour" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                  <Bar dataKey="clients" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-xl p-6">
            <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Peak Hours
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realStats.peakHours?.length ? realStats.peakHours : peakHoursMonthly}>
                  <defs>
                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="hour" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8_px' }} />
                  <Area type="monotone" dataKey="clients" stroke="#22c55e" fill="url(#colorPeak)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6 mb-8">
          <h3 className="font-heading font-bold mb-4 flex items-center justify-center py-4 flex-col gap-2">
            <div className="p-4 bg-green-500/10 rounded-full">
              <Clock className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-xl font-bold">Your Peak: 2:00 PM - 5:00 PM</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">High demand period based on your last 30 days</p>
          </h3>
        </div>
      </div>
    );
  }

  const enterpriseWeeklyData = [
    { day: 'Mon', den: 420, urban: 380, denPrev: 390, urbanPrev: 350 },
    { day: 'Tue', den: 450, urban: 410, denPrev: 430, urbanPrev: 380 },
    { day: 'Wed', den: 480, urban: 440, denPrev: 460, urbanPrev: 410 },
    { day: 'Thu', den: 510, urban: 470, denPrev: 490, urbanPrev: 430 },
    { day: 'Fri', den: 650, urban: 610, denPrev: 580, urbanPrev: 540 },
    { day: 'Sat', den: 850, urban: 790, denPrev: 750, urbanPrev: 700 },
    { day: 'Sun', den: 540, urban: 500, denPrev: 510, urbanPrev: 460 },
  ];

  const enterpriseWeeklyCutsData = [
    { day: 'Mon', den: 6, urban: 5, denPrev: 5, urbanPrev: 4 },
    { day: 'Tue', den: 9, urban: 7, denPrev: 8, urbanPrev: 6 },
    { day: 'Wed', den: 8, urban: 6, denPrev: 7, urbanPrev: 5 },
    { day: 'Thu', den: 11, urban: 9, denPrev: 10, urbanPrev: 8 },
    { day: 'Fri', den: 14, urban: 12, denPrev: 13, urbanPrev: 10 },
    { day: 'Sat', den: 18, urban: 15, denPrev: 16, urbanPrev: 14 },
    { day: 'Sun', den: 5, urban: 4, denPrev: 6, urbanPrev: 5 },
  ];

  const barberPerformanceData = {
    den: {
      week: { highest: { name: 'Jax', cuts: 42 }, lowest: { name: 'Marco', cuts: 28 }, average: 34 },
      month: { highest: { name: 'Jax', cuts: 168 }, lowest: { name: 'Marco', cuts: 112 }, average: 135 },
      retention: { rate: 68, newClients: { week: 12, month: 45 }, repeatingClients: 82 },
      bookingFillRate: { week: 78, month: 82 },
      barbers: [
        { name: 'Jax', week: 42, month: 168, bookingRate: 84 },
        { name: 'Marco', week: 28, month: 112, bookingRate: 56 },
        { name: 'Zane', week: 32, month: 125, bookingRate: 64 }
      ],
      reviews: {
        highest: [
          { client: "Leo", rating: 5, comment: "Jax is a master! Best fade I've had in years. The shop vibes are unmatched.", date: "2 days ago" },
          { client: "Sarah", rating: 5, comment: "Quick, professional, and exactly what I asked for. The queue system is a lifesaver.", date: "4 days ago" }
        ],
        lowest: [
          { client: "Mike", rating: 2, comment: "Wait time was still 15 mins even after I checked in as arrived. Cut was okay but service was slow.", date: "1 week ago" }
        ]
      }
    },
    urban: {
      week: { highest: { name: 'Elena', cuts: 38 }, lowest: { name: 'Greys', cuts: 24 }, average: 31 },
      month: { highest: { name: 'Elena', cuts: 152 }, lowest: { name: 'Greys', cuts: 98 }, average: 124 },
      retention: { rate: 54, newClients: { week: 18, month: 62 }, repeatingClients: 58 },
      bookingFillRate: { week: 65, month: 70 },
      barbers: [
        { name: 'Elena', week: 38, month: 152, bookingRate: 76 },
        { name: 'Greys', week: 24, month: 98, bookingRate: 48 },
        { name: 'Kael', week: 31, month: 122, bookingRate: 62 }
      ],
      reviews: {
        highest: [
          { client: "David", rating: 5, comment: "Elena has incredible attention to detail. Urban Cuts is my new go-to.", date: "1 day ago" }
        ],
        lowest: [
          { client: "Chris", rating: 3, comment: "The cut was great but the shop was a bit loud and crowded. Hard to relax.", date: "5 days ago" }
        ]
      }
    },
    both: {
      week: { highest: { name: 'Jax', cuts: 42 }, lowest: { name: 'Greys', cuts: 24 }, average: 32.5 },
      month: { highest: { name: 'Jax', cuts: 168 }, lowest: { name: 'Greys', cuts: 98 }, average: 129.5 },
      retention: { rate: 61, newClients: { week: 30, month: 107 }, repeatingClients: 140 },
      bookingFillRate: { week: 72, month: 76 },
      barbers: [
        { name: 'Jax', week: 42, month: 168, bookingRate: 84 },
        { name: 'Elena', week: 38, month: 152, bookingRate: 76 },
        { name: 'Marco', week: 28, month: 112, bookingRate: 56 },
        { name: 'Greys', week: 24, month: 98, bookingRate: 48 }
      ],
      reviews: {
        highest: [
          { client: "Leo", rating: 5, comment: "Jax is a master! Best fade I've had in years.", date: "2 days ago" },
          { client: "David", rating: 5, comment: "Elena has incredible attention to detail.", date: "1 day ago" }
        ],
        lowest: [
          { client: "Mike", rating: 2, comment: "Wait time was still 15 mins even after check-in.", date: "1 week ago" }
        ]
      }
    }
  };

  const PerformanceSection = ({ title, data }: { title: string, data: any }) => (
    <div className="space-y-6">
      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-primary">
          <Users className="w-5 h-5" />
          {title}
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Weekly Highest</p>
              <p className="text-lg font-bold text-primary">{data.week.highest.name}</p>
              <p className="text-xs text-muted-foreground">{data.week.highest.cuts} cuts</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Weekly Lowest</p>
              <p className="text-lg font-bold text-orange-400">{data.week.lowest.name}</p>
              <p className="text-xs text-muted-foreground">{data.week.lowest.cuts} cuts</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Monthly Highest</p>
              <p className="text-lg font-bold text-primary">{data.month.highest.name}</p>
              <p className="text-xs text-muted-foreground">{data.month.highest.cuts} cuts</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Monthly Lowest</p>
              <p className="text-lg font-bold text-orange-400">{data.month.lowest.name}</p>
              <p className="text-xs text-muted-foreground">{data.month.lowest.cuts} cuts</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Shop Average (Weekly)</p>
              <p className="text-xl font-bold">{data.week.average} cuts</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Shop Average (Monthly)</p>
              <p className="text-xl font-bold">{data.month.average} cuts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-primary">
            <Activity className="w-5 h-5" />
            Individual Barber Tracking
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Barber</th>
                  <th className="pb-3 font-medium text-center">Weekly Cuts</th>
                  <th className="pb-3 font-medium text-center">Monthly Cuts</th>
                  <th className="pb-3 font-medium text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.barbers.map((barber: any) => {
                  const isAboveAverage = barber.week >= data.week.average;
                  return (
                    <tr key={barber.name} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 text-sm font-medium">{barber.name}</td>
                      <td className="py-4 text-sm text-center font-mono">{barber.week}</td>
                      <td className="py-4 text-sm text-center font-mono">{barber.month}</td>
                      <td className="py-4 text-right">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full",
                          isAboveAverage 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        )}>
                          {isAboveAverage ? "ABOVE AVG" : "BELOW AVG"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-amber-400">
            <Star className="w-5 h-5" />
            Featured Client Reviews
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-green-500 font-bold mb-3 flex items-center gap-2">
                <ArrowUpRight className="w-3 h-3" /> Top Rated
              </p>
              <div className="space-y-4">
                {data.reviews.highest.map((review: any, i: number) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{review.client}</span>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mb-3 flex items-center gap-2">
                <ArrowDownRight className="w-3 h-3" /> Critical Feedback
              </p>
              <div className="space-y-4">
                {data.reviews.lowest.map((review: any, i: number) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{review.client}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={cn("w-3 h-3", j < review.rating ? "fill-amber-400 text-amber-400" : "text-white/10")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enterprise / Manager View
  const shopPerformance = (barberPerformanceData as any)[activeShop];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2 text-primary">
            <Crown className="w-6 h-6" />
            Manager Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Consolidated business performance across all locations</p>
        </div>
        
        <Tabs value={activeShop} onValueChange={(v: any) => setActiveShop(v)} className="w-full md:w-auto">
          <TabsList className="bg-white/5 border border-white/5">
            <TabsTrigger value="both" className="gap-2"><Layers className="w-3.5 h-3.5" /> Both Shops</TabsTrigger>
            <TabsTrigger value="den" className="gap-2"><Store className="w-3.5 h-3.5" /> Gentleman's Den</TabsTrigger>
            <TabsTrigger value="urban" className="gap-2"><Store className="w-3.5 h-3.5" /> Urban Cuts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={managerStats.totalRevenue.toLocaleString()} 
          change="+15%" positive 
          period="vs last month"
          description="Consolidated revenue from all services across selected locations, compared to the previous month's total."
        />
        <StatCard 
          icon={Users} 
          label="Total Clients" 
          value={managerStats.totalClients.toLocaleString()} 
          change="+8%" positive 
          period="vs last month"
          description="Total number of client visits served across selected locations, showing growth trends month-over-month."
        />
        <StatCard 
          icon={Clock} 
          label="Avg Wait Time" 
          value={`${managerStats.avgWaitTime}m`} 
          change="-5%" positive 
          period="vs last week"
          description="The combined average wait time for all barbers at selected shops. A key indicator of shop efficiency."
        />
        <StatCard 
          icon={Award} 
          label="Shop Rating" 
          value={managerStats.rating.toString()} 
          change="+0.2" positive 
          period="vs last month"
          description="Weighted average of all client feedback ratings received for services at selected locations."
        />
      </div>

      <PerformanceSection 
        title={activeShop === 'both' ? 'Network Performance' : `${activeShop === 'den' ? "Gentleman's Den" : "Urban Cuts"} Barber Performance`}
        data={shopPerformance}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            {activeShop === 'both' ? 'Network Capacity (Weekly)' : 'Booking Distribution (Weekly)'}
          </h3>
          <div className="space-y-4">
            {activeShop === 'both' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-primary/70 mb-1">Total Slots Filled</p>
                    <p className="text-2xl font-bold">
                      {managerStats.totalClients}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Available</p>
                    <p className="text-2xl font-bold">
                      {shopPerformance.barbers.length * 50}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span>Overall Capacity</span>
                    <span>{Math.round((managerStats.totalClients / (shopPerformance.barbers.length * 50)) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${(managerStats.totalClients / (shopPerformance.barbers.length * 50)) * 100}%` }} 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">
                  *Aggregate data across all locations. Switch to a specific shop to see individual barber metrics.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-green-500/70 mb-1">Highest Booked</p>
                    <p className="text-lg font-bold text-green-500">{shopPerformance.barbers[0].name}</p>
                    <p className="text-xs text-muted-foreground">{shopPerformance.barbers[0].week} slots filled</p>
                  </div>
                  <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-orange-500/70 mb-1">Lowest Booked</p>
                    <p className="text-lg font-bold text-orange-400">{shopPerformance.barbers[shopPerformance.barbers.length - 1].name}</p>
                    <p className="text-xs text-muted-foreground">{shopPerformance.barbers[shopPerformance.barbers.length - 1].week} slots filled</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slots Filled per Barber</p>
                  {shopPerformance.barbers.map((barber: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{barber.name}</span>
                        <span className="text-muted-foreground">{barber.week} / 50 slots</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${(barber.week / 50) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-green-500">
            <Users className="w-5 h-5" />
            Client Retention & Growth
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retention Rate</span>
              <span className="font-bold text-lg text-green-500">{shopPerformance.retention.rate}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-1000" 
                style={{ width: `${shopPerformance.retention.rate}%` }} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">New Clients (Week)</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{shopPerformance.retention.newClients.week}</span>
                  <div className="bg-green-500/10 text-green-500 p-1 rounded">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">New Clients (Month)</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{shopPerformance.retention.newClients.month}</span>
                  <div className="bg-green-500/10 text-green-500 p-1 rounded">
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Repeating Clients</p>
                <p className="text-sm text-muted-foreground">Active loyal customer base</p>
              </div>
              <p className="text-2xl font-bold text-primary">{shopPerformance.retention.repeatingClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-purple-400">
            <Target className="w-5 h-5" />
            Growth Opportunities
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between w-full cursor-help">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold flex items-center gap-1">
                            Referral Potential
                            <Info className="w-2.5 h-2.5 opacity-50" />
                          </p>
                          <p className="text-xs text-muted-foreground">High among loyal clients</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-400">8.4 / 10</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-xs p-3">
                    <p className="font-bold mb-1">How it's calculated:</p>
                    <p>Analyzes your most loyal clients (3+ visits) who have given 5-star ratings. A high score suggests these clients are perfect candidates for a referral program to bring in new business.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Churn Risk</p>
                  <p className="text-xs text-muted-foreground">Clients not seen in 45 days</p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-400">{activeShop === 'den' ? '12' : '18'} clients</span>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground">Retention insight:</p>
              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg text-xs text-green-500 leading-relaxed">
                {activeShop === 'den' 
                  ? "Gentleman's Den has a high retention rate (68%). Consider a loyalty program to convert the remaining 32% of single-visit clients."
                  : "Urban Cuts is seeing rapid growth in new clients (62 this month). Focus on staff capacity to maintain service quality."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-heading font-bold mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Weekly Performance
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Consolidated</span>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={managerStats.weeklyData}>
              <defs>
                <linearGradient id="colorEnterprise" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#colorEnterprise)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-primary">
            <Scissors className="w-5 h-5" />
            Service Quality Ratings
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Haircut Quality</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("w-4 h-4", star <= 4.8 ? "fill-amber-400 text-amber-400" : "text-white/10")} />
                  ))}
                </div>
                <span className="font-bold">4.8</span>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '96%' }} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">5 Stars</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">88%</span>
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">4 Stars</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">9%</span>
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2 text-blue-500">
            <Clock className="w-5 h-5" />
            Queue Management Ratings
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Queue Experience</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("w-4 h-4", star <= 4.6 ? "fill-blue-500 text-blue-500" : "text-white/10")} />
                  ))}
                </div>
                <span className="font-bold">4.6</span>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '92%' }} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Wait Time Score</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">94%</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          App Accuracy
                          <Info className="w-2.5 h-2.5 opacity-50" />
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">89%</span>
                          <ArrowDownRight className="w-3 h-3 text-orange-400" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs p-3">
                      <p className="font-bold mb-1">How it's calculated:</p>
                      <p>Measures how closely the "Ready" notifications matched the actual start time of the cut. 89% means most clients were in the chair within 3-5 minutes of their app notification.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                          Booking Fill Rate
                          <Info className="w-2.5 h-2.5 opacity-50" />
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">{shopPerformance.bookingFillRate.week}%</span>
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs p-3">
                      <p className="font-bold mb-1">How it's calculated:</p>
                      <p>Percentage of total available working slots that were successfully booked. High fill rates indicate efficient scheduling and high demand.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Revenue Comparison
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-primary" />
                <span className="text-foreground">Current Week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-white/20 border-t border-dashed" />
                <span className="text-muted-foreground">Previous Week</span>
              </div>
            </div>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enterpriseWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(value) => `R ${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [`R ${value}`, "Revenue"]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={activeShop === 'both' ? (d => d.denPrev + d.urbanPrev) : activeShop === 'den' ? 'denPrev' : 'urbanPrev'} 
                  name="Previous Week" 
                  stroke="#ffffff33" 
                  strokeDasharray="5 5" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey={activeShop === 'both' ? (d => d.den + d.urban) : activeShop === 'den' ? 'den' : 'urban'} 
                  name="Current Week" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a1a' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-blue-500" />
              Weekly Cuts Comparison
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-blue-500" />
                <span className="text-foreground">Current Week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-white/20 border-t border-dashed" />
                <span className="text-muted-foreground">Previous Week</span>
              </div>
            </div>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enterpriseWeeklyCutsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [value, "Cuts"]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={activeShop === 'both' ? (d => d.denPrev + d.urbanPrev) : activeShop === 'den' ? 'denPrev' : 'urbanPrev'} 
                  name="Previous Week" 
                  stroke="#ffffff33" 
                  strokeDasharray="5 5" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey={activeShop === 'both' ? (d => d.den + d.urban) : activeShop === 'den' ? 'den' : 'urban'} 
                  name="Current Week" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1a1a1a' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Shop Performance {activeShop === 'both' ? '(Year to Date)' : activeShop === 'den' ? '- Gentleman\'s Den (YTD)' : '- Urban Cuts (YTD)'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearToDateComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="metric" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value: any, name: string, props: any) => {
                    if (props.payload.metric === 'Revenue') return [`R ${value.toLocaleString()}`, name];
                    if (props.payload.metric === 'Wait Time') return [`${value}m`, name];
                    if (props.payload.metric === 'Rating') return [`★ ${value}`, name];
                    return [value.toLocaleString(), name];
                  }}
                />
                <Legend />
                {(activeShop === 'both' || activeShop === 'den') && (
                  <Bar dataKey="den" name="Gentleman's Den" fill="#f97316" radius={[4, 4, 0, 0]} />
                )}
                {(activeShop === 'both' || activeShop === 'urban') && (
                  <Bar dataKey="urban" name="Urban Cuts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Performance {activeShop === 'both' ? '(Total Cuts)' : activeShop === 'den' ? "- Gentleman's Den" : "- Urban Cuts"}
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
              {(activeShop === 'both' || activeShop === 'den') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#f97316] rounded-sm" />
                  <span className="text-foreground">Gentleman's Den</span>
                </div>
              )}
              {(activeShop === 'both' || activeShop === 'urban') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-sm" />
                  <span className="text-foreground">Urban Cuts</span>
                </div>
              )}
            </div>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCutsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [value, "Cuts"]}
                />
                <Legend />
                {(activeShop === 'both' || activeShop === 'den') && (
                  <Bar dataKey="den" name="Gentleman's Den" fill="#f97316" radius={[4, 4, 0, 0]} />
                )}
                {(activeShop === 'both' || activeShop === 'urban') && (
                  <Bar dataKey="urban" name="Urban Cuts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-heading font-bold mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Revenue Comparison {activeShop === 'both' ? '(Aggregate)' : activeShop === 'den' ? "- Gentleman's Den" : "- Urban Cuts"}
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
            {(activeShop === 'both' || activeShop === 'den') && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-[#f97316]" />
                <span className="text-foreground">Gentleman's Den</span>
              </div>
            )}
            {(activeShop === 'both' || activeShop === 'urban') && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 bg-[#3b82f6]" />
                <span className="text-foreground">Urban Cuts</span>
              </div>
            )}
          </div>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyComparisonData}>
              <defs>
                <linearGradient id="colorMonthlyDen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMonthlyUrban" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="month" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: any) => [`R ${value}`, "Revenue"]}
              />
              {(activeShop === 'both' || activeShop === 'den') && (
                <Area type="monotone" dataKey="den" name="Gentleman's Den" stroke="#f97316" fill="url(#colorMonthlyDen)" strokeWidth={2} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a1a' }} isAnimationActive={false} />
              )}
              {(activeShop === 'both' || activeShop === 'urban') && (
                <Area type="monotone" dataKey="urban" name="Urban Cuts" stroke="#3b82f6" fill="url(#colorMonthlyUrban)" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1a1a1a' }} isAnimationActive={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
