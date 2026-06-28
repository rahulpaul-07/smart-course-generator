import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, BookOpen, Code, Award, ArrowRight, FileText, Map, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/ui/CountUp';

export function LandingFeatures() {
  return (
    <>
      {/* 1. Trusted Technology */}
      <section className="py-12 border-y border-border/40 bg-muted/10 relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">Powered by industry-leading technology</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Gemini', 'OpenAI', 'Groq', 'Vercel'].map((tech) => (
              <div key={tech} className="text-lg md:text-xl font-bold tracking-tight grayscale hover:grayscale-0 hover:text-foreground hover:opacity-100 transition-all duration-300 cursor-default">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Metrics */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-gradient-to-tr from-primary/10 to-cyan-400/10 rounded-full blur-[120px] -z-10" />
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "AI Courses Generated", value: 100, suffix: "+" },
              { label: "Lessons Created", value: 2500, suffix: "+" },
              { label: "Interview Sessions", value: 500, suffix: "+" },
              { label: "Completion Rate", value: 98, suffix: "%" },
              { label: "User Satisfaction", value: 4.9, decimals: 1, suffix: "★" },
              { label: "AI Personalized", value: 100, suffix: "%" }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xl shadow-sm hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:border-border/80 transition-all duration-200 flex flex-col items-center justify-center text-center group"
              >
                <div className="text-3xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors">
                  <CountUp end={metric.value} decimals={metric.decimals} suffix={metric.suffix} />
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why CourseAI */}
      <section className="py-24 bg-muted/20 border-y border-border/40">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Why CourseAI Pro?</h2>
            <p className="text-lg text-muted-foreground">Everything you need to master complex subjects, unified in one premium platform.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BrainCircuit, title: "AI Course Generation", desc: "Instantly create structured curriculums from a single prompt." },
              { icon: BookOpen, title: "Interactive Lessons", desc: "Rich markdown, LaTeX math, and embedded video support." },
              { icon: FileText, title: "Flashcards", desc: "Spaced-repetition study tools automatically extracted." },
              { icon: Code, title: "Interview Preparation", desc: "Mock interviews with real-time AI voice and text feedback." },
              { icon: Map, title: "Roadmaps", desc: "AI-generated learning paths to guide you step-by-step." },
              { icon: Award, title: "Certificates", desc: "Earn verifiable certificates upon course completion." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group relative"
              >
                <Card className="relative p-8 h-full bg-card/40 backdrop-blur-xl border border-border/40 hover:bg-card hover:border-border/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 text-primary group-hover:scale-105 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-200 shadow-sm ring-1 ring-primary/10 group-hover:ring-primary/30">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Learning Journey */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16 text-foreground">The Learning Journey</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              { title: "Topic", icon: Sparkles },
              { title: "AI Generation", icon: BrainCircuit },
              { title: "Interactive Lessons", icon: BookOpen },
              { title: "Practice", icon: Code },
              { title: "Interview Prep", icon: MessageSquare },
              { title: "Certificate", icon: Award }
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: i * 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="h-16 w-16 rounded-2xl bg-card border border-border/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-center relative group hover:border-border/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <step.icon className="h-7 w-7 text-foreground group-hover:text-primary transition-colors duration-200 relative z-10" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">{step.title}</span>
                </motion.div>
                {i < arr.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: i * 0.1 + 0.05 }}
                    className="hidden md:flex items-center justify-center"
                  >
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                  </motion.div>
                )}
                {i < arr.length - 1 && (
                  <div className="md:hidden h-8 w-px bg-gradient-to-b from-border to-transparent" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
