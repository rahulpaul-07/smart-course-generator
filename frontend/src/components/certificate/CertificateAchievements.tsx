import React from 'react';
import { GraduationCap, Target, ListChecks } from 'lucide-react';
import type { Certificate } from '../../types';

interface CertificateAchievementsProps {
  certificate: Certificate;
}

export function CertificateAchievements({ certificate }: CertificateAchievementsProps) {
  return (
    <div className="md:col-span-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Course Achievements</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <Target className="w-5 h-5 text-primary mb-3 opacity-80" />
          <p className="text-2xl font-black text-foreground mb-1">{certificate.averageScore}<span className="text-sm text-muted-foreground font-medium">%</span></p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Test Score</p>
        </div>
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <GraduationCap className={`w-5 h-5 mb-3 opacity-80 ${certificate.passed ? 'text-success' : 'text-warning'}`} />
          <p className="text-2xl font-black text-foreground mb-1">{certificate.passed ? 'Passed' : 'Failed'}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result</p>
        </div>
        <div className="bg-background border border-border/30 rounded-2xl p-4 shadow-sm">
          <ListChecks className="w-5 h-5 text-primary mb-3 opacity-80" />
          <p className="text-2xl font-black text-foreground mb-1">{certificate.answers?.length ?? 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Questions</p>
        </div>
      </div>
    </div>
  );
}
