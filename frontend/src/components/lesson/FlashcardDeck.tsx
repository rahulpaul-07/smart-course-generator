import { ArrowLeft, ArrowRight, Layers3, Loader2, RefreshCw, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function FlashcardDeck({ lessonId, courseId, embedded = false }: { lessonId: string, courseId: string, embedded?: boolean }) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionDeck, setSessionDeck] = useState<any[]>([]);

  async function generateFlashcards() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/flashcards`);
      setFlashcards(data.flashcards);
      setSessionDeck([...data.flashcards]);
      setIndex(0);
      setShowAnswer(false);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Could not generate flashcards.');
    } finally {
      setLoading(false);
    }
  }

  function move(direction: number) {
    setIndex((current) => (current + direction + sessionDeck.length) % sessionDeck.length);
    setShowAnswer(false);
  }

  function handleConfidence(level: 'again' | 'hard' | 'good' | 'easy') {
    // Basic in-memory spaced repetition behavior for the session
    const currentCard = sessionDeck[index];
    let newDeck = [...sessionDeck];
    
    if (level === 'again' || level === 'hard') {
      // Move slightly back in the deck so they see it again soon
      newDeck.splice(index, 1);
      const insertAt = Math.min(index + 3, newDeck.length);
      newDeck.splice(insertAt, 0, currentCard);
      setSessionDeck(newDeck);
      setShowAnswer(false);
    } else {
      // Good or easy, just move to next
      move(1);
    }
  }

  if (!flashcards.length) {
    return (
      <div className={embedded ? '' : 'rounded-2xl border border-border bg-card p-6'}>
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
            <Layers3 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">AI Flashcards</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Turn this lesson into an interactive review deck. Great for memorizing key concepts.
          </p>
          {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}
          <Button onClick={generateFlashcards} disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers3 className="mr-2 h-4 w-4" />}
            {loading ? 'Creating Deck...' : 'Generate Flashcards'}
          </Button>
        </div>
      </div>
    );
  }

  const card = sessionDeck[index] || flashcards[index];
  const progress = ((index + 1) / sessionDeck.length) * 100;

  return (
    <div className={embedded ? '' : 'rounded-2xl border border-border bg-card p-6 shadow-sm'}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Card {index + 1} of {sessionDeck.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Button variant="ghost" size="icon" onClick={generateFlashcards} title="Create a new deck" className="text-muted-foreground shrink-0">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative h-64 sm:h-80 w-full perspective-[1000px] cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
        <motion.div
          className="w-full h-full preserve-3d relative"
          animate={{ rotateX: showAnswer ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front of card */}
          <Card className="absolute inset-0 backface-hidden flex flex-col p-6 sm:p-8 bg-gradient-to-br from-card to-muted/50 border-primary/20 hover:border-primary/40 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Layers3 className="h-4 w-4" /> Question
            </span>
            <div className="flex-1 flex items-center justify-center text-center">
              <h3 className="text-xl sm:text-2xl font-semibold leading-relaxed text-foreground">
                {card.front}
              </h3>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4 animate-pulse">Click to flip</p>
          </Card>

          {/* Back of card */}
          <Card 
            className="absolute inset-0 backface-hidden flex flex-col p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
            style={{ transform: 'rotateX(180deg)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Undo2 className="h-4 w-4" /> Answer
            </span>
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
                {card.back}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {showAnswer ? (
          <motion.div 
            key="confidence-buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 w-full"
          >
            <Button variant="outline" className="w-20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500 border-red-500/20" onClick={() => handleConfidence('again')}>
              Again
            </Button>
            <Button variant="outline" className="w-20 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-500 border-orange-500/20" onClick={() => handleConfidence('hard')}>
              Hard
            </Button>
            <Button variant="outline" className="w-20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500 border-emerald-500/20" onClick={() => handleConfidence('good')}>
              Good
            </Button>
            <Button variant="outline" className="w-20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500 border-blue-500/20" onClick={() => handleConfidence('easy')}>
              Easy
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="nav-buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Button variant="outline" size="lg" onClick={() => move(-1)} className="w-32">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button size="lg" onClick={() => move(1)} className="w-32">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
