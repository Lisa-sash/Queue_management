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
  { day: 'Mon', clients: 8, lastWeek: 6 },
  { day: 'Tue', clients: 12, lastWeek: 10 },
  { day: 'Wed', clients: 10, lastWeek: 9 },
  { day: 'Thu', clients: 15, lastWeek: 12 },
  { day: 'Fri', clients: 18, lastWeek: 16 },
  { day: 'Sat', clients: 22, lastWeek: 19 },
  { day: 'Sun', clients: 6, lastWeek: 5 },
];

const serviceBreakdownMonthly = [
  { name: 'Classic Cut', value: 35, color: '#f97316' },
  { name: 'Fade', value: 28, color: '#3b82f6' },
  { name: 'Beard Trim', value: 18, color: '#22c55e' },
  { name: 'Hot Towel Shave', value: 12, color: '#a855f7' },
  { name: 'Kids Cut', value: 7, color: '#eab308' },
];

const clientRetention = [
  { month: 'Jan', new: 15, returning: 30 },
  { month: 'Feb', new: 12, returning: 35 },
  { month: 'Mar', new: 18, returning: 38 },
  { month: 'Apr', new: 14, returning: 42 },
];

export function AnalyticsPanel({ barberId, mode = 'full' }: { barberId: string; mode?: 'full' | 'professional' | 'enterprise' }) {
  const { toast } = useToast();
  const [tier, setTier] = useState<AnalyticsTier>('basic');

  useEffect(() => {
    if (mode === 'professional') setTier('professional');
    else if (mode === 'enterprise') setTier('enterprise');
    else {
      setTier(analyticsStore.getTier(barberId));
    }
    
    const unsubscribe = analyticsStore.subscribe(() => {
      if (mode === 'full') setTier(analyticsStore.getTier(barberId));
    });
    return unsubscribe;
  }, [barberId, mode]);

  const handleUpgrade = (newTier: AnalyticsTier) => {
    toast({
      title: "Upgrade Request Sent",
      description: `Contact the shop owner to unlock ${newTier} analytics.`,
    });
  };

  const StatCard = ({ icon: Icon, label, value, comparisons, tier: cardTier }: any) => {
    const isLocked = mode === 'full' && tier === 'basic' && cardTier !== 'basic';
    const isEnterpriseLocked = mode === 'full' && tier === 'professional' && cardTier === 'enterprise';

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-card border border-white/5 rounded-xl p-5 relative overflow-hidden",
          (isLocked || isEnterpriseLocked) && "opacity-90"
        )}
      >
        {(isLocked || isEnterpriseLocked) && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
            <Lock className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {cardTier} Required
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary text-[10px] h-auto p-0 mt-1"
              onClick={() => handleUpgrade(cardTier)}
            >
              Upgrade Now
            </Button>
          </div>
        )}
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
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {mode === 'professional' ? 'Professional Analytics' : mode === 'enterprise' ? 'Enterprise Analytics' : 'Analytics Dashboard'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'professional' ? 'Individual performance metrics' : mode === 'enterprise' ? 'Full shop performance insights' : 'Track your performance and grow your business'}
          </p>
        </div>
        {mode === 'full' && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Analytics Tier</span>
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
              <Button
                size="sm"
                variant={tier === 'basic' ? 'default' : 'ghost'}
                className={cn(
                  "text-xs h-8 px-4 transition-all", 
                  tier === 'basic' ? "bg-white/10 text-white shadow-lg" : "text-muted-foreground hover:text-white"
                )}
                onClick={() => analyticsStore.upgradeTier(barberId, 'basic')}
              >
                <Zap className="w-3 h-3 mr-2" />
                Basic
              </Button>
              <Button
                size="sm"
                variant={tier === 'professional' ? 'default' : 'ghost'}
                className={cn(
                  "text-xs h-8 px-4 transition-all", 
                  tier === 'professional' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-muted-foreground hover:text-blue-400"
                )}
                onClick={() => analyticsStore.upgradeTier(barberId, 'professional')}
              >
                <Star className="w-3 h-3 mr-2" />
                Professional
              </Button>
              <Button
                size="sm"
                variant={tier === 'enterprise' ? 'default' : 'ghost'}
                className={cn(
                  "text-xs h-8 px-4 transition-all", 
                  tier === 'enterprise' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary"
                )}
                onClick={() => analyticsStore.upgradeTier(barberId, 'enterprise')}
              >
                <Crown className="w-3 h-3 mr-2" />
                Enterprise
              </Button>
            </div>
          </div>
        )}
      </div>

      {(mode === 'full' || mode === 'professional') && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
              {mode === 'professional' ? 'Your Metrics' : 'Analytics'}
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <StatCard 
              icon={Scissors} 
              label="Cuts Today" 
              value="8" 
              tier="basic"
              comparisons={[
                { period: "vs yesterday", change: "+12%", positive: true },
                { period: "vs same day last week", change: "+3%", positive: true }
              ]} 
            />
            <StatCard 
              icon={Users} 
              label="Clients This Month" 
              value="91" 
              tier="basic"
              comparisons={[
                { period: "vs last month", change: "+23%", positive: true }
              ]} 
            />
            <StatCard 
              icon={Clock} 
              label="Avg Wait Time" 
              value="12m" 
              tier="basic"
              comparisons={[
                { period: "vs last week", change: "-8%", positive: true }
              ]} 
            />
            <StatCard 
              icon={CheckCircle} 
              label="Completion Rate" 
              value="96%" 
              tier="basic"
              comparisons={[
                { period: "vs last week", change: "+2%", positive: true }
              ]} 
            />
          </div>

          <div className="bg-card border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Weekly Performance
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Cuts completed per day</p>
              </div>
            </div>
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
                  />
                  <Area type="monotone" dataKey="clients" name="This Week" stroke="#f97316" fillOpacity={1} fill="url(#colorClients)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {(mode === 'full' || mode === 'professional') && (
        <div className="space-y-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2">
              <Star className="w-3 h-3" />
              Professional Analytics
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative">
            <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier === 'basic' && mode === 'full' && "overflow-hidden")}>
              {tier === 'basic' && mode === 'full' && <LockedOverlay tierRequired="Professional" price="$9.99/mo" />}
              <div className="mb-4">
                <h3 className="font-heading font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-500" />
                  Service Breakdown
                </h3>
                <p className="text-xs text-muted-foreground mt-1">This Month</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={serviceBreakdownMonthly}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {serviceBreakdownMonthly.map((entry, index) => (
                        <Cell key={`cell-monthly-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier === 'basic' && mode === 'full' && "overflow-hidden")}>
              {tier === 'basic' && mode === 'full' && <LockedOverlay tierRequired="Professional" price="$9.99/mo" />}
              <div className="mb-4">
                <h3 className="font-heading font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Peak Hour Insights
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Optimization data</p>
              </div>
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Peak Time: 3pm - 5pm</p>
                  <p className="text-xs text-muted-foreground">Recommend adding a walk-in during this window</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(mode === 'full' || mode === 'enterprise') && (
        <div className="space-y-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2">
              <Crown className="w-3 h-3" />
              Enterprise Analytics
            </h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative">
            <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier !== 'enterprise' && mode === 'full' && "overflow-hidden")}>
              {tier !== 'enterprise' && mode === 'full' && <LockedOverlay tierRequired="Enterprise" price="$24.99/mo" />}
              <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Retention & Growth
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

            <div className={cn("bg-card border border-white/5 rounded-xl p-6 relative", tier !== 'enterprise' && mode === 'full' && "overflow-hidden")}>
              {tier !== 'enterprise' && mode === 'full' && <LockedOverlay tierRequired="Enterprise" price="$24.99/mo" />}
              <h3 className="font-heading font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Advanced Financials
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-3xl font-heading font-bold text-primary">$4,230</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Monthly Revenue</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-3xl font-heading font-bold text-blue-500">73%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Retention Rate</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-3xl font-heading font-bold text-purple-500">$28.50</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Avg. Ticket</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-500 mb-1" />
                  <p className="text-xs font-bold text-foreground">Top 5%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
}
