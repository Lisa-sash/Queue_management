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
  { day: 'Mon', current: 8, previous: 7, den: 420, urban: 380 },
  { day: 'Tue', current: 12, previous: 14, den: 450, urban: 410 },
  { day: 'Wed', current: 10, previous: 9, den: 480, urban: 440 },
  { day: 'Thu', current: 15, previous: 13, den: 510, urban: 470 },
  { day: 'Fri', current: 18, previous: 16, den: 650, urban: 610 },
  { day: 'Sat', current: 22, previous: 20, den: 850, urban: 790 },
  { day: 'Sun', current: 6, previous: 8, den: 540, urban: 500 },
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
                <BarChart data={peakHoursWeekly}>
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
                <AreaChart data={peakHoursMonthly}>
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
          value={activeShop === 'both' ? "8,000" : activeShop === 'den' ? "4,200" : "3,800"} 
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
            ].filter(b => activeShop === 'both' || (activeShop === 'den' && b.shop === "Gentleman's Den") || (activeShop === 'urban' && b.shop === "Urban Cuts")).map((barber, i) => (
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
              { client: "Robert M.", barber: "Sam", rating: 2, reason: "Queue Management", comment: "Wait was 30 mins longer than app said.", date: "2 days ago", shop: "Gentleman's Den" },
              { client: "Kevin L.", barber: "Marcus", rating: 1, reason: "Cut Quality", comment: "Uneven sideburns, had to fix at home.", date: "3 days ago", shop: "Urban Cuts" },
            ].filter(r => activeShop === 'both' || (activeShop === 'den' && r.shop === "Gentleman's Den") || (activeShop === 'urban' && r.shop === "Urban Cuts")).map((review, i) => (
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

      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6 mb-8">
        <h3 className="font-heading font-bold mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Weekly Revenue Comparison {activeShop === 'both' ? '(Aggregate)' : activeShop === 'den' ? "- Gentleman's Den" : "- Urban Cuts"}
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
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorWeeklyDen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWeeklyUrban" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: any) => [`R ${value}`, "Revenue"]}
              />
              {(activeShop === 'both' || activeShop === 'den') && (
                <Area type="monotone" dataKey="den" name="Gentleman's Den" stroke="#f97316" fill="url(#colorWeeklyDen)" strokeWidth={2} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a1a' }} />
              )}
              {(activeShop === 'both' || activeShop === 'urban') && (
                <Area type="monotone" dataKey="urban" name="Urban Cuts" stroke="#3b82f6" fill="url(#colorWeeklyUrban)" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1a1a1a' }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6 mb-8">
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
                <Area type="monotone" dataKey="den" name="Gentleman's Den" stroke="#f97316" fill="url(#colorMonthlyDen)" strokeWidth={2} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a1a' }} />
              )}
              {(activeShop === 'both' || activeShop === 'urban') && (
                <Area type="monotone" dataKey="urban" name="Urban Cuts" stroke="#3b82f6" fill="url(#colorMonthlyUrban)" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1a1a1a' }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6 mb-8">
        <h3 className="font-heading font-bold mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Performance {activeShop === 'both' ? '(Total Cuts)' : activeShop === 'den' ? "- Gentleman's Den" : "- Urban Cuts"}
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
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="day" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
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
  );
}
