import React from 'react';
import { Brain, Award } from 'lucide-react';

interface CertificatePreviewProps {
  certificate: any;
  certificateRef: React.RefObject<HTMLDivElement>;
  issueDate: string;
}

export function CertificatePreview({ certificate, certificateRef, issueDate }: CertificatePreviewProps) {
  return (
    <div className="relative p-2 sm:p-4 md:p-6 bg-gradient-to-br from-border/50 to-background rounded-[2rem] shadow-2xl flex justify-center items-center">
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
  );
}
