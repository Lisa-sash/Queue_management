import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Scissors } from "lucide-react";
import { Link } from "wouter";

export default function Appointments() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 max-w-2xl">
        <h1 className="text-4xl font-heading font-bold mb-8">My Bookings</h1>
        
        <div className="bg-card border border-white/5 rounded-lg p-12 text-center space-y-4">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
             <Scissors className="w-8 h-8 text-muted-foreground" />
           </div>
           <h2 className="text-xl font-bold">No Active Bookings</h2>
           <p className="text-muted-foreground">You haven't booked any slots yet. Find a barber to get started.</p>
           <div className="pt-4">
             <Link href="/shops">
               <Button className="bg-primary text-primary-foreground">Find a Barber</Button>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}