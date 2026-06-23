import { Check, FlaskConical, Loader2, RefreshCw, TerminalSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PracticeLab({ lessonId, courseId, embedded = false }: { lessonId: string, courseId: string, embedded?: boolean }) {
  const [lab, setLab] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  async function generateLab() {
    setLoading(true);
    setError('');
    setShowHint(false);

    try {
      const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/lab`);
      setLab(data.lab);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Could not create a practice lab.');
    } finally {
      setLoading(false);
    }
  }

  if (!lab) {
    return (
      <div className={embedded ? '' : 'rounded-2xl border border-border bg-card p-6'}>
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
            <FlaskConical className="h-8 w-8 text-cyan-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Practice Lab</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Generate a realistic mini-project or hands-on challenge to apply what you've learned.
          </p>
          {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}
          <Button onClick={generateLab} disabled={loading} size="lg" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
            {loading ? 'Designing Lab...' : 'Create Practice Lab'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden border-cyan-500/20 ${embedded ? 'border-none shadow-none bg-transparent' : ''}`}>
      <CardHeader className="bg-cyan-500/5 border-b border-border/50 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/10">
                <TerminalSquare className="mr-1 h-3 w-3" /> Hands-on Lab
              </Badge>
              <Badge variant="secondary">20-40 mins</Badge>
            </div>
            <CardTitle className="text-2xl leading-tight text-foreground">{lab.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={generateLab} className="text-muted-foreground shrink-0" title="Generate new lab">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lab.brief}</p>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        <div>
          <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">1</span>
            Implementation Steps
          </h4>
          <ol className="space-y-3">
            {lab.steps.map((step: string, index: number) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5 text-sm text-foreground"
              >
                <span className="font-semibold text-primary mt-0.5">{index + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </motion.li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-xs font-bold text-emerald-500">2</span>
            Definition of Done
          </h4>
          <ul className="space-y-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            {lab.successCriteria.map((item: string, index: number) => (
              <li key={index} className="flex gap-3 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => setShowHint(!showHint)} className="w-full sm:w-auto">
            <AlertCircle className="mr-2 h-4 w-4" />
            {showHint ? 'Hide Hint' : 'Need a hint?'}
          </Button>
          
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-500/90 leading-relaxed">
                  {lab.hint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
