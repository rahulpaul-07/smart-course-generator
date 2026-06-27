import { useEffect, useRef, useState } from "react";
import { baseURL } from "../utils/api";
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Download, ArrowLeft, Loader2, Share2, Check, QrCode, ShieldCheck, ExternalLink, Calendar, Clock, Stamp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [isExporting, setIsExporting] = useState(false);
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
    
    setIsExporting(true);
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
      setIsExporting(false);
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
        <div className="relative flex items-center justify-center h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <p className="font-semibold text-lg animate-pulse tracking-wide">Verifying Credential...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center p-6 text-center bg-background">
        <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <ShieldCheck className="w-12 h-12 text-destructive opacity-80" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3 font-serif">Invalid Credential</h2>
        <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
          This verification link is invalid, expired, or the certificate could not be found in our secure registry.
        </p>
        <Button onClick={() => navigate('/')} className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const issueDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const completionTime = certificate.completionTime || 'Verified'; // Fallback if no specific time

  return (
    <div className="min-h-screen bg-background pb-24 selection:bg-primary/20">
      
      {/* Top Verification Banner */}
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold tracking-wide">
          <ShieldCheck className="h-4 w-4" />
          <span>OFFICIAL VERIFIED CREDENTIAL</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 lg:pt-12 flex flex-col items-center">
        
        {/* Action Header */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${certificate.course}`)}
            className="-ml-4 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft className="mr-2 w-5 h-5" /> Back to Course
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold bg-card border-border shadow-sm flex-1 sm:flex-none">
                  <Share2 className="w-4 h-4 mr-2" /> Share Credential
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer rounded-lg py-2.5 font-medium">
                  <ExternalLink className="w-4 h-4 mr-3 text-primary" /> Share on LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer rounded-lg py-2.5 font-medium">
                  <ExternalLink className="w-4 h-4 mr-3 text-sky-500" /> Share on Twitter
                </DropdownMenuItem>
                <div className="h-px bg-border/50 my-1"></div>
                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer rounded-lg py-2.5 font-medium">
                  {copiedLink ? <Check className="w-4 h-4 mr-3 text-emerald-500" /> : <Share2 className="w-4 h-4 mr-3 text-muted-foreground" />}
                  {copiedLink ? 'Link Copied!' : 'Copy Verification Link'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="h-11 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex-1 sm:flex-none"
            >
              {isExporting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing PDF...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[1000px] mb-12"
        >
          {/* Certificate Wrapper for Shadow/Border */}
          <div className="relative p-2 sm:p-4 md:p-6 bg-gradient-to-br from-border/50 to-background rounded-[1rem] shadow-2xl flex justify-center items-center">
            
            {/* The Actual Exportable Certificate DOM */}
            <div 
              ref={certificateRef}
              className="relative w-full max-w-[900px] aspect-[1.414/1] bg-[#FAFAFA] text-[#111] overflow-hidden flex flex-col border-[1px] border-[#E0E0E0]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Premium Border Design */}
              <div className="absolute inset-2 md:inset-4 border-[2px] border-[#C5A866] opacity-80 pointer-events-none"></div>
              <div className="absolute inset-[10px] md:inset-[20px] border-[1px] border-[#C5A866] opacity-40 pointer-events-none"></div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 md:w-32 md:h-32 bg-gradient-to-br from-[#C5A866]/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-gradient-to-tl from-[#C5A866]/20 to-transparent pointer-events-none"></div>

              {/* Certificate Content */}
              <div className="relative z-10 w-full h-full p-6 md:p-14 flex flex-col items-center text-center justify-between">
                
                {/* Header */}
                <div className="w-full flex justify-between items-start">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <Brain className="h-6 w-6 text-[#C5A866]" />
                      <span className="font-bold text-sm md:text-lg tracking-wider text-[#333]">COURSE AI PRO</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[8px] md:text-xs font-semibold uppercase tracking-widest text-[#777] mb-1">Credential ID</span>
                    <span className="font-mono text-[10px] md:text-sm font-bold text-[#111]">{certificate.certificateId}</span>
                  </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[#111] mb-6 md:mb-10 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Certificate of Completion
                  </h1>
                  
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.3em] text-[#777] mb-4 md:mb-6">
                    This certifies that
                  </p>
                  
                  <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111] mb-4 md:mb-6 uppercase tracking-wider border-b-2 border-[#C5A866] pb-2 md:pb-4 px-8 inline-block max-w-[90%] truncate">
                    {certificate.userName}
                  </h2>
                  
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-[#777] mb-4 md:mb-6 mt-2">
                    Has successfully completed the program
                  </p>
                  
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#111] leading-tight max-w-[80%] mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {certificate.courseTitle}
                  </h3>
                </div>

                {/* Footer / Signatures / Seals */}
                <div className="w-full flex justify-between items-end mt-4">
                  
                  {/* Left: QR Code & Issue Date */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-white p-1 md:p-1.5 border border-[#E0E0E0] shadow-sm flex items-center justify-center">
                      <QrCode className="w-full h-full text-[#333]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#777]">Issued On</p>
                      <p className="text-[10px] md:text-sm font-bold text-[#111]">{issueDate}</p>
                    </div>
                  </div>

                  {/* Center: Gold Seal */}
                  <div className="absolute bottom-[30px] md:bottom-[50px] left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-90">
                    <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-2 border-[#C5A866] bg-gradient-to-br from-[#E2C785] to-[#B3934A] shadow-[0_4px_15px_rgba(197,168,102,0.4)] flex items-center justify-center relative">
                      <div className="w-[90%] h-[90%] rounded-full border border-[#FFF]/30 flex flex-col items-center justify-center">
                        <Stamp className="h-4 w-4 md:h-8 md:w-8 text-[#FFF] opacity-80 mb-1" />
                        <span className="text-[5px] md:text-[8px] font-bold text-[#FFF] tracking-widest uppercase">Verified</span>
                      </div>
                      {/* Ribbon tails */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-[-1]">
                        <div className="w-2 h-4 md:w-4 md:h-8 bg-[#9A7D3C] clip-ribbon-left"></div>
                        <div className="w-2 h-4 md:w-4 md:h-8 bg-[#9A7D3C] clip-ribbon-right"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Signature */}
                  <div className="flex flex-col items-end">
                    <div className="w-24 md:w-40 border-b border-[#333] mb-2 md:mb-3 flex justify-center pb-2">
                      <span className="font-serif text-lg md:text-3xl text-[#111] italic" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>AI Engine</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[#777]">Instructor</p>
                      <p className="text-[10px] md:text-sm font-bold text-[#111]">CourseAI Automated</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Metadata Dashboard */}
        <div className="w-full max-w-[1000px] grid sm:grid-cols-2 md:grid-cols-4 gap-4 animate-enter-delay">
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
              <p className="font-bold text-foreground">Verified Authentic</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Calendar className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Issue Date</p>
              <p className="font-bold text-foreground">{issueDate}</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Completion</p>
              <p className="font-bold text-foreground">{completionTime}</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><QrCode className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">ID Code</p>
              <p className="font-mono text-sm font-bold text-foreground truncate max-w-[100px]">{certificate.certificateId}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
