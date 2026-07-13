import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, BookOpen, Code, Award, ArrowRight, FileText, Map, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/ui/CountUp';

export function LandingFeatures() {
  return (
    <>
      {/* 1. Trusted Technology */}
      <section className="py-12 border-y border-border/30 bg-muted/10 relative overflow-hidden">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-gradient-to-tr from-primary/10 to-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Skills Bridged", value: 100, suffix: "+" },
              { label: "Lessons Created", value: 2500, suffix: "+" },
              { label: "Talent Screenings", value: 500, suffix: "+" },
              { label: "Completion Rate", value: 98, suffix: "%" },
              { label: "Workforce Satisfaction", value: 4.9, decimals: 1, suffix: "★" },
              { label: "AI Personalized", value: 100, suffix: "%" }
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="p-6 h-full rounded-2xl bg-card border border-border/30 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center group"
              >
                <div className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  <CountUp end={metric.value} decimals={metric.decimals} suffix={metric.suffix} />
                </div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why CourseAI */}
      <section className="py-24 bg-muted/20 border-y border-border/30">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Why CourseAI?</h2>
            <p className="text-muted-foreground leading-7">The ultimate talent intelligence platform to build workforce readiness and master complex skills.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BrainCircuit, title: "Skills-based Generation", desc: "Instantly create structured curriculums mapped to specific skill gaps." },
              { icon: BookOpen, title: "Adaptive Lessons", desc: "Rich markdown, LaTeX math, and embedded video support tailored to the learner." },
              { icon: FileText, title: "Skills Reinforcement", desc: "Spaced-repetition study tools automatically extracted to ensure retention." },
              { icon: Code, title: "AI Talent Screening", desc: "Mock interviews with real-time AI voice and text feedback for assessment." },
              { icon: Map, title: "Career Roadmaps", desc: "AI-generated learning paths to guide workforce development step-by-step." },
              { icon: Award, title: "Verifiable Badges", desc: "Earn verifiable certificates upon demonstrating skill mastery." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group relative"
              >
                <Card className="relative p-6 h-full bg-card border border-border/30 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 text-primary group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-200 shadow-sm ring-1 ring-primary/10 group-hover:ring-primary/30">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 tracking-tight text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-7">{feature.desc}</p>
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
          <h2 className="text-3xl font-bold tracking-tight text-center mb-16 text-foreground">The Learning Journey</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              { title: "Skill Gap", icon: Sparkles },
              { title: "AI Curriculum", icon: BrainCircuit },
              { title: "Adaptive Lessons", icon: BookOpen },
              { title: "Reinforcement", icon: Code },
              { title: "AI Screening", icon: MessageSquare },
              { title: "Mastery", icon: Award }
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: i * 0.1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="h-16 w-16 rounded-2xl bg-card border border-border/30 shadow-sm flex items-center justify-center relative group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <step.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors duration-200 relative z-10" />
                  </div>
                  <span className="text-xs text-muted-foreground text-center font-medium">{step.title}</span>
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
