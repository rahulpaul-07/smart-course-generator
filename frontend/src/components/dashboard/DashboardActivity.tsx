import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface Recommendation {
  label: string;
  icon: any;
  desc: string;
}

interface RecentActivityItem {
  type: string;
  title: string;
  url: string;
}

interface DashboardActivityProps {
  recommendations: Recommendation[];
  recentActivity?: RecentActivityItem[];
}

export function DashboardActivity({ recommendations, recentActivity = [] }: DashboardActivityProps) {
  return (
    <div className="space-y-10">
      {/* 6. Recommended Actions */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" /> Recommended
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {recommendations.map((rec, i) => (
            <Card key={i} className="p-6 rounded-xl border border-border/30 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-4 group">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-background border border-border/30 flex items-center justify-center transition-transform duration-200">
                <rec.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-0.5 truncate">{rec.label}</h4>
                <p className="text-xs text-muted-foreground truncate">{rec.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </Card>
          ))}
        </div>
      </motion.section>

      {/* 7. Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
            <Activity className="h-5 w-5 text-muted-foreground" /> Recent Activity
          </h2>
        </div>
        <Card className="p-6 rounded-2xl border border-border/30 bg-card shadow-sm relative">
          {recentActivity.length > 0 ? (
            <div className="relative pl-6 border-l border-border/30 space-y-6 py-2">
              {recentActivity.map((activity, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full border border-background bg-muted-foreground group-hover:bg-primary transition-colors duration-200" />
                  <Link 
                    to={activity.url}
                    className="block -mt-1 hover:-translate-y-0.5 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-primary">
                        {activity.type}
                      </span>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{activity.title}</p>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4">
              <div className="h-12 w-12 rounded-full bg-muted border border-border/30 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-semibold text-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">Start learning to see your timeline.</p>
            </div>
          )}
        </Card>
      </motion.section>
    </div>
  );
}
