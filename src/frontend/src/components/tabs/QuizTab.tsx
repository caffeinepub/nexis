import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ChevronRight,
  HelpCircle,
  Loader2,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "../../backend.d";
import { useQuizzesBySession } from "../../hooks/useQueries";

interface Props {
  sessionId: string;
}

export function QuizTab({ sessionId }: Props) {
  const { data: quizzes = [], isLoading } = useQuizzesBySession(sessionId);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions: QuizQuestion[] = quizzes.flatMap((q) => q.questions);

  const handleReset = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShortAnswer("");
    setRevealed(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <HelpCircle size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No quiz questions yet</p>
        <p className="text-sm opacity-60">
          Quiz will appear here after processing
        </p>
      </div>
    );
  }

  if (quizComplete) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12 gradient-mesh">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow animate-float">
            <Trophy size={36} className="text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Quiz Complete!
          </h2>
          <p className="text-muted-foreground mb-6">
            You scored{" "}
            <span className="text-foreground font-semibold">{score}</span> out
            of{" "}
            <span className="text-foreground font-semibold">
              {questions.length}
            </span>
          </p>
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full -rotate-90"
              aria-label="Score circle"
              role="img"
            >
              <title>Score</title>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="oklch(var(--muted))"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="oklch(var(--primary))"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-foreground">
                {pct}%
              </span>
            </div>
          </div>
          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-emerald-400">
                {score}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-red-400">
                {questions.length - score}
              </p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>
          <Button onClick={handleReset} className="gap-2">
            <RotateCcw size={16} />
            Restart Quiz
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const progressPct = (currentQ / questions.length) * 100;

  const handleMCQSelect = (option: string) => {
    if (revealed) return;
    setSelectedAnswer(option);
  };

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      const isCorrect =
        question.type === "short"
          ? shortAnswer
              .toLowerCase()
              .trim()
              .includes(question.answer.toLowerCase().trim().split(" ")[0])
          : selectedAnswer === question.answer;
      if (isCorrect) setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShortAnswer("");
      setRevealed(false);
    }
  };

  const isCorrect =
    selectedAnswer === question.answer ||
    (question.type === "short" &&
      shortAnswer
        .toLowerCase()
        .trim()
        .includes(question.answer.toLowerCase().trim().split(" ")[0]));

  return (
    <div className="flex flex-col h-full">
      {/* Score bar */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Question {currentQ + 1}
          </span>
          <span className="text-muted-foreground text-sm">
            / {questions.length}
          </span>
        </div>
        <Progress value={progressPct} className="flex-1 h-1.5" />
        <div className="flex items-center gap-1 text-sm">
          <CheckCircle size={14} className="text-emerald-400" />
          <span className="font-semibold text-foreground">{score}</span>
          <span className="text-muted-foreground">/ {currentQ}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1.5 text-xs"
        >
          <RotateCcw size={12} />
          Restart
        </Button>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Type badge */}
          <div className="mb-4">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {question.type === "mcq"
                ? "Multiple Choice"
                : question.type === "truefalse"
                  ? "True / False"
                  : "Short Answer"}
            </span>
          </div>

          {/* Question text */}
          <h2 className="font-display text-xl font-semibold text-foreground mb-6 leading-snug">
            {question.question}
          </h2>

          {/* MCQ options */}
          {(question.type === "mcq" || question.type === "multiple_choice") && (
            <div className="space-y-3">
              {question.options.map((opt: string, i: number) => {
                const isSelected = selectedAnswer === opt;
                const isAnswer = opt === question.answer;
                let optStyle =
                  "border-border bg-card hover:border-primary/50 hover:bg-primary/5";
                if (revealed) {
                  if (isAnswer)
                    optStyle =
                      "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                  else if (isSelected && !isAnswer)
                    optStyle = "border-red-500/40 bg-red-500/8 text-red-300";
                  else optStyle = "border-border bg-card opacity-50";
                } else if (isSelected) {
                  optStyle = "border-primary bg-primary/10";
                }

                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleMCQSelect(opt)}
                    disabled={revealed}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3",
                      optStyle,
                    )}
                  >
                    <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {revealed && isAnswer && (
                      <CheckCircle
                        size={16}
                        className="ml-auto text-emerald-400 shrink-0"
                      />
                    )}
                    {revealed && isSelected && !isAnswer && (
                      <XCircle
                        size={16}
                        className="ml-auto text-red-400 shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False */}
          {question.type === "truefalse" || question.type === "true_false" ? (
            <div className="flex gap-4">
              {["True", "False"].map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isAnswer = opt === question.answer;
                let style = "border-border bg-card hover:border-primary/50";
                if (revealed) {
                  if (isAnswer)
                    style =
                      "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                  else if (isSelected)
                    style = "border-red-500/40 bg-red-500/10 text-red-300";
                } else if (isSelected) style = "border-primary bg-primary/10";

                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleMCQSelect(opt)}
                    disabled={revealed}
                    className={cn(
                      "flex-1 py-6 rounded-xl border text-xl font-display font-bold transition-all duration-200",
                      style,
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Short answer */}
          {question.type === "short" || question.type === "short_answer" ? (
            <div className="space-y-3">
              <Textarea
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={revealed}
                className="bg-muted/50 min-h-[100px]"
              />
              {revealed && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">
                    Correct Answer
                  </p>
                  <p className="text-sm text-foreground">{question.answer}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Explanation */}
          {revealed && question.explanation && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] text-primary font-bold">i</span>
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Explanation
                </p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Feedback banner */}
          {revealed && (
            <div
              className={cn(
                "mt-4 p-3 rounded-xl flex items-center gap-2 animate-fade-in-up",
                isCorrect
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-red-500/10 border border-red-500/20",
              )}
            >
              {isCorrect ? (
                <>
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    Correct! Great job.
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    Not quite — review the explanation above.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            {!revealed ? (
              <Button
                onClick={handleReveal}
                disabled={
                  question.type === "short" || question.type === "short_answer"
                    ? !shortAnswer.trim()
                    : !selectedAnswer
                }
                className="flex-1 gap-2"
              >
                Reveal Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 gradient-brand text-white border-0 hover:opacity-90"
              >
                {currentQ + 1 >= questions.length
                  ? "See Results"
                  : "Next Question"}
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
