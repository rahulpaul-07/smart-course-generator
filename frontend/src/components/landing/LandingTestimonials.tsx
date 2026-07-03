import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function LandingTestimonials() {
  return (
    <section className="py-24 bg-muted/20 border-y border-border/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary mb-4 shadow-sm backdrop-blur-sm">
            Demo Feedback
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Loved by professionals</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { name: "Sarah J.", role: "Software Engineer", quote: "I needed to learn Rust for a new project. CourseAI generated a complete interactive roadmap that got me up to speed in a week." },
            { name: "Michael T.", role: "Product Manager", quote: "The mock interview feature is insanely good. The voice feedback feels exactly like talking to a real hiring manager." },
            { name: "Elena R.", role: "Data Scientist", quote: "Being able to instantly generate flashcards and coding labs from my syllabus has transformed how I retain complex algorithms." }
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.1 }}
            >
              <Card className="p-8 bg-card border border-border/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full">
                <div className="mb-8">
                  <div className="flex gap-1 mb-5">
                    {[1,2,3,4,5].map(star => <Sparkles key={star} className="h-4 w-4 fill-warning text-warning" />)}
                  </div>
                  <p className="text-muted-foreground leading-7">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-4 pt-5 border-t border-border/30 mt-auto">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/20 flex items-center justify-center font-bold text-foreground ring-1 ring-border shadow-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
