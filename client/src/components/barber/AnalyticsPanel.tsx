import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, DollarSign, Clock, Calendar,
  Lock, Crown, Zap, Star, Target, PieChart, Activity, Award,
  ArrowUpRight, ArrowDownRight, Scissors, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyticsStore, AnalyticsTier } from "@/lib/analytics-store";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from "recharts";

interface AnalyticsPanelProps {
  barberId: string;
}

const weeklyData = [
  { day: 'Mon', clients: 8, revenue: 240 },
  { day: 'Tue', clients: 12, revenue: 360 },
  { day: 'Wed', clients: 10, revenue: 300 },
  { day: 'Thu', clients: 15, revenue: 450 },
  { day: 'Fri', clients: 18, revenue: 540 },
  { day: 'Sat', clients: 22, revenue: 660 },
  { day: 'Sun', clients: 6, revenue: 180 },
];

const monthlyData = [
  { week: 'Week 1', clients: 45, revenue: 1350 },
  { week: 'Week 2', clients: 52, revenue: 1560 },
  { week: 'Week 3', clients: 48, revenue: 1440 },
  { week: 'Week 4', clients: 61, revenue: 1830 },
];

const serviceBreakdown = [
  { name: 'Classic Cut', value: 35, color: '#f97316' },
  { name: 'Fade', value: 28, color: '#3b82f6' },
  { name: 'Beard Trim', value: 18, color: '#22c55e' },
  { name: 'Hot Towel Shave', value: 12, color: '#a855f7' },
  { name: 'Kids Cut', value: 7, color: '#eab308' },
];

const hourlyTraffic = [
  { hour: '8am', traffic: 2 }, { hour: '9am', traffic: 4 }, { hour: '10am', traffic: 6 },
  { hour: '11am', traffic: 8 }, { hour: '12pm', traffic: 5 }, { hour: '1pm', traffic: 7 },
  { hour: '2pm', traffic: 9 }, { hour: '3pm', traffic: 11 }, { hour: '4pm', traffic: 12 },
  { hour: '5pm', traffic: 10 }, { hour: '6pm', traffic: 8 }, { hour: '7pm', traffic: 6 },
];

const clientRetention = [
  { month: 'Jan', new: 15, returning: 30 },
  { month: 'Feb', new: 12, returning: 35 },
  { month: 'Mar', new: 18, returning: 38 },
  { month: 'Apr', new: 14, returning: 42 },
];

