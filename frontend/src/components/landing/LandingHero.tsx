import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, BookOpen, Code, Award, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductPreview } from './ProductPreview';

export function LandingHero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
      {/* ── Layered Background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(262_83%_57%/0.15),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,hsl(191_97%_77%/0.1),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_40%_at_0%_100%,hsl(262_83%_57%/0.08),transparent_60%)]" />
      
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      
      <div className="container px-4 md:px-8 lg:px-12 w-full py-16 lg:py-0">
        <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-8 items-center min-h-[calc(100vh-64px)]">
          
          {/* ────────── LEFT: Marketing 60% ────────── */}
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left pt-10 lg:pt-0">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs text-primary w-fit mx-auto lg:mx-0 shadow-sm backdrop-blur-sm hover:bg-primary/15 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              ✨ AI-Powered Learning Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="text-5xl font-bold tracking-tight text-foreground leading-[1.1] max-w-[700px] mx-auto lg:mx-0"
            >
              Generate Your Next <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-cyan-400">
                AI Course
              </span>{' '}
              <br className="hidden sm:block" />
              in Minutes.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="max-w-[600px] mx-auto lg:mx-0 text-muted-foreground leading-7"
            >
              CourseAI Pro generates complete personalized courses with interactive lessons, quizzes, practice projects, mock interviews, spaced-repetition flashcards, and verifiable certificates.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="h-12 px-8 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <Link to="/signup">
                  Generate Your First Course
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-12 px-8 rounded-xl text-base font-semibold border border-border/30 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:shadow-sm">
                <Link to="/community">
                  <PlayCircle className="mr-2 h-6 w-6" />
                  Explore Demo
                </Link>
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="pt-6 flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              {[
                { label: 'AI Generated', icon: BrainCircuit },
                { label: 'Interactive Lessons', icon: BookOpen },
                { label: 'Interview Prep', icon: Code },
                { label: 'Certificates', icon: Award },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30 text-xs text-muted-foreground">
                  <badge.icon className="h-4 w-4 text-primary" />
                  {badge.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ────────── RIGHT: Product Preview 40% ────────── */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[600px] lg:max-w-none pt-10 lg:pt-0"
          >
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-primary/20 via-transparent to-cyan-400/15 opacity-60 blur-3xl -z-10" />
            <ProductPreview />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
