import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, DollarSign, Clock, Calendar,
  Lock, Crown, Zap, Star, Target, PieChart, Activity, Award,
  ArrowUpRight, ArrowDownRight, Scissors, CheckCircle, Store, Layers,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyticsStore, AnalyticsTier } from "@/lib/analytics-store";
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
  { day: 'Mon', current: 8, previous: 7, shop1: 45, shop2: 38 },
  { day: 'Tue', current: 12, previous: 14, shop1: 52, shop2: 48 },
  { day: 'Wed', current: 10, previous: 9, shop1: 48, shop2: 55 },
  { day: 'Thu', current: 15, previous: 13, shop1: 61, shop2: 59 },
  { day: 'Fri', current: 18, previous: 16, shop1: 75, shop2: 82 },
  { day: 'Sat', current: 22, previous: 20, shop1: 88, shop2: 95 },
  { day: 'Sun', current: 6, previous: 8, shop1: 30, shop2: 25 },
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

export function AnalyticsPanel({ barberId, mode = 'professional' }: { barberId: string; mode?: 'professional' | 'enterprise' }) {
  const { toast } = useToast();
  const [activeShop, setActiveShop] = useState<'both' | 'den' | 'urban'>('both');

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
                {value}
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
            value="8" 
            change="+12%" 
            positive 
            period="vs yesterday"
            description="Total number of completed haircuts today compared to your performance at this time yesterday."
          />
          <StatCard 
            icon={Users} 
            label="Total Clients (Month)" 
            value="91" 
            change="+23%" 
            positive 
            period="vs last month"
            description="Total number of client visits served during the current calendar month compared to the same period last month."
          />
          <StatCard 
            icon={Clock} 
            label="Avg Wait Time" 
            value="12m" 
            change="-8%" 
            positive 
            period="vs last week"
            description="The average time clients spent in the queue before their service started. Lower is better."
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completion Rate" 
            value="96%" 
            change="+2%" 
            positive 
            period="vs last week"
            description="Percentage of bookings that resulted in a completed service rather than a no-show or cancellation."
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
                <AreaChart data={weeklyData}>
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
                  <Pie data={serviceBreakdownWeekly} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {serviceBreakdownWeekly.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
                <Pie data={serviceBreakdownMonthly} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {serviceBreakdownMonthly.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Peak Hours
          </h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-4 bg-green-500/10 rounded-full mb-4">
              <Clock className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-xl font-bold">Your Peak: 2:00 PM - 5:00 PM</p>
            <p className="text-sm text-muted-foreground mt-1">High demand period based on your last 30 days</p>
          </div>
        </div>
      </div>
    );
  }

  // Enterprise / Manager View
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
          value={activeShop === 'both' ? "$8,000" : activeShop === 'den' ? "$4,200" : "$3,800"} 
          change="+15%" positive 
          period="vs last month"
          description="Consolidated revenue from all services across selected locations, compared to the previous month's total."
        />
        <StatCard 
          icon={Users} 
          label="Total Clients" 
          value={activeShop === 'both' ? "230" : activeShop === 'den' ? "120" : "110"} 
          change="+8%" positive 
          period="vs last month"
          description="Total number of client visits served across selected locations, showing growth trends month-over-month."
        />
        <StatCard 
          icon={Clock} 
          label="Avg Wait Time" 
          value={activeShop === 'both' ? "13.5m" : activeShop === 'den' ? "12m" : "15m"} 
          change="-5%" positive 
          period="vs last week"
          description="The combined average wait time for all barbers at selected shops. A key indicator of shop efficiency."
        />
        <StatCard 
          icon={Award} 
          label="Shop Rating" 
          value={activeShop === 'both' ? "4.7" : activeShop === 'den' ? "4.8" : "4.6"} 
          change="+0.2" positive 
          period="vs last month"
          description="Weighted average of all client feedback ratings received for services at selected locations."
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Barber Performance Ratings
          </h3>
          <div className="space-y-4">
            {[
              { name: "Jax", shop: "Gentleman's Den", cutQuality: 4.9, queueMgmt: 4.8, total: 4.85 },
              { name: "Leo", shop: "Urban Cuts", cutQuality: 4.7, queueMgmt: 4.9, total: 4.8 },
              { name: "Sam", shop: "Gentleman's Den", cutQuality: 4.6, queueMgmt: 4.5, total: 4.55 },
              { name: "Marcus", shop: "Urban Cuts", cutQuality: 4.5, queueMgmt: 4.4, total: 4.45 },
            ].map((barber, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-bold">{barber.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{barber.shop}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Cut Quality</p>
                    <p className="text-sm font-bold text-primary">★ {barber.cutQuality}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Queue Mgmt</p>
                    <p className="text-sm font-bold text-blue-500">★ {barber.queueMgmt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Critical Feedback (Below 3★)
          </h3>
          <div className="space-y-4">
            {[
              { client: "Robert M.", barber: "Sam", rating: 2, reason: "Queue Management", comment: "Wait was 30 mins longer than app said.", date: "2 days ago" },
              { client: "Kevin L.", barber: "Marcus", rating: 1, reason: "Cut Quality", comment: "Uneven sideburns, had to fix at home.", date: "3 days ago" },
            ].map((review, i) => (
              <div key={i} className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-red-500">{review.client}</p>
                    <p className="text-[10px] text-muted-foreground">Barber: {review.barber} • <span className="text-red-400">{review.reason}</span></p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-red-500 fill-red-500" : "text-white/20")} />
                    ))}
                  </div>
                </div>
                <p className="text-xs italic text-muted-foreground">"{review.comment}"</p>
                <p className="text-[9px] text-right text-muted-foreground/50">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Revenue Comparison (Shop vs Shop)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shopComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="metric" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="den" name="Gentleman's Den" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="urban" name="Urban Cuts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Recent Client Feedback
          </h3>
          <div className="space-y-4">
            {[
              { client: "Michael R.", barber: "Jax", rating: 5, comment: "Best fade I've ever had. Highly recommend!", date: "2 hours ago" },
              { client: "Sarah W.", barber: "Leo", rating: 4, comment: "Great service, very professional.", date: "5 hours ago" },
              { client: "David K.", barber: "Jax", rating: 5, comment: "Exactly what I asked for. Perfect!", date: "1 day ago" },
              { client: "James T.", barber: "Marcus", rating: 5, comment: "Quick and sharp. I'll be back.", date: "1 day ago" },
            ].map((review, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold">{review.client}</p>
                    <p className="text-[10px] text-muted-foreground">Barber: {review.barber}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-white/20")} />
                    ))}
                  </div>
                </div>
                <p className="text-xs italic text-muted-foreground">"{review.comment}"</p>
                <p className="text-[9px] text-right text-muted-foreground/50">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Aggregate Performance (All Shops)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorShop1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorShop2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="shop1" name="Gentleman's Den" stroke="#f97316" fill="url(#colorShop1)" strokeWidth={2} />
              <Area type="monotone" dataKey="shop2" name="Urban Cuts" stroke="#3b82f6" fill="url(#colorShop2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