export function AnalyticsPanel({ barberId }: AnalyticsPanelProps) {
  const { toast } = useToast();
  const [tier, setTier] = useState<AnalyticsTier>('basic');

  useEffect(() => {
    setTier(analyticsStore.getTier(barberId));
    return analyticsStore.subscribe(() => {
      setTier(analyticsStore.getTier(barberId));
    });
  }, [barberId]);

  const handleUpgrade = (newTier: AnalyticsTier) => {
    toast({
      title: "Upgrade Request Sent",
      description: `Contact the shop owner to unlock ${newTier} analytics.`,
    });
  };

  const StatCard = ({ icon: Icon, label, value, comparisons }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-white/5 rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {comparisons && comparisons.length === 1 && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded",
            comparisons[0].positive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {comparisons[0].positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {comparisons[0].change}
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {comparisons && comparisons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
          {comparisons.map((comp: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{comp.period}</span>
              <span className={cn(
                "flex items-center gap-1 font-bold",
                comp.positive ? "text-green-500" : "text-red-500"
              )}>
                {comp.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {comp.change}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const LockedOverlay = ({ tierRequired, price }: { tierRequired: string; price: string }) => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
      <Lock className="w-8 h-8 text-muted-foreground mb-3" />
      <p className="text-sm font-bold text-foreground mb-1">{tierRequired} Feature</p>
      <p className="text-xs text-muted-foreground mb-4">Upgrade to unlock</p>
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-primary to-orange-500"
        onClick={() => handleUpgrade(tierRequired.toLowerCase() as AnalyticsTier)}
      >
        <Crown className="w-4 h-4 mr-2" />
        Unlock for {price}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your performance and grow your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2">Preview:</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={tier === 'basic' ? 'default' : 'outline'}
              className={cn("text-xs h-7 px-2", tier === 'basic' && "bg-muted-foreground")}
              onClick={() => analyticsStore.upgradeTier(barberId, 'basic')}
            >
              <Zap className="w-3 h-3 mr-1" />
              Basic
            </Button>
            <Button
              size="sm"
              variant={tier === 'professional' ? 'default' : 'outline'}
              className={cn("text-xs h-7 px-2", tier === 'professional' && "bg-blue-500 hover:bg-blue-600")}
              onClick={() => analyticsStore.upgradeTier(barberId, 'professional')}
            >
              <Star className="w-3 h-3 mr-1" />
              Pro
            </Button>
            <Button
              size="sm"
              variant={tier === 'enterprise' ? 'default' : 'outline'}
              className={cn("text-xs h-7 px-2", tier === 'enterprise' && "bg-primary hover:bg-primary/90")}
              onClick={() => analyticsStore.upgradeTier(barberId, 'enterprise')}
            >
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard 
          icon={Scissors} 
          label="Cuts Today" 
          value="8" 
          comparisons={[
            { period: "vs yesterday", change: "+12%", positive: true },
            { period: "vs same day last week", change: "+3%", positive: true }
          ]} 
        />
        <StatCard 
          icon={Users} 
          label="Clients This Month" 
          value="91" 
          comparisons={[
            { period: "vs last month", change: "+23%", positive: true }
          ]} 
        />
        <StatCard 
          icon={Clock} 
          label="Avg Wait Time This Week" 
          value="12m" 
          comparisons={[
            { period: "vs last week", change: "-8%", positive: true }
          ]} 
        />
        <StatCard 
          icon={CheckCircle} 
          label="Completion Rate" 
          value="96%" 
          comparisons={[
            { period: "vs last week", change: "+2%", positive: true },
            { period: "vs last month", change: "+4%", positive: true }
          ]} 
        />
      </div>

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Weekly Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="clients" stroke="#f97316" fillOpacity={1} fill="url(#colorClients)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative">
        <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier === 'basic' && "overflow-hidden")}>
          {tier === 'basic' && <LockedOverlay tierRequired="Professional" price="$9.99/mo" />}
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-500" />
            Service Breakdown
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {serviceBreakdown.map((service) => (
              <div key={service.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: service.color }} />
                <span className="text-muted-foreground">{service.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier === 'basic' && "overflow-hidden")}>
          {tier === 'basic' && <LockedOverlay tierRequired="Professional" price="$9.99/mo" />}
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Peak Hours Analysis
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="traffic" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier !== 'enterprise' && "overflow-hidden")}>
        {tier !== 'enterprise' && <LockedOverlay tierRequired="Enterprise" price="$24.99/mo" />}
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Client Retention & Growth
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientRetention}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Bar dataKey="new" name="New Clients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returning" name="Returning" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier !== 'enterprise' && "overflow-hidden")}>
        {tier !== 'enterprise' && <LockedOverlay tierRequired="Enterprise" price="$24.99/mo" />}
        <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Advanced Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5">
            <p className="text-3xl font-heading font-bold text-primary">$4,230</p>
            <p className="text-xs text-muted-foreground mt-1">Monthly Revenue</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-green-500 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              +18% vs last month
            </div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5">
            <p className="text-3xl font-heading font-bold text-blue-500">73%</p>
            <p className="text-xs text-muted-foreground mt-1">Client Retention Rate</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-green-500 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              +5% vs last month
            </div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5">
            <p className="text-3xl font-heading font-bold text-purple-500">$28.50</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Ticket Value</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-green-500 text-xs">
              <ArrowUpRight className="w-3 h-3" />
              +$2.30 vs last month
            </div>
          </div>
        </div>
      </div>

      <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier !== 'enterprise' && "overflow-hidden")}>
        {tier !== 'enterprise' && <LockedOverlay tierRequired="Enterprise" price="$24.99/mo" />}
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Performance Benchmarks
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Client Satisfaction</span>
              <span className="font-bold text-green-500">92%</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">On-Time Starts</span>
              <span className="font-bold text-blue-500">88%</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Booking Fill Rate</span>
              <span className="font-bold text-purple-500">76%</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full" style={{ width: '76%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/20 to-orange-500/20 border border-primary/30 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Upgrade Your Analytics
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock deeper insights to grow your business faster
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-card/50 rounded-lg border border-white/10">
              <p className="text-xs text-muted-foreground">Professional</p>
              <p className="font-bold text-blue-500">$9.99/mo</p>
            </div>
            <div className="text-center px-4 py-2 bg-card/50 rounded-lg border border-primary/30">
              <p className="text-xs text-muted-foreground">Enterprise</p>
              <p className="font-bold text-primary">$24.99/mo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
