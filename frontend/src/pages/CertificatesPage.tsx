import { useState, useEffect } from 'react';
import { Award, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/button';

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
        <EmptyState
          icon={Award}
          title="No Certificates Yet"
          description="Complete a final test to earn a verifiable certificate and prove your skills."
          action={
            <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
              Go to Courses
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {certificates.map((cert: any) => (
            <div key={cert._id} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
              <Award className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="font-bold text-foreground mb-2">{cert.courseTitle || 'Course Certificate'}</h3>
              <Button 
                variant="secondary"
                onClick={() => navigate(`/certificate/${cert.certificateId}`)}
                className="w-full mt-4"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> View Certificate
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
