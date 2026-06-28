import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Target, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CountUp } from '@/components/ui/CountUp';

interface StatsList {
  label: string;
  value: number;
  icon: any;
}

interface DashboardOverviewProps {
  streak: number;
  statsList: StatsList[];
  weeklyProgress: number;
  overallCompletion: number;
}

export function DashboardOverview({ streak, statsList, weeklyProgress, overallCompletion }: DashboardOverviewProps) {
  return (
    <div className="space-y-10">
      {/* 4. Statistics */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
            <BarChart2 className="h-5 w-5 text-primary" /> Overview
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <Card className="flex flex-col justify-between h-full p-6 rounded-2xl border border-border/30 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                <CountUp end={streak} />
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </Card>

          {statsList.map((stat, i) => (
            <Card key={i} className="flex flex-col justify-between h-full p-6 rounded-2xl border border-border/30 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border border-border/30">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                  <CountUp end={stat.value} />
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* 5. Progress */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
            <Target className="h-5 w-5 text-emerald-500" /> Learning Progress
          </h2>
        </div>
        <Card className="p-6 rounded-2xl border border-border/30 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly Goal</p>
                  <p className="text-xs text-muted-foreground mt-1">Keep up the momentum</p>
                </div>
                <span className="text-lg font-semibold text-foreground">{weeklyProgress}%</span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden border border-border/20 shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Overall Completion</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all generated courses</p>
                </div>
                <span className="text-lg font-semibold text-foreground">{overallCompletion}%</span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden border border-border/20 shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-blue-400 to-primary h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallCompletion}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
