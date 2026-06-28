import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ContinueLearningData {
  type: string;
  updatedAt: string;
  title: string;
  url: string;
}

export function DashboardContinueLearning({ data }: { data: ContinueLearningData }) {
  const navigate = useNavigate();
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <PlayCircle className="h-5 w-5 text-primary" /> Continue Learning
        </h2>
      </div>
      <Card className="overflow-hidden border border-border/30 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative shrink-0 w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border/30">
            <div className="absolute inset-0 bg-primary/5 transition-colors duration-200" />
            <BookOpen className="h-10 w-10 text-primary/40" />
          </div>
          
          <div className="flex-1 min-w-0 w-full space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {data.type}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Updated {new Date(data.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground truncate">{data.title}</h3>
            
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden border border-border/20">
                <div className="h-full bg-primary rounded-full w-[45%]" />
              </div>
              <span className="text-sm font-medium text-foreground w-12 text-right">45%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              3 lessons remaining • ~45 mins left
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
            <Button variant="secondary" size="lg" className="w-full md:w-auto rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]" onClick={() => navigate(data.url)}>
              Resume Course <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}
