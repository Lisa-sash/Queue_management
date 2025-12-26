import { Link } from "wouter";
import { Scissors, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-sm group-hover:bg-primary/90 transition-colors">
            <Scissors className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold tracking-wider text-foreground">
            QUEUE<span className="text-primary">CUT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/shops" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Find Barbers
          </Link>
          <Link href="/appointments" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            My Bookings
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <Link href="/barber/login">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary hover:text-primary">
              For Barbers
            </Button>
          </Link>
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-l border-white/10 w-[300px]">
            <div className="flex flex-col gap-6 mt-8">
              <Link href="/shops" className="text-lg font-heading font-medium hover:text-primary transition-colors">
                Find Barbers
              </Link>
              <Link href="/appointments" className="text-lg font-heading font-medium hover:text-primary transition-colors">
                My Bookings
              </Link>
              <div className="h-px bg-white/10 my-2" />
              <Link href="/barber/login" className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Barber Portal
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}