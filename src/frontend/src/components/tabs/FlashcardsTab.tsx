import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Timer,
} from "lucide-react";
import { useState } from "react";
import type { Flashcard, FlashcardTopic } from "../../backend.d";
import { useFlashcardTopicsBySession } from "../../hooks/useQueries";

interface Props {
  sessionId: string;
}

const cardTypeColors: Record<string, string> = {
  definitions: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  conceptual: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  application: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  important: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  tricky: "bg-red-500/10 text-red-400 border-red-500/20",
};

const difficultyColors: Record<string, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-red-400",
};

type StudyMode = "browse" | "timed" | "spaced";

interface TopicBlockState {
  isOpen: boolean;
  cardIndex: number;
  isFlipped: boolean;
  correctCount: number;
  reviewedCards: Set<number>;
  difficultyFilter: string;
  typeFilter: string;
  studyMode: StudyMode;
}

function FlashcardBlock({
  topic,
  isWeakest,
}: { topic: FlashcardTopic; isWeakest: boolean }) {
  const [state, setState] = useState<TopicBlockState>({
    isOpen: true,
    cardIndex: 0,
    isFlipped: false,
    correctCount: 0,
    reviewedCards: new Set(),
    difficultyFilter: "all",
    typeFilter: "all",
    studyMode: "browse",
  });

  const filteredCards = topic.cards.filter((c: Flashcard) => {
    const matchDiff =
      state.difficultyFilter === "all" ||
      c.difficulty === state.difficultyFilter;
    const matchType =
      state.typeFilter === "all" ||
      c.cardType.toLowerCase() === state.typeFilter;
    return matchDiff && matchType;
  });

  const currentCard = filteredCards[state.cardIndex];
  const progress =
    topic.cards.length > 0
      ? (state.reviewedCards.size / topic.cards.length) * 100
      : 0;

  const updateState = (patch: Partial<TopicBlockState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleNext = () => {
    updateState({
      cardIndex: Math.min(state.cardIndex + 1, filteredCards.length - 1),
      isFlipped: false,
    });
  };

  const handlePrev = () => {
    updateState({
      cardIndex: Math.max(state.cardIndex - 1, 0),
      isFlipped: false,
    });
  };

  const handleGrade = (correct: boolean) => {
    const newReviewed = new Set(state.reviewedCards).add(state.cardIndex);
    updateState({
      reviewedCards: newReviewed,
      correctCount: correct ? state.correctCount + 1 : state.correctCount,
      cardIndex: Math.min(state.cardIndex + 1, filteredCards.length - 1),
      isFlipped: false,
    });
  };

  const handleReset = () => {
    updateState({
      cardIndex: 0,
      isFlipped: false,
      correctCount: 0,
      reviewedCards: new Set(),
    });
  };

  const cardTypeFilters = [
    "all",
    "definitions",
    "conceptual",
    "application",
    "important",
    "tricky",
  ];
  const diffFilters = ["all", "easy", "medium", "hard"];
  const studyModes: { id: StudyMode; icon: React.ReactNode; label: string }[] =
    [
      { id: "browse", icon: <Layers size={12} />, label: "Browse" },
      { id: "timed", icon: <Timer size={12} />, label: "Timed" },
      { id: "spaced", icon: <RefreshCw size={12} />, label: "Spaced" },
    ];

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        isWeakest
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border bg-card",
      )}
    >
      {/* Topic header */}
      <button
        type="button"
        onClick={() => updateState({ isOpen: !state.isOpen })}
        className="w-full flex items-center gap-3 p-4"
      >
        {isWeakest && (
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-display font-semibold text-foreground text-sm">
              {topic.topicName}
            </h3>
            {isWeakest && (
              <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                Needs review
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-1.5 flex-1 max-w-32" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {state.reviewedCards.size}/{topic.cards.length} reviewed
            </span>
            {state.reviewedCards.size > 0 && (
              <span className="text-xs text-emerald-400">
                {Math.round(
                  (state.correctCount / state.reviewedCards.size) * 100,
                )}
                % accuracy
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-transform duration-200 shrink-0",
            state.isOpen && "rotate-180",
          )}
        />
      </button>

      {state.isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          {/* Controls */}
          <div className="flex flex-wrap gap-2 pt-3">
            {/* Difficulty filter */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50">
              {diffFilters.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() =>
                    updateState({
                      difficultyFilter: d,
                      cardIndex: 0,
                      isFlipped: false,
                    })
                  }
                  className={cn(
                    "px-2 py-1 rounded-md text-xs transition-all duration-150",
                    state.difficultyFilter === d
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            {/* Study mode */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50">
              {studyModes.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => updateState({ studyMode: m.id })}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-150",
                    state.studyMode === m.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {state.reviewedCards.size > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            )}
          </div>

          {/* Card type filter bar */}
          <div className="flex flex-wrap gap-1.5">
            {cardTypeFilters.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() =>
                  updateState({ typeFilter: t, cardIndex: 0, isFlipped: false })
                }
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs border transition-all duration-150",
                  state.typeFilter === t
                    ? cardTypeColors[t] ||
                        "bg-primary/10 text-primary border-primary/20"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-border",
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Flashcard viewer */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No cards match the current filters
            </div>
          ) : (
            <>
              {/* Card */}
              <div className="flashcard-scene h-48">
                <button
                  type="button"
                  className={cn(
                    "flashcard-card cursor-pointer w-full h-full border-0 bg-transparent p-0",
                    state.isFlipped && "is-flipped",
                  )}
                  onClick={() => updateState({ isFlipped: !state.isFlipped })}
                  aria-label={
                    state.isFlipped
                      ? "Flashcard back - click to flip"
                      : "Flashcard front - click to flip"
                  }
                >
                  {/* Front */}
                  <div className="flashcard-face rounded-xl border border-border bg-secondary/40 p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        cardTypeColors[currentCard?.cardType?.toLowerCase()] ||
                          "bg-muted/50 text-muted-foreground border-border",
                      )}
                    >
                      {currentCard?.cardType}
                    </div>
                    <p className="font-display text-base font-semibold text-foreground leading-snug">
                      {currentCard?.front}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to reveal answer
                    </p>
                  </div>

                  {/* Back */}
                  <div className="flashcard-face flashcard-face-back rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        difficultyColors[currentCard?.difficulty] ||
                          "text-muted-foreground",
                      )}
                    >
                      {currentCard?.difficulty} difficulty
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">
                      {currentCard?.back}
                    </p>
                  </div>
                </button>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={state.cardIndex === 0}
                  className="p-2 rounded-lg hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-3">
                  {state.isFlipped && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleGrade(false)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors"
                      >
                        <ThumbsDown size={14} />
                        Hard
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGrade(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors"
                      >
                        <ThumbsUp size={14} />
                        Got it
                      </button>
                    </>
                  )}
                  {!state.isFlipped && (
                    <span className="text-xs text-muted-foreground">
                      {state.cardIndex + 1} / {filteredCards.length}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={state.cardIndex === filteredCards.length - 1}
                  className="p-2 rounded-lg hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function FlashcardsTab({ sessionId }: Props) {
  const { data: topics = [], isLoading } =
    useFlashcardTopicsBySession(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!topics.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Brain size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No flashcard topics yet</p>
        <p className="text-sm opacity-60">
          Flashcards will appear here after processing
        </p>
      </div>
    );
  }

  // Determine weakest topic (least reviewed relative to total cards)
  const weakestIdx = topics.reduce(
    (weakIdx: number, t: FlashcardTopic, i: number) => {
      return t.cards.length < topics[weakIdx].cards.length ? i : weakIdx;
    },
    0,
  );

  return (
    <div className="p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {topics.length} Topic{topics.length !== 1 ? "s" : ""}
        </h2>
        <span className="text-xs text-muted-foreground">
          {topics.reduce(
            (sum: number, t: FlashcardTopic) => sum + t.cards.length,
            0,
          )}{" "}
          cards total
        </span>
      </div>
      {topics.map((topic: FlashcardTopic, i: number) => (
        <FlashcardBlock
          key={topic.id}
          topic={topic}
          isWeakest={i === weakestIdx}
        />
      ))}
    </div>
  );
}
