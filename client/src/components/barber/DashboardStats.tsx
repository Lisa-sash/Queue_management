import { motion } from "framer-motion";
import { Clock, Users, TrendingUp, AlertCircle, Scissors } from "lucide-react";

interface DashboardStatsProps {
  currentWaitTime: number;
  bookedToday: number;
  walkInsToday: number;
  completedToday: number;
  lateArrivals: number;
}

export function DashboardStats({
  currentWaitTime,
  bookedToday,
  walkInsToday,
  completedToday,
  lateArrivals,
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Wait Time',
      value: `${currentWaitTime}m`,
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Booked Today',
      value: bookedToday,
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Walk-ins',
      value: walkInsToday,
      icon: Scissors,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Completed',
      value: completedToday,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Late Arrivals',
      value: lateArrivals,
      icon: AlertCircle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`${stat.bg} border border-white/5 rounded-lg p-4 text-center`}
        >
          <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
          <p className={`text-2xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}