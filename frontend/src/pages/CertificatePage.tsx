import { useEffect, useRef, useState } from "react";
import { baseURL } from "../utils/api";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, ArrowLeft, Loader2, Share2, Check, QrCode, ShieldCheck, 
  ExternalLink, Calendar, Clock, Stamp, Brain, Award, GraduationCap, 
  Target, Image as ImageIcon, Briefcase, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${baseURL}/certificates/${id}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          let msg = "Certificate not found";
          try {
            const json = JSON.parse(text);
            if (json.error) msg = json.error;
          } catch (e) {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then(data => {
        setCertificate(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleExportPDF = async () => {
    if (!certificateRef.current) return;
    setIsExportingPDF(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      const verifyUrl = `${window.location.origin}/certificate/${certificate.certificateId}`;
      pdf.link(0, 0, canvas.width / 2, canvas.height / 2, { url: verifyUrl });
      
      pdf.save(`${certificate?.courseTitle?.replace(/\s+/g, '_') || 'Course'}_Certificate.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportPNG = async () => {
    if (!certificateRef.current) return;
    setIsExportingPNG(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${certificate?.courseTitle?.replace(/\s+/g, '_') || 'Course'}_Certificate.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExportingPNG(false);
    }
  };

  const verifyUrl = `${window.location.origin}/certificate/${certificate?.certificateId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = `I just earned a certificate in ${certificate.courseTitle} on CourseAI Pro!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verifyUrl)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-6 text-foreground bg-background">
        <div className="relative flex items-center justify-center h-24 w-24">
          <div className="absolute inset-0 rounded-full border-4 border-muted/40"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-6 w-48 bg-muted animate-pulse rounded-md"></div>
          <div className="h-4 w-32 bg-muted/60 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center p-6 text-center bg-background">
        <div className="h-32 w-32 rounded-3xl bg-destructive/10 flex items-center justify-center mb-8 border border-destructive/20 shadow-inner">
          <ShieldCheck className="w-16 h-16 text-destructive opacity-80" />
        </div>
        <h2 className="text-4xl font-extrabold text-foreground mb-4 font-serif">Invalid Credential</h2>
        <p className="text-[15px] text-muted-foreground font-medium mb-10 max-w-md leading-relaxed">
          This verification link is invalid, expired, or the certificate could not be found in our secure registry.
        </p>
        <Button onClick={() => navigate('/')} className="h-12 px-10 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const completionTime = certificate.completionTime || 'Self-Paced';

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* Premium Hero Banner */}
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 py-3 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            <span>Official Verified Credential</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(certificate.course ? `/course/${certificate.course}` : '/')}
            className="hidden sm:flex text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold hover:bg-emerald-500/10 h-8 text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="mr-2 w-3.5 h-3.5" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 lg:pt-16 flex flex-col items-center">
        
        {/* Certificate Display Area */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[1000px] mb-16"
        >
          {/* Certificate Wrapper for Shadow/Border */}
          <div className="relative p-2 sm:p-4 md:p-6 bg-gradient-to-br from-border/50 to-background rounded-[2rem] shadow-2xl flex justify-center items-center">
            
            {/* The Actual Exportable Certificate DOM */}
            <div 
              ref={certificateRef}
              className="relative w-full max-w-[900px] aspect-[1.414/1] bg-[#FAFAFA] text-[#111] overflow-hidden flex flex-col border-[1px] border-[#E0E0E0] shadow-sm"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100\\'%20height=\\'100\\'%20xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noise)\\' opacity=\\'0.03\\'/%3E%3C/svg%3E')"
              }}
            >
              {/* Premium Border Design */}
              <div className="absolute inset-[15px] md:inset-[25px] border-[2px] border-[#1F2937] pointer-events-none"></div>
              <div className="absolute inset-[20px] md:inset-[30px] border-[1px] border-[#C5A866] pointer-events-none"></div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-[15px] md:top-[25px] left-[15px] md:left-[25px] w-8 h-8 md:w-12 md:h-12 border-t-4 border-l-4 border-[#C5A866] pointer-events-none"></div>
              <div className="absolute top-[15px] md:top-[25px] right-[15px] md:right-[25px] w-8 h-8 md:w-12 md:h-12 border-t-4 border-r-4 border-[#C5A866] pointer-events-none"></div>
              <div className="absolute bottom-[15px] md:bottom-[25px] left-[15px] md:left-[25px] w-8 h-8 md:w-12 md:h-12 border-b-4 border-l-4 border-[#C5A866] pointer-events-none"></div>
              <div className="absolute bottom-[15px] md:bottom-[25px] right-[15px] md:right-[25px] w-8 h-8 md:w-12 md:h-12 border-b-4 border-r-4 border-[#C5A866] pointer-events-none"></div>

              {/* Top Graphic */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-2 bg-gradient-to-r from-transparent via-[#C5A866] to-transparent opacity-80 pointer-events-none"></div>

              {/* Certificate Content */}
              <div className="relative z-10 w-full h-full p-8 md:p-16 flex flex-col items-center text-center justify-between">
                
                {/* Header */}
                <div className="w-full flex justify-between items-start">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-[#1F2937] rounded-lg flex items-center justify-center shadow-lg">
                        <Brain className="h-5 w-5 md:h-6 md:w-6 text-[#C5A866]" />
                      </div>
                      <span className="font-extrabold text-sm md:text-xl tracking-[0.2em] text-[#1F2937] uppercase">Course AI Pro</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#777] mb-1">Credential ID</span>
                    <span className="font-mono text-[10px] md:text-sm font-bold text-[#111]">{certificate.certificateId}</span>
                  </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold text-[#1F2937] mb-6 md:mb-10 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Certificate of Completion
                  </h1>
                  
                  <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.4em] text-[#C5A866] mb-4 md:mb-8">
                    This is to proudly certify that
                  </p>
                  
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1F2937] mb-6 md:mb-8 tracking-wider border-b border-[#E5E7EB] pb-2 md:pb-4 px-12 inline-block max-w-[95%] truncate">
                    {certificate.userName}
                  </h2>
                  
                  <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-[#777] mb-4 md:mb-8 mt-2 max-w-[80%] leading-relaxed">
                    has successfully completed the comprehensive program in
                  </p>
                  
                  <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-[#1F2937] leading-tight max-w-[85%] mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {certificate.courseTitle}
                  </h3>
                </div>

                {/* Footer / Signatures / Seals */}
                <div className="w-full flex justify-between items-end mt-8 relative">
                  
                  {/* Left: Issue Date */}
                  <div className="flex flex-col items-start">
                    <div className="text-left mb-2 md:mb-4">
                      <p className="text-[10px] md:text-sm font-bold text-[#111] border-b border-[#333] pb-1 w-24 md:w-32">{issueDate}</p>
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#777] mt-1">Date Issued</p>
                    </div>
                  </div>

                  {/* Center: Gold Seal */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-95">
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-[3px] border-[#C5A866] bg-gradient-to-br from-[#F3E7C9] via-[#C5A866] to-[#997A35] shadow-2xl flex items-center justify-center relative overflow-hidden">
                      <div className="w-[85%] h-[85%] rounded-full border-[2px] border-dashed border-[#FFF]/60 flex flex-col items-center justify-center">
                        <Award className="h-6 w-6 md:h-10 md:w-10 text-[#FFF] opacity-90 mb-1" />
                        <span className="text-[6px] md:text-[9px] font-bold text-[#FFF] tracking-[0.2em] uppercase">Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Signature */}
                  <div className="flex flex-col items-end">
                    <div className="text-right mb-2 md:mb-4">
                      <div className="w-24 md:w-32 border-b border-[#333] pb-1 flex justify-end">
                        <span className="font-serif text-lg md:text-2xl text-[#111] italic pr-2" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>AI Engine</span>
                      </div>
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#777] mt-1">Lead Instructor</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-[1000px] mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-card/60 backdrop-blur-md border border-border/60 rounded-[1.5rem] p-6 shadow-lg flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 mb-4 ring-4 ring-emerald-500/5">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-black text-foreground">Verified</p>
            </div>
            
            <div className="md:col-span-3 bg-card/60 backdrop-blur-md border border-border/60 rounded-[1.5rem] p-6 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 h-full">
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Issue Date</p>
                  <p className="font-bold text-foreground">{issueDate}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Duration</p>
                  <p className="font-bold text-foreground">{completionTime}</p>
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><QrCode className="h-3 w-3" /> Credential ID</p>
                  <p className="font-mono text-sm font-bold text-foreground truncate">{certificate.certificateId}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Statistics & Sharing Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-[1000px] grid md:grid-cols-12 gap-8 mb-16"
        >
          {/* Achievement Statistics */}
          <div className="md:col-span-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Course Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-background border border-border/50 rounded-2xl p-4 shadow-sm">
                <Clock className="w-5 h-5 text-primary mb-3 opacity-80" />
                <p className="text-2xl font-black text-foreground mb-1">12<span className="text-sm text-muted-foreground font-medium">h</span></p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Study Time</p>
              </div>
              <div className="bg-background border border-border/50 rounded-2xl p-4 shadow-sm">
                <GraduationCap className="w-5 h-5 text-emerald-500 mb-3 opacity-80" />
                <p className="text-2xl font-black text-foreground mb-1">100<span className="text-sm text-muted-foreground font-medium">%</span></p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lessons</p>
              </div>
              <div className="bg-background border border-border/50 rounded-2xl p-4 shadow-sm">
                <Briefcase className="w-5 h-5 text-amber-500 mb-3 opacity-80" />
                <p className="text-2xl font-black text-foreground mb-1">4</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects</p>
              </div>
              <div className="bg-background border border-border/50 rounded-2xl p-4 shadow-sm">
                <Target className="w-5 h-5 text-cyan-500 mb-3 opacity-80" />
                <p className="text-2xl font-black text-foreground mb-1">98<span className="text-sm text-muted-foreground font-medium">/100</span></p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interview</p>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Share Credential</h3>
            <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-[1.5rem] p-4 shadow-lg flex flex-col gap-2">
              <Button onClick={shareToLinkedIn} className="w-full h-11 justify-start font-bold bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl">
                <ExternalLink className="w-4 h-4 mr-3 opacity-80" /> Add to LinkedIn
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={shareToTwitter} variant="outline" className="w-full h-11 font-bold rounded-xl border-border bg-background hover:bg-muted">
                  <ExternalLink className="w-4 h-4 mr-2 text-[#1DA1F2]" /> Twitter
                </Button>
                <Button onClick={copyToClipboard} variant="outline" className="w-full h-11 font-bold rounded-xl border-border bg-background hover:bg-muted">
                  {copiedLink ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Share2 className="w-4 h-4 mr-2 text-muted-foreground" />}
                  {copiedLink ? 'Copied' : 'Link'}
                </Button>
              </div>
              <div className="h-px bg-border/50 my-2"></div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleExportPDF} disabled={isExportingPDF} variant="secondary" className="w-full h-11 font-bold rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                  {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
                </Button>
                <Button onClick={handleExportPNG} disabled={isExportingPNG} variant="secondary" className="w-full h-11 font-bold rounded-xl bg-muted text-foreground hover:bg-muted/80">
                  {isExportingPNG ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ImageIcon className="w-4 h-4 mr-2" /> PNG</>}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Courses */}
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
          <div className="bg-card/40 backdrop-blur-md border border-border/60 rounded-[1.5rem] p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary opacity-80" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-2">Ready for your next challenge?</h4>
            <p className="text-[14px] font-medium text-muted-foreground mb-6 max-w-md mx-auto">
              Your AI tutor is ready to build your next custom course. Continue expanding your skills based on your recent achievement.
            </p>
            <Button onClick={() => navigate('/')} className="h-12 px-8 rounded-xl bg-foreground text-background font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Generate Next Course
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
