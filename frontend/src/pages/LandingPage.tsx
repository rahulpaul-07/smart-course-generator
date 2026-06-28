import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { LandingHero } from '../components/landing/LandingHero';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingTestimonials } from '../components/landing/LandingTestimonials';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-8 lg:px-12 flex h-16 items-center justify-between mx-auto">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            CourseAI Pro
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild className="rounded-full shadow-sm shadow-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <LandingHero />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingFooter />
      </main>
    </div>
  );
}
