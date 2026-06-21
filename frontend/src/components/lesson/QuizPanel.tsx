import { useState } from 'react';
import { Brain, CheckCircle2, Loader2, Trophy, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

export default function QuizPanel({ lesson, onLessonUpdate, embedded = false }: { lesson: any, onLessonUpdate: any, embedded?: boolean }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [error, setError] = useState('');
  
  const panelClass = embedded ? '' : 'rounded-2xl border border-border bg-card p-6 shadow-sm mt-8';

  async function generateQuiz() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/courses/lessons/${lesson._id}/generate-quiz`);
      setQuestions(data.questions || []);
      setIndex(0);
      setAnswer(null);
      setChecked(false);
      setScore(0);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Could not generate quiz.');
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer() {
    if (answer === null) return;
    if (answer === questions[index].correctAnswer) setScore((current) => current + 1);
    setChecked(true);
  }

  async function nextQuestion() {
    if (index === questions.length - 1) {
      setSavingResult(true);
      try {
        const { data } = await api.post(`/courses/lessons/${lesson._id}/quiz-result`, { score });
        onLessonUpdate(data);
      } catch {
        setError('Quiz finished, but the score could not be saved.');
      } finally {
        setSavingResult(false);
      }
    }

    setIndex((current) => current + 1);
    setAnswer(null);
    setChecked(false);
  }

  if (loading) {
    return (
      <div className={`${panelClass} flex min-h-[300px] flex-col items-center justify-center gap-4 text-muted-foreground`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Designing your personalized quiz...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={panelClass}>
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
            <Brain className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="font-bold text-xl text-foreground mb-2">Test your understanding</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {error || 'Generate a quick 5-question quiz to check how well you grasped this lesson.'}
          </p>
          {lesson.quizAttempts > 0 && (
            <div className="mb-6 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              Best score: {lesson.quizBestScore}/5 across {lesson.quizAttempts} attempts
            </div>
          )}
          <Button onClick={generateQuiz} size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            <Brain className="mr-2 h-4 w-4" /> Generate Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (index >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={panelClass}>
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 border-4 shadow-xl ${passed ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-amber-500/10 border-amber-500 text-amber-500'}`}>
            <Trophy className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You scored <strong className="text-foreground">{score} out of {questions.length}</strong> ({percentage}%)
          </p>
          {error && <p className="mt-2 text-sm text-destructive mb-6">{error}</p>}
          <Button onClick={generateQuiz} variant="outline" size="lg">
            Try Another Quiz
          </Button>
        </div>
      </motion.div>
    );
  }

  const question = questions[index];
  const progress = ((index) / questions.length) * 100;

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Question {index + 1} of {questions.length}</p>
        <p className="text-xs font-bold text-primary">Score: {score}</p>
      </div>
      <Progress value={progress} className="h-1.5 mb-8" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold leading-snug text-foreground mb-8">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option: string, optionIndex: number) => {
              const isCorrect = checked && optionIndex === question.correctAnswer;
              const isWrong = checked && answer === optionIndex && !isCorrect;
              const isSelected = answer === optionIndex;

              let optionClass = 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-muted';

              if (isCorrect) optionClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
              else if (isWrong) optionClass = 'border-destructive bg-destructive/10 text-destructive';
              else if (isSelected && !checked) optionClass = 'border-primary bg-primary/10 text-primary ring-1 ring-primary';

              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => !checked && setAnswer(optionIndex)}
                  disabled={checked}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-[15px] font-medium transition-all duration-200 ${optionClass}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                    isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                    isWrong ? 'bg-destructive border-destructive text-white' :
                    isSelected && !checked ? 'bg-primary border-primary text-primary-foreground' :
                    'border-muted-foreground/30 bg-muted/50 text-muted-foreground'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : 
                     isWrong ? <XCircle className="h-5 w-5" /> : 
                     String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {checked && question.explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-[15px] leading-relaxed text-foreground/90">
                  <strong className="text-primary block mb-2">Explanation</strong>
                  {question.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={checked ? nextQuestion : checkAnswer}
              disabled={answer === null || savingResult}
              size="lg"
              className="w-full sm:w-auto min-w-[140px]"
            >
              {savingResult ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {savingResult ? 'Saving...' : checked ? (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : 'Check Answer'}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
