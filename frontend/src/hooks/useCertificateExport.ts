import { useState } from 'react';
import type { Certificate } from '../types';

export function useCertificateExport(certificateRef: React.RefObject<HTMLDivElement | null>, certificate: Certificate | null) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
      const verifyUrl = `${window.location.origin}/certificate/${certificate?.certificateId}`;
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
    const text = `I just earned a certificate in ${certificate?.courseTitle} on CourseAI!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verifyUrl)}`, '_blank');
  };

  return {
    isExportingPDF,
    isExportingPNG,
    copiedLink,
    handleExportPDF,
    handleExportPNG,
    copyToClipboard,
    shareToLinkedIn,
    shareToTwitter
  };
}
