import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SkillSectionProps {
  skills: { name: string, icon: React.ElementType }[];
}

export function SkillSection({ skills }: SkillSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.2 }}
    >
      <Card className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> Skills You'll Learn
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <div key={i} className="inline-flex items-center gap-2 bg-background/80 border border-border/50 rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-primary/30">
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                <skill.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">{skill.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.section>
  );
}
