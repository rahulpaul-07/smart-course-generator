import { useEffect, useRef, useState } from "react";
import { baseURL } from "../utils/api";
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Download, ArrowLeft, Loader2, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
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
  const fetchApi = useApi();

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
        backgroundColor: '#020817', // Match dark background
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
      <div className="flex flex-col justify-center items-center h-screen gap-4 text-muted-foreground bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="animate-pulse font-medium">Fetching your credential...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 text-center bg-background">
        <Award className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Certificate Not Found</h2>
        <p className="text-muted-foreground mb-6">This credential link is invalid or the certificate does not exist.</p>
        <Button onClick={() => navigate('/')} variant="outline">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-12 flex flex-col items-center">
        
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${certificate.course}`)}
            className="-ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Course
          </Button>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-sm">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer">
                  LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
                  {copiedLink ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.2)]"
            >
              {isExporting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating PDF...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[1000px]"
        >
          {/* Certificate Preview Container */}
          <Card className="p-2 sm:p-6 bg-card border-border/50 shadow-2xl relative overflow-hidden flex justify-center items-center rounded-[2rem]">
            
            {/* Actual Certificate DOM (what gets exported) */}
            <div 
              ref={certificateRef}
              className="relative w-full max-w-[900px] aspect-[1.414/1] bg-[#020817] border-[4px] sm:border-[8px] md:border-[12px] border-[#0f172a] flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-hidden shadow-inner"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(var(--primary), 0.05), rgba(var(--primary), 0.02))' }}
            >
              <div className="absolute top-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary/10 rounded-full blur-[60px] md:blur-[100px] -ml-16 md:-ml-32 -mt-16 md:-mt-32 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-cyan-500/10 rounded-full blur-[60px] md:blur-[100px] -mr-20 md:-mr-40 -mb-20 md:-mb-40 pointer-events-none"></div>
              
              <div className="border border-primary/20 w-full h-full p-4 md:p-8 flex flex-col items-center justify-center relative z-10 backdrop-blur-sm bg-background/5 min-w-0">
                <Award className="w-12 h-12 md:w-20 md:h-20 text-primary mb-4 md:mb-6 shrink-0" />
                
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-foreground mb-2 tracking-widest uppercase opacity-90 break-words w-full px-2">
                  Certificate of Completion
                </h1>
                <div className="w-16 md:w-32 h-1 md:h-1.5 bg-primary/80 rounded-full mb-6 md:mb-10 shadow-[0_0_15px_rgba(var(--primary),0.5)] shrink-0"></div>
                
                <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-2 md:mb-4 font-serif italic">This is to certify that</p>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 md:mb-8 tracking-tight break-words w-full px-2">{certificate.userName}</h2>
                
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-2 md:mb-4 font-serif italic">has successfully completed the course</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-12 max-w-2xl leading-tight break-words w-full px-2">{certificate.courseTitle}</h3>
                
                <div className="flex w-full items-center justify-between px-4 sm:px-8 mt-auto pt-4 border-t border-border/30">
                  <div className="text-left min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 uppercase tracking-wider">Date Issued</p>
                    <p className="font-mono text-xs sm:text-sm text-foreground">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="text-right min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 uppercase tracking-wider">Certificate ID</p>
                    <p className="font-mono text-[10px] sm:text-xs text-foreground bg-black/20 px-2 py-1 rounded truncate max-w-[120px] sm:max-w-none">{certificate.certificateId}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-3 left-0 w-full text-center z-20">
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider opacity-60">
                  Credential ID: {certificate.certificateId} • Verify at: {verifyUrl}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
