import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingFooter() {
  return (
    <>
      {/* 6. CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-gradient-to-r from-primary/30 to-primary/30 rounded-full opacity-30 blur-[100px] pointer-events-none" />
        
        <div className="container relative z-10 px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto bg-card/40 backdrop-blur-xl border border-border/30 p-12 md:p-16 rounded-2xl shadow-md relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-foreground drop-shadow-sm relative z-10">
              Ready to Start Learning Smarter?
            </h2>
            <p className="text-muted-foreground leading-7 mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of learners generating personalized education instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
              <Button asChild size="lg" className="h-12 px-8 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full sm:w-auto">
                <Link to="/signup">
                  Generate Your First Course
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-12 px-8 rounded-xl text-base font-semibold border border-border/30 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:shadow-sm w-full sm:w-auto">
                <Link to="/community">
                  View Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background pt-16 pb-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                </div>
                CourseAI
              </div>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                The most advanced AI-powered platform for dynamic curriculum generation and interactive learning.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">Log In</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
                <li>
                  <a href="https://github.com/rahulpaul-07/smart-course-generator" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/30 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CourseAI. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
