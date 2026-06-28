import React from 'react';
import { ShieldCheck, Calendar, Clock, QrCode } from 'lucide-react';

interface CertificateMetadataProps {
  certificate: any;
  issueDate: string;
  completionTime: string;
}

export function CertificateMetadata({ certificate, issueDate, completionTime }: CertificateMetadataProps) {
  return (
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
  );
}
