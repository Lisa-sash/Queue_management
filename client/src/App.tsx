import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Appointments from "@/pages/Appointments";
import BarberLogin from "@/pages/BarberLogin";
import BarberDashboard from "@/pages/BarberDashboard";
import { 
  Users, Building2, LayoutDashboard, Globe, ShieldCheck, Plus, LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function OwnerPortal() {
  const organizations = [
    { id: 'q-cut-1', name: "The Gentleman's Den", owner: "Lisa Rita", shops: 2, status: 'active', plan: 'Enterprise' },
    { id: 'u-cuts-1', name: "Urban Style Group", owner: "Alex Chen", shops: 1, status: 'active', plan: 'Professional' },
    { id: 'new-biz', name: "Precision Fades", owner: "Marcus V.", shops: 0, status: 'pending', plan: 'Trial' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-heading font-bold tracking-tight">QueueCut <span className="text-primary text-xl">Admin</span></h1>
            <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest">Multi-Tenant Management Console</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/10 gap-2">
              <Plus className="w-4 h-4" /> New Organization
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-white/5 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl"><Globe className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Platform Revenue</p>
                <p className="text-2xl font-bold">R 142,500</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl"><Building2 className="w-6 h-6 text-blue-500" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Clients</p>
                <p className="text-2xl font-bold">24 Orgs</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl"><ShieldCheck className="w-6 h-6 text-green-500" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">System Health</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="font-heading font-bold text-xl">Organization Profiles</h2>
            <p className="text-sm text-muted-foreground">Each organization is isolated with its own data and branding</p>
          </div>
          <div className="divide-y divide-white/5">
            {organizations.map((org) => (
              <div key={org.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center font-bold text-xl uppercase">
                    {org.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{org.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {org.owner}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {org.shops} Shops</span>
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-primary uppercase">{org.plan}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4 hidden md:block">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Data Partition</p>
                    <p className="text-[10px] font-mono opacity-40">{org.id}_prod_v1</p>
                  </div>
                  <Button variant="secondary" className="gap-2" onClick={() => window.location.href = `/barber/login?tenant=${org.id}`}>
                    <LayoutDashboard className="w-4 h-4" /> Manage Org
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={OwnerPortal} />
      <Route path="/shops" component={Home} /> 
      <Route path="/shop/:id" component={Shop} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/barber/login" component={BarberLogin} />
      <Route path="/barber/dashboard" component={BarberDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;