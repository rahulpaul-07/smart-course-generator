import React from 'react';
import { ExternalLink, Check, Share2, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateSharePanelProps {
  shareToLinkedIn: () => void;
  shareToTwitter: () => void;
  copyToClipboard: () => void;
  copiedLink: boolean;
  handleExportPDF: () => void;
  isExportingPDF: boolean;
  handleExportPNG: () => void;
  isExportingPNG: boolean;
}

export function CertificateSharePanel({
  shareToLinkedIn,
  shareToTwitter,
  copyToClipboard,
  copiedLink,
  handleExportPDF,
  isExportingPDF,
  handleExportPNG,
  isExportingPNG
}: CertificateSharePanelProps) {
  return (
    <div className="md:col-span-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Share Credential</h3>
      <div className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
        <Button variant="secondary" onClick={shareToLinkedIn} className="w-full h-11 justify-start font-bold bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-xl">
          <ExternalLink className="w-4 h-4 mr-3" /> Add to LinkedIn
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={shareToTwitter} variant="outline" className="w-full h-11 font-bold rounded-xl border-border bg-background hover:bg-muted">
            <ExternalLink className="w-4 h-4 mr-2 text-[#1DA1F2]" /> Twitter
          </Button>
          <Button onClick={copyToClipboard} variant="outline" className="w-full h-11 font-bold rounded-xl border-border bg-background hover:bg-muted">
            {copiedLink ? <Check className="w-4 h-4 mr-2 text-success" /> : <Share2 className="w-4 h-4 mr-2 text-muted-foreground" />}
            {copiedLink ? 'Copied' : 'Link'}
          </Button>
        </div>
        <div className="h-px bg-border/50 my-2"></div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleExportPDF} disabled={isExportingPDF} className={`w-full h-11 font-bold rounded-xl shadow-sm ${isExportingPDF ? 'cursor-progress' : ''}`}>
            {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" /> PDF</>}
          </Button>
          <Button onClick={handleExportPNG} disabled={isExportingPNG} variant="secondary" className={`w-full h-11 font-bold rounded-xl bg-muted text-foreground hover:bg-muted/80 ${isExportingPNG ? 'cursor-progress' : ''}`}>
            {isExportingPNG ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ImageIcon className="w-4 h-4 mr-2" /> PNG</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
