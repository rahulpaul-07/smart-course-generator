import { useState, useEffect } from 'react';
import { Award, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/certificates/mine/all')
      .then(res => {
        setCertificates(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <PageContainer>
      <SectionHeader 
        title="Your Certificates" 
        description="Verifiable credentials for your completed courses."
      />

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-2xl border-dashed border-2 border-slate-700/50 mt-8">
          <div className="mb-4 rounded-full bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
            <Award className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">No certificates yet</h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">Complete a final test to earn one and prove your skills.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            <ArrowRight className="mr-2 h-4 w-4" /> Go to Courses
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {certificates.map((cert: any) => (
            <div key={cert._id} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
              <Award className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="font-bold text-white mb-2">{cert.courseTitle || 'Course Certificate'}</h3>
              <button 
                onClick={() => navigate(`/certificate/${cert.certificateId}`)}
                className="btn-secondary w-full mt-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> View Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
