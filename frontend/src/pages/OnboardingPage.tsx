import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Database, BrainCircuit, Globe, Palette, Calculator, CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

const INTERESTS = [
  { id: 'web-dev', label: 'Web Development', icon: Globe },
  { id: 'data-science', label: 'Data Science', icon: Database },
  { id: 'ai-ml', label: 'AI & Machine Learning', icon: BrainCircuit },
  { id: 'design', label: 'UI/UX Design', icon: Palette },
  { id: 'algorithms', label: 'Algorithms & CS', icon: Code },
  { id: 'math', label: 'Mathematics', icon: Calculator },
];

const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Have some basic knowledge' },
  { id: 'advanced', label: 'Advanced', desc: 'Looking for complex challenges' },
  { id: 'expert', label: 'Expert', desc: 'Deep diving into specific niches' },
];

export default function OnboardingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const handleComplete = async () => {
    if (interests.length === 0) {
      toast.error('Please select at least one interest.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put('/user/onboarding', {
        skillLevel,
        learningInterests: interests,
      });
      // Update local user state
      login({ ...user, ...data });
      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shadow-lg shadow-primary/10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>

        <Card className="p-8 border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: '50%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to CourseAI Pro</h1>
                  <p className="text-muted-foreground text-lg">Let's personalize your learning experience.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What's your current skill level?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSkillLevel(level.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          skillLevel === level.id 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                            : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-foreground">{level.label}</span>
                          {skillLevel === level.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{level.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNext} size="lg" className="px-8 shadow-lg shadow-primary/20">
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">What do you want to learn?</h1>
                  <p className="text-muted-foreground text-lg">Select at least one topic to get personalized course recommendations.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {INTERESTS.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = interests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-md shadow-primary/10' 
                            : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                      >
                        <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium text-center ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {interest.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground">
                    Back
                  </Button>
                  <Button onClick={handleComplete} size="lg" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
