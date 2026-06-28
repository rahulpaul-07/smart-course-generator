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
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" /> Overview
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-border/80 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">
                <CountUp end={streak} />
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Day Streak</div>
            </div>
          </Card>

          {statsList.map((stat, i) => (
            <Card key={i} className="p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-border/80 transition-all duration-200 flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border border-border/40 group-hover:bg-background transition-colors duration-200">
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">
                  <CountUp end={stat.value} />
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
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
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" /> Learning Progress
          </h2>
        </div>
        <Card className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-border/80 transition-all duration-200">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">Weekly Goal</p>
                  <p className="text-xs font-medium text-muted-foreground">Keep up the momentum</p>
                </div>
                <span className="text-lg font-extrabold text-foreground">{weeklyProgress}%</span>
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
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-foreground">Overall Completion</p>
                  <p className="text-xs font-medium text-muted-foreground">Across all generated courses</p>
                </div>
                <span className="text-lg font-extrabold text-foreground">{overallCompletion}%</span>
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
