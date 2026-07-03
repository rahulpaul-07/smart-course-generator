import { ArrowLeft, ArrowRight, Layers3, Loader2, RefreshCw, Undo2 } from 'lucide-react';
import React, { useState } from 'react';
import { lessonService, type Flashcard } from '../../services/lessonService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { calculatePercentage } from '../../utils/percentages';

const FlashcardDeck = React.memo(({ lessonId, courseId, initialFlashcards = [], embedded = false, onFlashcardsUpdate }: { lessonId: string, courseId: string, initialFlashcards?: Flashcard[], embedded?: boolean, onFlashcardsUpdate?: (flashcards: Flashcard[]) => void }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionDeck, setSessionDeck] = useState<Flashcard[]>(initialFlashcards);

  async function generateFlashcards(force = false) {
    setLoading(true);
    setError('');

    const [data, fetchError] = await lessonService.generateFlashcards(courseId, lessonId, force);
    setLoading(false);

    if (fetchError) {
      setError(fetchError);
    } else if (data) {
      setFlashcards(data.flashcards);
      setSessionDeck([...data.flashcards]);
      setIndex(0);
      setShowAnswer(false);
      onFlashcardsUpdate?.(data.flashcards);
    }
  }

  function move(direction: number) {
    setIndex((current) => (current + direction + sessionDeck.length) % sessionDeck.length);
    setShowAnswer(false);
  }

  function handleConfidence(level: 'again' | 'hard' | 'good' | 'easy') {
    const currentCard = sessionDeck[index];
    const newDeck = [...sessionDeck];
    
    if (level === 'again' || level === 'hard') {
      newDeck.splice(index, 1);
      const insertAt = Math.min(index + 3, newDeck.length);
      newDeck.splice(insertAt, 0, currentCard);
      setSessionDeck(newDeck);
      setShowAnswer(false);
    } else {
      move(1);
    }
  }

  if (!flashcards.length) {
    if (embedded) {
      return (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-sm text-muted-foreground max-w-sm">
            Turn this lesson into an interactive review deck. Great for memorizing key concepts.
          </p>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button variant="outline" onClick={() => generateFlashcards()} disabled={loading} className={`w-full rounded-full shadow-sm hover:shadow-md transition-all ${loading ? 'cursor-progress opacity-90' : 'hover:-translate-y-0.5 border-primary/30 hover:bg-primary/5 hover:text-primary'}`}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers3 className="mr-2 h-4 w-4" />}
            {loading ? 'Creating Deck...' : 'Generate Flashcards'}
          </Button>
        </div>
      );
    }
    return (
      <div className="surface-card rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center text-center py-10 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)] relative z-10 animate-float">
            <Layers3 className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3 font-display relative z-10">AI Flashcards</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Turn this lesson into an interactive review deck. Great for memorizing key concepts.
          </p>
          {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}
          <Button variant="outline" onClick={() => generateFlashcards()} disabled={loading} size="lg" className={`w-full sm:w-auto relative z-10 rounded-full px-8 shadow-sm hover:shadow-md transition-all ${loading ? 'cursor-progress opacity-90' : 'hover:-translate-y-0.5 border-primary/30 hover:bg-primary/5 hover:text-primary'}`}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers3 className="mr-2 h-4 w-4" />}
            {loading ? 'Creating Deck...' : 'Generate Flashcards'}
          </Button>
        </div>
      </div>
    );
  }

  const card = sessionDeck[index] || flashcards[index];
  const progress = calculatePercentage(index + 1, sessionDeck.length);

  return (
    <div className={embedded ? '' : 'surface-card rounded-2xl p-6'}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Card {index + 1} of {sessionDeck.length}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Button variant="ghost" size="icon" onClick={() => generateFlashcards(true)} disabled={loading} title="Create a new deck" className="text-muted-foreground shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div 
        className="scene"
        onClick={() => setShowAnswer(!showAnswer)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowAnswer(!showAnswer);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={showAnswer ? "Answer: " + card.back : "Question: " + card.front}
        style={{
          perspective: '1000px',
          height: '20rem',
          cursor: 'pointer'
        }}
      >
        <div
          className="card"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform .6s ease',
            transform: showAnswer ? 'rotateY(180deg)' : 'none'
          }}
        >
          <div 
            className="card__face card__face--front flex flex-col p-6 sm:p-8 bg-card border border-border/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow"
            style={{ 
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 rounded-2xl pointer-events-none" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2 relative z-10">
              <Layers3 className="h-4 w-4" /> Question
            </span>
            <div className="flex-1 flex items-center justify-center text-center relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-foreground">
                {card.front}
              </h3>
            </div>
            <p className="text-center text-xs font-medium text-muted-foreground mt-4 relative z-10">Click to flip</p>
          </div>

          <div 
            className="card__face card__face--back flex flex-col p-6 sm:p-8 bg-primary/5 border border-primary/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            style={{ 
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)' 
            }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Undo2 className="h-4 w-4" /> Answer
            </span>
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
                {card.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAnswer ? (
        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 w-full">
          <Button variant="outline" className="w-20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-destructive/20" onClick={() => handleConfidence('again')}>
            Again
          </Button>
          <Button variant="outline" className="w-20 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning border-warning/20" onClick={() => handleConfidence('hard')}>
            Hard
          </Button>
          <Button variant="outline" className="w-20 bg-success/10 text-success hover:bg-success/20 hover:text-success border-success/20" onClick={() => handleConfidence('good')}>
            Good
          </Button>
          <Button variant="outline" className="w-20 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/20" onClick={() => handleConfidence('easy')}>
            Easy
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => move(-1)} className="w-32">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button size="lg" onClick={() => move(1)} className="w-32">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
});

export default FlashcardDeck;
