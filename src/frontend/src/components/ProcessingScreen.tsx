import { Progress } from "@/components/ui/progress";
import {
  Brain,
  CheckCircle2,
  Download,
  FileText,
  Headphones,
  HelpCircle,
  Layers,
  Loader2,
  Network,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../hooks/useQueries";

interface Props {
  sessionId: string;
  onComplete: () => void;
}

type StepStatus = "waiting" | "active" | "done";

interface Step {
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { label: "Connecting to source", icon: <Zap size={16} /> },
  { label: "Extracting content", icon: <Download size={16} /> },
  { label: "Analyzing structure", icon: <Brain size={16} /> },
  { label: "Writing notes", icon: <FileText size={16} /> },
  { label: "Creating flashcards", icon: <Layers size={16} /> },
  { label: "Generating quiz", icon: <HelpCircle size={16} /> },
  { label: "Building mind map", icon: <Network size={16} /> },
  { label: "Preparing podcast", icon: <Headphones size={16} /> },
  { label: "Finalizing materials", icon: <Sparkles size={16} /> },
];

const STEP_INTERVAL_MS = 15_000; // advance one step every 15s → ~135s total

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ProcessingScreen({ sessionId, onComplete }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  // Poll the session until status is "ready"
  const { data: session } = useSession(sessionId);

  // Elapsed timer — tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance steps every STEP_INTERVAL_MS (but cap at last step)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // When backend signals ready, jump all steps to done and call onComplete
  useEffect(() => {
    if (session?.status === "ready" && !completedRef.current) {
      completedRef.current = true;
      setActiveStep(STEPS.length); // all done
      setTimeout(onComplete, 800);
    }
  }, [session?.status, onComplete]);

  // Step status helper
  function stepStatus(index: number): StepStatus {
    if (index < activeStep) return "done";
    if (index === activeStep) return "active";
    return "waiting";
  }

  const doneCount = Math.min(activeStep, STEPS.length);
  const progressPct = (doneCount / STEPS.length) * 100;

  const particles = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-10 gradient-mesh relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
            style={{
              left: `${10 + i * 11}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `bounce-gentle ${1.5 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Processing card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Orbital ring + Brain icon (compact) */}
              <div className="relative shrink-0">
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow"
                  style={{ margin: "-10px" }}
                />
                <div
                  className="absolute inset-0 rounded-full border border-accent/20 animate-spin-slow"
                  style={{ margin: "-18px", animationDirection: "reverse" }}
                />
                <div className="relative w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shadow-glow animate-float z-10">
                  <Brain size={22} className="text-white animate-pulse-glow" />
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-foreground leading-tight">
                  Generating Study Materials
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estimated time: 1–3 minutes
                </p>
              </div>
            </div>

            {/* Elapsed timer */}
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">elapsed</p>
              <p className="font-mono text-sm font-semibold text-primary tabular-nums">
                {formatElapsed(elapsed)}
              </p>
            </div>
          </div>
        </div>

        {/* Step checklist */}
        <div className="px-6 py-4 space-y-1.5">
          {STEPS.map((step, i) => {
            const status = stepStatus(i);
            return (
              <div
                key={step.label}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                  status === "active"
                    ? "bg-primary/10 border border-primary/20"
                    : status === "done"
                      ? "bg-transparent"
                      : "bg-transparent",
                ].join(" ")}
              >
                {/* Icon column */}
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                  {status === "done" ? (
                    <CheckCircle2
                      size={18}
                      className="text-success animate-fade-in-up"
                      style={{ color: "oklch(var(--success))" }}
                    />
                  ) : status === "active" ? (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  ) : (
                    <span className="text-muted-foreground/40">
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={[
                    "text-sm transition-all duration-300",
                    status === "active"
                      ? "font-semibold text-primary"
                      : status === "done"
                        ? "text-muted-foreground line-through"
                        : "text-muted-foreground/40",
                  ].join(" ")}
                >
                  {step.label}
                </span>

                {/* Active pulse indicator */}
                {status === "active" && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar footer */}
        <div className="px-6 pb-5 pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              {doneCount} of {STEPS.length} steps complete
            </span>
            <span className="text-xs font-mono font-medium text-primary">
              {Math.round(progressPct)}%
            </span>
          </div>
          <Progress
            value={progressPct}
            className="h-1.5 transition-all duration-700"
          />
        </div>
      </div>

      {/* Subtitle below card */}
      <p className="text-xs text-muted-foreground mt-5 text-center max-w-xs animate-fade-in-up">
        Your AI is analyzing the content and building all 7 study tools.
        <br />
        Feel free to wait — you'll be taken there automatically.
      </p>
    </div>
  );
}
