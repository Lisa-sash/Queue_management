import { motion } from "framer-motion";
import { Clock, TrendingUp, Users, Bell, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
}

function ValueCard({ icon, title, description, metric }: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group bg-card/50 border border-white/5 rounded-lg p-6 hover:border-primary/30 transition-all duration-300"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-lg font-heading font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="text-2xl font-heading font-bold text-primary">{metric}</div>
    </motion.div>
  );
}

export function ValueProposition() {
  return (
    <div className="py-20 bg-background relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Why Choose <span className="text-primary">QueueCut</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built to solve the real problems that waste time and money for barbers and frustrate clients.
          </p>
        </div>

        {/* For Barbers Section */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h3 className="text-2xl font-heading font-bold">For Barbers</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Eliminate No-Shows"
              description="Real confirmation before the appointment means 95% attendance instead of 70%."
              metric="+25% Revenue"
            />
            <ValueCard
              icon={<Clock className="w-6 h-6" />}
              title="Sell More Slots"
              description="Cancel notices mean walk-ins fill gaps immediately. No dead time."
              metric="4-6 Extra Cuts/Week"
            />
            <ValueCard
              icon={<Users className="w-6 h-6" />}
              title="Build Loyalty"
              description="Repeat customers book more when they know they won't wait."
              metric="40% Higher Retention"
            />
          </div>

          <div className="mt-8 p-8 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h4 className="font-heading font-bold text-lg mb-2">Ready to Get More Bookings?</h4>
                <p className="text-muted-foreground text-sm">Free for 30 days. No credit card. No commission.</p>
              </div>
              <Link href="/barber-signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                  Claim Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-12" />

        {/* For Clients Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h3 className="text-2xl font-heading font-bold">For Clients</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              icon={<Zap className="w-6 h-6" />}
              title="Never Wait Again"
              description="See exact wait times and arrive when your barber is ready, not 45 mins early."
              metric="0 Min Average Wait"
            />
            <ValueCard
              icon={<Bell className="w-6 h-6" />}
              title="Get Instant Alerts"
              description="Slot opens up? Get notified immediately and grab it before someone else."
              metric="Real-Time Updates"
            />
            <ValueCard
              icon={<Target className="w-6 h-6" />}
              title="Easy Cancellations"
              description="Cancel without guilt. Free the slot for others and get rewards for being reliable."
              metric="5 Loyalty Points/Booking"
            />
          </div>

          <div className="mt-8 p-8 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h4 className="font-heading font-bold text-lg mb-2">First Booking is Free</h4>
                <p className="text-muted-foreground text-sm">Download, book, and we'll credit your first appointment.</p>
              </div>
              <Link href="/shops">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                  Find a Barber Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}