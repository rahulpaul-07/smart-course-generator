import { useState, useEffect } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/button';

import { ErrorState } from '../components/ui/ErrorState';
import { CertificatesGridSkeleton } from '../components/certificate/CertificateSkeleton';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchCertificates = () => {
    setLoading(true);
    setError(false);
    certificateService.getAllCertificates()
      .then(([data, err]) => {
        if (err) setError(true);
        else setCertificates((data as any) || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <PageContainer>
      <SectionHeader 
        title="Your Certificates" 
        description="Verifiable credentials for your completed courses."
      />

      {loading ? (
        <CertificatesGridSkeleton />
      ) : error ? (
        <div className="py-16">
          <ErrorState 
            title="Unable to load certificates" 
            description="Please try again later." 
            onRetry={fetchCertificates} 
          />
        </div>
      ) : certificates.length === 0 ? (
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
