import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Download,
  GraduationCap,
  Headphones,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Podcast } from "../../backend.d";
import { usePodcastsBySession } from "../../hooks/useQueries";

interface Props {
  sessionId: string;
}

const modeConfig: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  conversational: {
    label: "Conversational",
    icon: <MessageSquare size={20} />,
    description: "Friendly dialogue-style explanation, like talking to a tutor",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  exam: {
    label: "Exam-focused",
    icon: <GraduationCap size={20} />,
    description: "Key concepts, definitions, and likely exam questions",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  story: {
    label: "Story Mode",
    icon: <BookOpen size={20} />,
    description: "Narrative-style learning with real-world examples",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
  },
};

const WAVEFORM_BARS = Array.from({ length: 60 }, (_, i) => ({
  id: `waveform-bar-${i}`,
  pct: (i / 60) * 100,
  height: 20 + Math.sin(i * 0.7) * 12 + Math.cos(i * 0.3) * 8,
}));

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PodcastTab({ sessionId }: Props) {
  const { data: podcasts = [], isLoading } = usePodcastsBySession(sessionId);
  const [selectedMode, setSelectedMode] = useState<string>("conversational");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([80]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated duration based on script length
  const activePodcast =
    podcasts.find((p: Podcast) => p.mode === selectedMode) ?? podcasts[0];
  const scriptLength = activePodcast?.script?.length ?? 500;
  const duration = Math.max(60, Math.floor(scriptLength / 10));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - reset on mode change only
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [selectedMode]);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      if (currentTime >= duration) setCurrentTime(0);
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= duration) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            return duration;
          }
          return t + 1;
        });
      }, 1000);
    }
  };

  const handleSeek = (val: number[]) => {
    setCurrentTime(val[0]);
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= duration) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            return duration;
          }
          return t + 1;
        });
      }, 1000);
    }
  };

  const handleSkip = (delta: number) => {
    setCurrentTime((t) => Math.max(0, Math.min(duration, t + delta)));
  };

  const handleDownload = () => {
    toast.success("Downloading podcast as MP3…");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!podcasts.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Headphones size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No podcast generated yet</p>
        <p className="text-sm opacity-60">
          Podcast will appear here after processing
        </p>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const cfg =
    modeConfig[activePodcast?.mode ?? selectedMode] ??
    modeConfig.conversational;

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(modeConfig).map(([mode, m]) => {
            const hasPodcast = podcasts.some((p: Podcast) => p.mode === mode);
            return (
              <button
                type="button"
                key={mode}
                onClick={() => setSelectedMode(mode)}
                disabled={!hasPodcast}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-center",
                  selectedMode === mode && hasPodcast
                    ? `${m.bgColor} ${m.color}`
                    : hasPodcast
                      ? "border-border hover:border-border bg-card hover:bg-muted/40"
                      : "border-border/30 bg-card/30 opacity-40 cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    selectedMode === mode ? m.color : "text-muted-foreground",
                  )}
                >
                  {m.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {m.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                    {m.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-5 space-y-4">
          {/* Player card */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            {/* Track info */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                  cfg.bgColor,
                )}
              >
                <span className={cfg.color}>{cfg.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-foreground truncate">
                  {activePodcast?.mode ? cfg.label : "Podcast"} Summary
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(duration)} • AI Generated
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                title="Download MP3"
              >
                <Download size={18} />
              </button>
            </div>

            {/* Waveform visualization (decorative) */}
            <div className="flex items-center gap-0.5 h-10">
              {WAVEFORM_BARS.map((bar) => (
                <div
                  key={bar.id}
                  className="flex-1 rounded-full transition-all duration-150"
                  style={{
                    height: `${bar.height}px`,
                    backgroundColor:
                      bar.pct <= progress
                        ? "oklch(var(--primary))"
                        : "oklch(var(--muted))",
                  }}
                />
              ))}
            </div>

            {/* Seek slider */}
            <div className="space-y-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSkip(-15)}
                className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                title="-15s"
              >
                <SkipBack size={20} />
              </button>
              <button
                type="button"
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white shadow-glow hover:opacity-90 transition-opacity"
              >
                {isPlaying ? (
                  <Pause size={22} />
                ) : (
                  <Play size={22} className="translate-x-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSkip(15)}
                className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                title="+15s"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <Volume2 size={16} className="text-muted-foreground shrink-0" />
              <Slider
                value={volume}
                max={100}
                step={1}
                onValueChange={setVolume}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {volume[0]}%
              </span>
            </div>
          </div>

          {/* Podcast script */}
          {activePodcast?.script && (
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <BookOpen size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Podcast Script
                </span>
              </div>
              <ScrollArea className="h-48">
                <div className="p-4">
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                    {activePodcast.script}
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
