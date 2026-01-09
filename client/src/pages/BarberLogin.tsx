import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Eye, EyeOff, Loader2, Store, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { barberStore } from "@/lib/barber-store";

export default function BarberLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [shop, setShop] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingBarber, setIsExistingBarber] = useState(false);

  // Check if email belongs to an existing barber
  useEffect(() => {
    if (email.includes('@')) {
      const existing = barberStore.findByEmail(email);
      if (existing) {
        setIsExistingBarber(true);
        setName(existing.name);
        setShop(existing.shop);
      } else {
        setIsExistingBarber(false);
      }
    } else {
      setIsExistingBarber(false);
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || !shop) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields including your name and shop.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add barber to the store so they appear in shop listings
      const barber = barberStore.addBarber(name, email, shop);
      
      // Mock auth - accept any email/password combo
      localStorage.setItem("barberAuth", JSON.stringify({ email, name, shop, barberId: barber.id }));
      
      toast({
        title: "Welcome Back!",
        description: `Logged in as ${name} at ${shop}`,
        className: "bg-primary text-primary-foreground border-none",
      });

      setIsLoading(false);
      setLocation("/barber/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-primary p-2.5 rounded-sm">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-wider text-foreground">
              QUEUE<span className="text-primary">CUT</span>
            </span>
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Barber Portal</h1>
          <p className="text-muted-foreground">Manage your queue in real-time</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-white/5 rounded-lg p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Existing Barber Welcome */}
            {isExistingBarber && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Welcome back, {name}!</p>
                  <p className="text-sm text-muted-foreground">{shop}</p>
                </div>
              </div>
            )}

            {/* Name - only for new barbers */}
            {!isExistingBarber && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Jax"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-barber-name"
                  className="bg-background border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Shop Selection - only for new barbers */}
            {!isExistingBarber && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Which shop do you work at?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShop("The Gentleman's Den")}
                    data-testid="button-shop-gentlemans"
                    className={`p-4 rounded-lg border text-left transition-all ${
                      shop === "The Gentleman's Den"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <span className="font-heading font-bold text-sm">The Gentleman's Den</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShop("Urban Cut")}
                    data-testid="button-shop-urban"
                    className={`p-4 rounded-lg border text-left transition-all ${
                      shop === "Urban Cut"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <span className="font-heading font-bold text-sm">Urban Cut</span>
                  </button>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@barbershop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-barber-email"
                className="bg-background border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Try any email for demo</p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-barber-password"
                  className="bg-background border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Try any password for demo</p>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password || !name || !shop}
              data-testid="button-barber-login"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Demo Mode</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold text-foreground">Try these accounts:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>📧 <code className="text-primary">jax@gentlemansden.com</code></li>
              <li>📧 <code className="text-primary">elena@urbancuts.com</code></li>
            </ul>
            <p className="text-xs text-muted-foreground pt-2">Password: anything</p>
          </div>
        </div>

        {/* Back to Client */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Are you a client?</p>
          <a href="/" className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors">
            ← Back to Client App
          </a>
        </div>
      </div>
    </div>
  );
}