import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Eye, EyeOff, Loader2, Store, ArrowLeft, ArrowRight } from "lucide-react";
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
  const [step, setStep] = useState<'credentials' | 'register'>('credentials');
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoginError("");
    
    try {
      const barber = await barberStore.login(email, password);
      
      toast({
        title: "Welcome Back!",
        description: `Signed in as ${barber.name} at ${barber.shop}`,
        className: "bg-primary text-primary-foreground border-none",
      });

      setLocation("/barber/dashboard");
    } catch (e: any) {
      if (e.message === "Invalid credentials") {
        setLoginError("Invalid email or password. Create a new account?");
        setStep('register');
      } else {
        toast({
          title: "Login Failed",
          description: "Unable to sign in. Please try again.",
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || !shop) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const barber = await barberStore.register(name, email, password, shop);
      
      toast({
        title: "Account Created!",
        description: `Welcome ${barber.name} at ${barber.shop}`,
        className: "bg-primary text-primary-foreground border-none",
      });

      setLocation("/barber/dashboard");
    } catch (e: any) {
      const errorMsg = e.message || "Unable to create account. Please try again.";
      setLoginError(errorMsg);
      toast({
        title: "Registration Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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

        <div className="bg-card border border-white/5 rounded-lg p-8 space-y-6">
          
          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@barbershop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  data-testid="input-barber-email"
                  className="bg-background border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

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
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-sm text-primary hover:text-primary/80 font-semibold"
                >
                  New barber? Create an account
                </button>
              </div>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <button
                type="button"
                onClick={() => { setStep('credentials'); setLoginError(""); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>

              {loginError && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-200">{loginError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your@barbershop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-register-email"
                  className="bg-background border-white/10 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

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
                    onClick={() => setShop("Urban Cuts")}
                    data-testid="button-shop-urban"
                    className={`p-4 rounded-lg border text-left transition-all ${
                      shop === "Urban Cuts"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <span className="font-heading font-bold text-sm">Urban Cuts</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium">Create Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-register-password"
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
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password || !name || !shop}
                data-testid="button-register"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Info</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-2">
            <p className="font-semibold text-foreground">Getting Started:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>1. Create an account with your email</li>
              <li>2. Select your shop</li>
              <li>3. Start managing your bookings</li>
            </ul>
          </div>
        </div>

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
