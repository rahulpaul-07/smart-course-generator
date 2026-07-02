import { useRef } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';

import { useCertificate } from '../hooks/useCertificate';
import { useCertificateExport } from '../hooks/useCertificateExport';
import { CertificatePreview } from '../components/certificate/CertificatePreview';
import { CertificateMetadata } from '../components/certificate/CertificateMetadata';
import { CertificateAchievements } from '../components/certificate/CertificateAchievements';
import { CertificateSharePanel } from '../components/certificate/CertificateSharePanel';
import { CertificateSkeleton } from '../components/certificate/CertificateSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDateLong } from '../utils/dates';

export default function CertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const certificateRef = useRef<HTMLDivElement>(null);
  const isCourseLinked = location.pathname.startsWith('/course/');
  
  const { certificate, loading, error, refetch } = useCertificate(id);
  const {
    isExportingPDF,
    isExportingPNG,
    copiedLink,
    handleExportPDF,
    handleExportPNG,
    copyToClipboard,
    shareToLinkedIn,
    shareToTwitter
  } = useCertificateExport(certificateRef, certificate);

  if (loading) {
    return <CertificateSkeleton />;
  }

  if (error || !certificate) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center p-6 text-center bg-background">
        <ErrorState 
          title="Invalid Credential" 
          description="This verification link is invalid, expired, or the certificate could not be found." 
          onRetry={refetch}
        />
        <Button onClick={() => navigate('/')} className="mt-8 h-12 px-10 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-1">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const issueDate = formatDateLong(certificate.issuedAt || certificate.createdAt || new Date().toISOString());
  // The backend doesn't track a distinct "completion time" for a course --
  // only the certificate issue date -- so this is always the fallback value.
  const completionTime = 'Self-Paced';

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 py-3 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Official Verified Credential</span>
          </div>
          <BackButton
            to={certificate.course ? `/course/${certificate.course}` : '/'}
            label="Back"
            className="shrink-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 h-8 text-xs font-bold uppercase tracking-widest"
          />
        </div>
      </div>

      {isCourseLinked && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <Breadcrumb
            items={[
              { label: 'My Courses', to: '/courses' },
              { label: certificate.courseTitle, to: `/course/${certificate.course}` },
              { label: 'Certificate' }
            ]}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 pt-12 lg:pt-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[1000px] mb-16"
        >
          <CertificatePreview certificate={certificate} certificateRef={certificateRef} issueDate={issueDate} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-[1000px] mb-8"
        >
          <CertificateMetadata certificate={certificate} issueDate={issueDate} completionTime={completionTime} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-[1000px] grid md:grid-cols-12 gap-8 mb-16"
        >
          <CertificateAchievements certificate={certificate} />
          <CertificateSharePanel
            shareToLinkedIn={shareToLinkedIn}
            shareToTwitter={shareToTwitter}
            copyToClipboard={copyToClipboard}
            copiedLink={copiedLink}
            handleExportPDF={handleExportPDF}
            isExportingPDF={isExportingPDF}
            handleExportPNG={handleExportPNG}
            isExportingPNG={isExportingPNG}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-[1000px]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Keep Learning
            </h3>
            <Button variant="ghost" onClick={() => navigate('/roadmaps')} className="text-primary font-bold hover:bg-primary/10">
              View Roadmaps
            </Button>
          </div>
          <div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary opacity-80" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">Ready for your next challenge?</h4>
            <p className="text-[14px] font-medium text-muted-foreground mb-6 max-w-md mx-auto">
              Your AI tutor is ready to build your next custom course. Continue expanding your skills based on your recent achievement.
            </p>
            <Button onClick={() => navigate('/')} className="h-12 px-8 rounded-xl bg-foreground text-background font-bold shadow-lg hover:shadow-md hover:-translate-y-0.5 transition-all">
              Generate Next Course
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
