import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAction {
  label: string;
  icon: any;
  url: string;
  desc: string;
  color: string;
  text: string;
  border: string;
}

export function DashboardQuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <Zap className="h-5 w-5 text-amber-500" /> Quick Actions
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {actions.map((action, i) => (
          <Link 
            key={i}
            to={action.url}
            className="group flex flex-col p-6 h-full rounded-2xl border border-border/30 bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.color} blur-2xl -mr-16 -mt-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-200`} />
            <div className={`h-10 w-10 rounded-xl bg-background flex items-center justify-center mb-4 ${action.text} shadow-sm border border-border/30 transition-transform duration-200`}>
              <action.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{action.label}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{action.desc}</p>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
