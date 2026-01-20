import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, MapPin, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MOCK_BARBERS } from "@/lib/mock-data";
import { barberStore, LoggedInBarber } from "@/lib/barber-store";
import generatedImage from '@assets/generated_images/modern_dark_industrial_barbershop_interior.png';
import urbanCutsImage from '@assets/image_1767897075901.png';

export default function Home() {
  const [gentlemansBarbers, setGentlemansBarbers] = useState<LoggedInBarber[]>([]);
  const [urbanBarbers, setUrbanBarbers] = useState<LoggedInBarber[]>([]);

  useEffect(() => {
    const updateBarbers = () => {
      setGentlemansBarbers(barberStore.getBarbersByShop("The Gentleman's Den"));
      setUrbanBarbers(barberStore.getBarbersByShop("Urban Cuts"));
    };
    updateBarbers();
    return barberStore.subscribe(updateBarbers);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={generatedImage} 
            alt="Modern Barbershop" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Live Queue System</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground leading-tight">
              Wait Less.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Look Sharp.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              Smart queue management. Book a slot, get real-time updates if someone cancels, 
              and walk in exactly when the chair is ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/shops">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto">
                  Find a Barber
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-lg px-8 py-6 h-auto">
                How it Works
              </Button>
              <Link href="/admin">
                <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-primary text-lg px-8 py-6 h-auto">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Top Rated Shops</h2>
              <p className="text-muted-foreground">The best cuts in your city, ranked by queue efficiency.</p>
            </div>
            <Button variant="link" className="text-primary hidden md:flex">View all shops</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Shop Card 1 */}
            <Link href="/shop/1">
              <div className="group cursor-pointer bg-card border border-white/5 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                    alt="Shop Interior"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold flex items-center gap-1 text-primary">
                    <Star className="w-3 h-3 fill-primary" />
                    4.9
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">The Gentleman's Den</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Downtown</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Open Now</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                      {gentlemansBarbers.map(b => (
                        <div key={b.id} className="w-8 h-8 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center" title={b.name}>
                          <span className="text-primary font-bold text-xs">{b.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                      {gentlemansBarbers.length > 0 ? `${gentlemansBarbers.length} Barbers` : "No Barbers Yet"}
                    </span>
                  </div>
                  {gentlemansBarbers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-muted-foreground mb-2">Available barbers:</p>
                      <div className="flex flex-wrap gap-2">
                        {gentlemansBarbers.map(b => (
                          <span key={b.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded" data-testid={`barber-name-${b.id}`}>
                            {b.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Mock Shop Card 2 */}
            <Link href="/shop/2">
              <div className="group cursor-pointer bg-card border border-white/5 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={urbanCutsImage} 
                    alt="Urban Cuts Shop"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">Urban Cuts</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>West End</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Closes 8pm</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                       {urbanBarbers.map(b => (
                         <div key={b.id} className="w-8 h-8 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center" title={b.name}>
                           <span className="text-primary font-bold text-xs">{b.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                         </div>
                       ))}
                    </div>
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                      {urbanBarbers.length > 0 ? `${urbanBarbers.length} Barbers` : "No Barbers Yet"}
                    </span>
                  </div>
                  {urbanBarbers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-muted-foreground mb-2">Available barbers:</p>
                      <div className="flex flex-wrap gap-2">
                        {urbanBarbers.map(b => (
                          <span key={b.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded" data-testid={`barber-name-${b.id}`}>
                            {b.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Mock Shop Card 3 */}
            <div className="group cursor-pointer bg-card border border-white/5 rounded-lg overflow-hidden opacity-60">
               <div className="aspect-video relative flex items-center justify-center bg-white/5">
                  <span className="font-heading text-2xl text-muted-foreground">Coming Soon</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-start justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-6">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Seamless Experience</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight uppercase">
                How It Works
              </h2>
            </div>
            <div className="hidden md:flex w-20 h-20 rounded-full border-2 border-white/10 items-center justify-center">
              <Clock className="w-10 h-10 text-white/20" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/60 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wide mb-2">Book a slot and receive your unique 4-character access code</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Use your code in "My Bookings" to view and manage your appointment</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/60 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wide mb-2">Tap "I'm On The Way" when leaving to notify your barber</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Running late? Let the barber know for a 15-min grace period</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/60 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wide mb-2">Tap "I've Arrived" when you reach the shop</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Your barber will be notified you're ready and waiting</p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary/60 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">4</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wide mb-2">Cancel anytime to free the slot for walk-ins</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">No-shows affect queue efficiency, so help others by canceling if plans change</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}