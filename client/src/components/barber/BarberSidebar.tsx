import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarberSidebarProps {
  barberName: string;
  barberAvatar: string;
  activePage: string;
}

export function BarberSidebar({ barberName, barberAvatar, activePage }: BarberSidebarProps) {
  const menuItems = [
    { id: 'queue', label: 'Queue', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full md:w-64 bg-card border-r border-white/5 p-6 flex flex-col h-full">
      {/* Profile */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
        <img
          src={barberAvatar}
          alt={barberName}
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/50"
        />
        <div>
          <p className="font-bold text-sm text-foreground">{barberName}</p>
          <p className="text-xs text-muted-foreground">Barber Dashboard</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 mb-8">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground transition-colors",
              activePage === item.id && "bg-primary/10 text-primary border border-primary/20"
            )}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}