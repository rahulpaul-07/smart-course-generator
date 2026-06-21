import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, Trophy, Sparkles, RotateCcw } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FinalTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fetchApi = useApi();
  const { width, height } = useWindowSize();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null); // { score, passed, certificateId }

  useEffect(() => {
    async function loadTest() {
      try {
        let data = await fetchApi(`/courses/${id}`);
        if (!data.finalTest || !data.finalTest.questions || data.finalTest.questions.length === 0) {
          const genResult = await fetchApi(`/courses/${id}/generate-test`, {
            method: 'POST',
          });
          data = { ...data, finalTest: genResult.finalTest };
        }
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [id, fetchApi]);

  const handleSubmit = async () => {
    const questions = course.finalTest.questions;
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount < questions.length) {
      if (!window.confirm(`You have only answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const answersArray = questions.map((_: any, idx: number) => answers[idx] !== undefined ? answers[idx] : -1);
      
      const res = await fetchApi(`/certificates/claim/${id}`, {
        method: 'POST',
        body: JSON.stringify({ answers: answersArray })
      });

      setResult({
        score: res.averageScore,
        passed: res.passed,
        certificateId: res.certificateId
      });
    } catch (err: any) {
      setResult({
        score: null,
        passed: false,
        error: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="animate-pulse font-medium">Preparing your final certification test...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <RotateCcw className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
        <Button onClick={() => navigate(`/course/${id}`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
        </Button>
      </div>
    );
  }

  const questions = course.finalTest.questions;

  return (
    <div className="min-h-screen bg-background pb-20">
      {result && result.passed && <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.15} />}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/course/${id}`)}
          className="mb-8 -ml-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Course
        </Button>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-10 p-10 bg-card border border-border rounded-3xl text-center relative overflow-hidden shadow-2xl"
            >
              <div className={`absolute inset-0 opacity-20 pointer-events-none ${result.passed ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/40 via-background to-background' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/40 via-background to-background'}`} />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 border-4 shadow-2xl ${
                  result.passed 
                    ? 'bg-card border-emerald-500/50 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                    : 'bg-card border-amber-500/50 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                }`}>
                  {result.passed ? <Trophy className="w-14 h-14" /> : <RotateCcw className="w-14 h-14" />}
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                  {result.passed ? 'Congratulations!' : 'Keep Learning!'}
                </h1>
                
                <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
                  {result.passed 
                    ? `You passed the Final Certification Test with a brilliant score of ${result.score}%!` 
                    : `You scored ${result.score !== null ? result.score : 'under 70'}%, falling just short of the 70% passing mark. Review the course material and try again!`}
                </p>

                <div className="flex gap-4">
                  {result.passed ? (
                    <Button 
                      size="lg"
                      onClick={() => navigate(`/certificate/${result.certificateId}`)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] h-14 px-8 text-lg rounded-xl"
                    >
                      <Sparkles className="w-5 h-5 mr-2" /> View Certificate
                    </Button>
                  ) : (
                    <Button 
                      size="lg"
                      onClick={() => { setResult(null); setAnswers({}); }}
                      className="h-14 px-8 text-lg rounded-xl"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" /> Try Again
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Final Certification Test</h1>
                <p className="text-xl text-muted-foreground font-medium mb-2">{course.title}</p>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  Pass mark: 70%
                </div>
              </div>

              <div className="space-y-8">
                {questions.map((q: any, qIdx: number) => {
                  const selectedAns = answers[qIdx];

                  return (
                    <Card key={qIdx} className="overflow-hidden border-border/50 shadow-md">
                      <CardContent className="p-6 sm:p-8">
                        <h3 className="text-xl font-bold text-foreground mb-6 flex gap-4 leading-relaxed">
                          <span className="text-primary shrink-0">{qIdx + 1}.</span> 
                          <span>{q.question}</span>
                        </h3>
                        <div className="space-y-3 pl-0 sm:pl-8">
                          {q.options.map((opt: string, oIdx: number) => {
                            const isSelected = selectedAns === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 text-[15px] font-medium flex items-center gap-4 ${
                                  isSelected 
                                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-sm" 
                                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted"
                                }`}
                              >
                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                                  isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className="leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                  className="h-14 px-10 text-lg rounded-xl shadow-xl shadow-primary/20"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                  {submitting ? 'Submitting...' : 'Submit Final Test'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
