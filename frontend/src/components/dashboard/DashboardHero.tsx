import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeroProps {
  name: string;
  continueUrl?: string;
  onNavigate: (url: string) => void;
}

export function DashboardHero({ name, continueUrl = '/courses', onNavigate }: DashboardHeroProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-2xl border border-border/30 bg-card/60 backdrop-blur-2xl shadow-md shadow-foreground/5 overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl text-center md:text-left space-y-6">
        <div>
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-6 ring-1 ring-primary/20">
            Welcome back, {name}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
            Ready to continue learning?
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-6 leading-relaxed">
            Pick up right where you left off, or generate a completely new AI course in seconds.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-6">
          <Button size="lg" className="h-12 px-6 rounded-full text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background" onClick={() => { document.getElementById('course-generator')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <Sparkles className="mr-3 h-5 w-5" />
            Generate New Course
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-6 rounded-full text-sm font-semibold border border-border/30 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5" onClick={() => onNavigate(continueUrl)}>
            Continue Learning
          </Button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[320px] hidden lg:block aspect-square">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-cyan-400/20 rounded-full blur-[80px]" />
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 left-4 right-12 bg-card border border-border/30 shadow-md rounded-2xl p-4 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-3 border-b border-border/30 pb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="h-2 w-20 bg-muted-foreground/30 rounded mb-1.5" />
              <div className="h-2 w-12 bg-muted-foreground/20 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted/60 rounded" />
            <div className="h-2 w-4/5 bg-muted/60 rounded" />
            <div className="h-2 w-2/3 bg-muted/60 rounded" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-4 left-12 right-4 bg-background border border-border/30 shadow-lg rounded-2xl p-4 backdrop-blur-xl ring-1 ring-white/5"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="h-2 w-16 bg-muted-foreground/30 rounded" />
            <div className="h-4 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <div className="h-1.5 w-6 bg-emerald-500/50 rounded-full" />
            </div>
          </div>
          <div className="h-24 w-full bg-muted/40 rounded-lg border border-border/30 flex items-end p-2 gap-1">
            {[40, 70, 45, 90, 65, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/40 rounded-t-sm transition-all" style={{ height: `${h}%` }} />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
