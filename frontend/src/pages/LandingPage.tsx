import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BrainCircuit, Rocket, ArrowRight, ShieldCheck, 
  BookOpen, Code, FileText, CheckCircle2, PlayCircle, 
  Map, Award, MessageSquare, LayoutDashboard, Zap, 
  Check, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// --- Hero Mockup Component ---
const BrowserMockup = () => (
  <div className="relative rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-1000">
    <div className="flex items-center px-4 py-3 border-b border-border/40 bg-muted/20">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-amber-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
      </div>
      <div className="mx-auto flex h-6 w-2/3 items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground font-mono">
        courseai.pro/dashboard
      </div>
    </div>
    <div className="p-4 sm:p-6 grid gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="h-4 w-32 bg-muted rounded mb-1" />
            <div className="h-3 w-20 bg-muted/60 rounded" />
          </div>
        </div>
        <div className="h-8 w-24 bg-primary/10 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-lg bg-muted/30 border border-border/40 p-3">
            <div className="h-4 w-1/2 bg-muted/80 rounded mb-2" />
            <div className="h-2 w-full bg-muted/40 rounded mb-1" />
            <div className="h-2 w-4/5 bg-muted/40 rounded" />
          </div>
        ))}
      </div>
      <div className="h-32 rounded-lg bg-primary/5 border border-primary/10 mt-2 p-4">
        <div className="h-4 w-1/3 bg-primary/20 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-2 w-full bg-primary/10 rounded" />
          <div className="h-2 w-full bg-primary/10 rounded" />
          <div className="h-2 w-3/4 bg-primary/10 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// --- Sections ---

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const showcaseTabs = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Course Viewer', icon: BookOpen },
    { id: 'AI Chat', icon: MessageSquare },
    { id: 'Roadmaps', icon: Map },
    { id: 'Interview Prep', icon: Code },
    { id: 'Flashcards', icon: FileText }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30 font-sans">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
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
            <Button asChild className="rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        
        {/* 1. Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-36 md:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)] pointer-events-none" />
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit mx-auto lg:mx-0 shadow-sm"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Course Generation 2.0 is Live
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-sm"
                >
                  Build Complete <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                    AI-Powered Courses
                  </span> <br className="hidden lg:block" />
                  in Minutes.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-[600px] text-lg md:text-xl text-muted-foreground mx-auto lg:mx-0 font-medium leading-relaxed"
                >
                  Transform any topic into a production-ready curriculum. Complete with interactive lessons, practice labs, flashcards, and an AI tutor—instantly generated for you.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Button asChild size="lg" className="h-14 px-8 rounded-full text-base font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                    <Link to="/signup">
                      Generate Your First Course
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-base font-semibold border-border/60 hover:bg-muted/50 backdrop-blur-sm transition-all">
                    <Link to="/community">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Link>
                  </Button>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                className="relative mx-auto w-full max-w-[600px] lg:max-w-none perspective-1000"
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 opacity-20 blur-2xl" />
                <BrowserMockup />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. Trusted Features */}
        <section className="py-24 bg-muted/20 border-y border-border/40 relative">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A complete ecosystem for modern learning</h2>
              <p className="text-lg text-muted-foreground">Everything you need to master complex subjects, unified in one premium platform.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Rocket, title: "AI Course Generation", desc: "Instantly create structured curriculums from a single prompt." },
                { icon: BookOpen, title: "Interactive Lessons", desc: "Rich markdown, LaTeX math, and embedded video support." },
                { icon: Map, title: "Roadmaps", desc: "AI-generated learning paths to guide you step-by-step." },
                { icon: Code, title: "Practice Labs", desc: "Hands-on coding exercises tailored to your skill level." },
                { icon: FileText, title: "Flashcards", desc: "Spaced-repetition study tools automatically extracted." },
                { icon: MessageSquare, title: "Interview Preparation", desc: "Mock interviews with real-time AI voice and text feedback." },
                { icon: BrainCircuit, title: "AI Tutor", desc: "Context-aware chat assistant available on every lesson." },
                { icon: Award, title: "Certificates", desc: "Earn verifiable certificates upon course completion." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                  <Card className="relative p-6 h-full bg-card/40 backdrop-blur-sm border-border/40 hover:bg-card/60 transition-all duration-300">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Product Showcase */}
        <section className="py-32 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10" />
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Experience the platform</h2>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {showcaseTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center p-8"
                >
                  {/* Subtle grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                  
                  <div className="relative text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner mb-4">
                      {(() => {
                        const tab = showcaseTabs.find(t => t.id === activeTab);
                        if (!tab) return null;
                        const Icon = tab.icon;
                        return <Icon className="h-10 w-10" />;
                      })()}
                    </div>
                    <h3 className="text-2xl font-bold">{activeTab} Interface</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Production-ready {activeTab.toLowerCase()} module featuring real-time synchronization, responsive design, and accessible components.
                    </p>
                    <div className="mt-8 flex justify-center gap-2 opacity-50">
                      <div className="h-2 w-16 bg-muted-foreground/30 rounded-full" />
                      <div className="h-2 w-32 bg-primary/40 rounded-full" />
                      <div className="h-2 w-8 bg-muted-foreground/30 rounded-full" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section className="py-24 bg-muted/20 border-y border-border/40">
          <div className="container px-4 md:px-6 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-20">How it works</h2>
            
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-primary/50 via-border to-transparent hidden md:block" />
              
              <div className="space-y-16">
                {[
                  { step: "01", title: "Choose your topic", desc: "Enter any subject, technology, or concept you want to master." },
                  { step: "02", title: "AI Generation", desc: "Our advanced language models dynamically construct a pedagogically sound curriculum." },
                  { step: "03", title: "Learn Interactively", desc: "Engage with the material through rich text, flashcards, and simulated labs." },
                  { step: "04", title: "Earn Certification", desc: "Pass the final assessment and receive a verifiable cryptographic certificate." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative flex flex-col md:flex-row gap-6 md:gap-12 md:items-center"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-background border border-primary/20 text-xl font-bold text-primary shadow-lg relative z-10">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-lg text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Why Choose CourseAI Pro */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The evolution of e-learning</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Stop searching for fragmented tutorials. Generate your unified learning experience.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 bg-card/20 border-border/40 backdrop-blur">
                <div className="flex items-center gap-3 mb-6 opacity-60">
                  <X className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-semibold">Traditional Learning</h3>
                </div>
                <ul className="space-y-4 text-muted-foreground">
                  {["Static, outdated video content", "One-size-fits-all curriculum", "No personalized assistance", "Separate tools for practice", "Takes months to find the right course"].map((text, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500/50" />
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 backdrop-blur relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap className="h-32 w-32" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <Check className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">CourseAI Pro</h3>
                </div>
                <ul className="space-y-4 text-foreground font-medium relative z-10">
                  {["Dynamically generated up-to-date content", "Personalized to your exact learning goals", "24/7 Context-aware AI Tutor", "Integrated labs, flashcards & roadmaps", "Generated instantly in seconds"].map((text, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. Testimonials */}
        <section className="py-24 bg-muted/30 border-y border-border/40">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Demo Content
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by professionals</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { name: "Sarah J.", role: "Software Engineer", quote: "I needed to learn Rust for a new project. CourseAI generated a complete interactive roadmap that got me up to speed in a week." },
                { name: "Michael T.", role: "Product Manager", quote: "The mock interview feature is insanely good. The voice feedback feels exactly like talking to a real hiring manager." },
                { name: "Elena R.", role: "Data Scientist", quote: "Being able to instantly generate flashcards and coding labs from my syllabus has transformed how I retain complex algorithms." }
              ].map((t, i) => (
                <Card key={i} className="p-6 bg-card/60 backdrop-blur border-border/50 shadow-sm flex flex-col justify-between">
                  <div className="mb-6">
                    <div className="flex gap-1 mb-4 text-primary">
                      {[1,2,3,4,5].map(star => <Sparkles key={star} className="h-4 w-4 fill-primary" />)}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center font-bold text-foreground">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary to-cyan-400 rounded-[100%] opacity-20 blur-3xl" />
          
          <div className="container relative z-10 px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-sm">
                Ready to learn smarter?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join thousands of learners generating personalized education instantly.
              </p>
              <Button asChild size="lg" className="h-16 px-10 rounded-full text-lg font-bold shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all">
                <Link to="/signup">
                  Generate Your First Course
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

      </main>

      {/* 8. Footer */}
      <footer className="border-t border-border/40 bg-background pt-16 pb-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                </div>
                CourseAI Pro
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
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CourseAI Pro. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
