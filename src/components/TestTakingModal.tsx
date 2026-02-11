import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, ArrowRight, ArrowLeft, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface TestTakingModalProps {
  open: boolean;
  onClose: () => void;
  test: {
    id: string;
    title: string;
    time_limit: number;
    questions: Question[];
  };
  attemptId: string;
  userId: string;
}

const TestTakingModal = ({ open, onClose, test, attemptId, userId }: TestTakingModalProps) => {
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(test.questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(test.time_limit * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!open || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, submitted]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const pct = Math.round((correct / test.questions.length) * 100);
    setScore(pct);

    await supabase
      .from("test_attempts")
      .update({
        completed_at: new Date().toISOString(),
        score: pct,
        answers: answers as any,
      } as any)
      .eq("id", attemptId);

    toast({ title: "Test submitted!", description: `You scored ${pct}%` });
  }, [answers, submitted, test.questions, attemptId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const q = test.questions[currentQ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{test.title}</h2>
            <p className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {test.questions.length}
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
            timeLeft < 60 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-foreground"
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {!submitted ? (
          <div className="p-6 space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{answeredCount}/{test.questions.length} answered</span>
                <span>{Math.round((answeredCount / test.questions.length) * 100)}%</span>
              </div>
              <Progress value={(answeredCount / test.questions.length) * 100} className="h-2" />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">{q.question}</h3>
                <div className="space-y-3">
                  {q.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`w-full text-left rounded-xl border-2 px-5 py-4 text-sm font-medium transition-all ${
                        answers[currentQ] === i
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Question nav dots */}
            <div className="flex flex-wrap gap-2 pt-2">
              {test.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    i === currentQ
                      ? "gradient-primary text-primary-foreground"
                      : answers[i] !== null
                      ? "bg-accent/20 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <div className="flex gap-2">
                {currentQ < test.questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="gradient-primary border-0 text-primary-foreground gap-2"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  variant="destructive"
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  <Flag className="h-4 w-4" /> Submit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Test Complete!</h3>
              <p className="text-muted-foreground mt-1">Here's how you did</p>
            </div>
            <div className="text-6xl font-black text-gradient">{score}%</div>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="rounded-xl bg-accent/10 p-3">
                <div className="text-lg font-bold text-accent">
                  {answers.filter((a, i) => a === test.questions[i].answer).length}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="rounded-xl bg-destructive/10 p-3">
                <div className="text-lg font-bold text-destructive">
                  {answers.filter((a, i) => a !== null && a !== test.questions[i].answer).length}
                </div>
                <div className="text-xs text-muted-foreground">Wrong</div>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <div className="text-lg font-bold text-muted-foreground">
                  {answers.filter((a) => a === null).length}
                </div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
            </div>

            {/* Review answers */}
            <div className="text-left space-y-3 max-h-60 overflow-y-auto">
              {test.questions.map((question, i) => {
                const isCorrect = answers[i] === question.answer;
                const wasAnswered = answers[i] !== null;
                return (
                  <div key={i} className={`rounded-xl border p-4 ${isCorrect ? "border-accent/30 bg-accent/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="text-sm font-medium text-foreground mb-1">Q{i + 1}: {question.question}</div>
                    <div className="text-xs text-muted-foreground">
                      {wasAnswered ? (
                        <>Your answer: <span className={isCorrect ? "text-accent font-semibold" : "text-destructive font-semibold"}>{question.options[answers[i]!]}</span></>
                      ) : (
                        <span className="text-muted-foreground">Skipped</span>
                      )}
                      {!isCorrect && (
                        <> • Correct: <span className="text-accent font-semibold">{question.options[question.answer]}</span></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={onClose} className="gradient-primary border-0 text-primary-foreground">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestTakingModal;
