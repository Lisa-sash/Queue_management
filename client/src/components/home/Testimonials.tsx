import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

function Testimonial({ quote, author, role, avatar, rating }: TestimonialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-white/5 rounded-lg p-6 flex flex-col"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
        ))}
      </div>
      
      <p className="text-muted-foreground mb-6 flex-1 leading-relaxed italic">
        "{quote}"
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <img 
          src={avatar} 
          alt={author} 
          className="w-10 h-10 rounded-full object-cover border border-primary/20"
        />
        <div>
          <p className="font-heading font-bold text-sm text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const barberTestimonials: TestimonialProps[] = [
    {
      quote: "No-shows dropped from 8 per week to 1. I'm making an extra $400 monthly just from confirmed bookings.",
      author: "Marcus 'Fresh Cuts' Johnson",
      role: "Barber, Downtown Shop",
      avatar: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 5
    },
    {
      quote: "My regulars love it. They know I won't waste their time and I'm not wasting mine. Everyone wins.",
      author: "Elena Martinez",
      role: "Owner, Urban Cuts",
      avatar: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 5
    }
  ];

  const clientTestimonials: TestimonialProps[] = [
    {
      quote: "Finally! I can actually know when I need to leave. No more arriving 30 mins early to find a 45-min wait.",
      author: "David Chen",
      role: "Regular Client",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 5
    },
    {
      quote: "The app notified me that Jax had an opening 45 mins early. Saved my day and got my haircut faster.",
      author: "James Wilson",
      role: "Busy Professional",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      rating: 5
    }
  ];

  return (
    <div className="py-20 bg-card/30 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Real Results from <span className="text-primary">Real Users</span>
          </h2>
          <p className="text-muted-foreground">Barbers and clients across the city are already benefiting.</p>
        </div>

        {/* Barber Testimonials */}
        <div className="mb-16">
          <h3 className="text-xl font-heading font-bold mb-6 text-primary">What Barbers Say</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {barberTestimonials.map((testimonial, i) => (
              <Testimonial key={i} {...testimonial} />
            ))}
          </div>
        </div>

        {/* Client Testimonials */}
        <div>
          <h3 className="text-xl font-heading font-bold mb-6 text-primary">What Clients Say</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {clientTestimonials.map((testimonial, i) => (
              <Testimonial key={i} {...testimonial} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}