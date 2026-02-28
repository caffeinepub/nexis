import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart2,
  Clock,
  Download,
  FileImage,
  GitBranch,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VisualType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  preview: React.ReactNode;
}

const visualTypes: VisualType[] = [
  {
    id: "process",
    title: "Process Diagram",
    description: "Step-by-step process flow with arrows and stages",
    icon: <ArrowRight size={20} />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    preview: (
      <div className="flex items-center gap-2 w-full justify-center flex-wrap">
        {["Input", "Process", "Output"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 font-medium">
              {s}
            </div>
            {i < 2 && <ArrowRight size={12} className="text-blue-400/50" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "flowchart",
    title: "Flowchart",
    description: "Decision trees and branching logic diagrams",
    icon: <GitBranch size={20} />,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
    preview: (
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300">
          Start
        </div>
        <div className="w-px h-4 bg-violet-500/30" />
        <div className="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300">
          Decision?
        </div>
        <div className="flex gap-6 items-start">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-3 bg-violet-500/30" />
            <div className="text-[10px] text-violet-400">Yes</div>
            <div className="px-2 py-1 rounded bg-violet-500/20 border border-violet-500/20 text-[10px] text-violet-300">
              Action A
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-3 bg-violet-500/30" />
            <div className="text-[10px] text-violet-400">No</div>
            <div className="px-2 py-1 rounded bg-violet-500/20 border border-violet-500/20 text-[10px] text-violet-300">
              Action B
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "comparison",
    title: "Comparison Table",
    description: "Side-by-side comparison of concepts or entities",
    icon: <BarChart2 size={20} />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    preview: (
      <div className="w-full">
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <div className="bg-emerald-500/20 rounded p-1.5 text-emerald-300 font-medium text-center">
            Feature
          </div>
          <div className="bg-emerald-500/20 rounded p-1.5 text-emerald-300 font-medium text-center">
            Option A
          </div>
          <div className="bg-emerald-500/20 rounded p-1.5 text-emerald-300 font-medium text-center">
            Option B
          </div>
          {[
            ["Speed", "✓", "✓"],
            ["Cost", "✓", "✓"],
            ["Quality", "✓", "✓"],
          ].map(([row, a, b]) => [
            <div
              key={`${row}-label`}
              className="bg-emerald-500/5 rounded p-1.5 text-emerald-300/70 text-center"
            >
              {row}
            </div>,
            <div
              key={`${row}-a`}
              className="bg-emerald-500/5 rounded p-1.5 text-emerald-300/70 text-center"
            >
              {a}
            </div>,
            <div
              key={`${row}-b`}
              className="bg-emerald-500/5 rounded p-1.5 text-emerald-300/70 text-center"
            >
              {b}
            </div>,
          ])}
        </div>
      </div>
    ),
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Chronological events and milestones",
    icon: <Clock size={20} />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    preview: (
      <div className="relative w-full pl-4">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-500/30" />
        {["2020", "2022", "2024"].map((year, i) => (
          <div key={year} className="flex items-center gap-3 mb-2 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 relative -left-1" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 font-bold">
                {year}
              </span>
              <div
                className="h-1 w-8 bg-amber-500/20 rounded"
                style={{ width: `${(i + 1) * 20}px` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "infographic",
    title: "Infographic",
    description: "Visual summary with icons, stats, and key points",
    icon: <FileImage size={20} />,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10 border-pink-500/20",
    preview: (
      <div className="grid grid-cols-3 gap-2 w-full">
        {[
          ["42", "Concepts"],
          ["8", "Topics"],
          ["100%", "Coverage"],
        ].map(([val, label]) => (
          <div key={label} className="text-center">
            <div className="text-lg font-display font-bold text-pink-400">
              {val}
            </div>
            <div className="text-[10px] text-pink-300/70">{label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "concept",
    title: "Concept Map",
    description: "Interconnected ideas and their relationships",
    icon: <Layers size={20} />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10 border-cyan-500/20",
    preview: (
      <div className="flex items-center justify-center gap-3 w-full">
        <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-300">
          Main Idea
        </div>
        <div className="flex flex-col gap-1">
          {["Concept A", "Concept B"].map((c) => (
            <div key={c} className="flex items-center gap-1">
              <div className="w-6 h-px bg-cyan-500/30" />
              <div className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/20 text-[10px] text-cyan-300/80">
                {c}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function VisualsTab() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    await new Promise((r) => setTimeout(r, 2200));
    setGenerating(null);
    setGenerated((prev) => new Set([...prev, id]));
    toast.success("Visual generated successfully!");
  };

  const handleDownload = (title: string) => {
    toast.success(`Downloading "${title}" as PNG…`);
  };

  return (
    <div className="p-5 overflow-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Create Visuals
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate visual diagrams and illustrations related to your study
            topic
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/50">
          <Sparkles size={12} className="text-primary" />
          AI-powered
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visualTypes.map((v) => (
          <div
            key={v.id}
            className={cn(
              "rounded-xl border p-4 flex flex-col gap-3 transition-all duration-200",
              generated.has(v.id)
                ? "border-primary/30 bg-primary/5"
                : `${v.bgColor} hover:opacity-90`,
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", v.bgColor)}>
                <span className={v.color}>{v.icon}</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">
                  {v.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {v.description}
                </p>
              </div>
            </div>

            {/* Preview area */}
            <div className="rounded-lg bg-background/50 border border-border/50 p-3 min-h-[80px] flex items-center justify-center">
              {generating === v.id ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Generating visual…
                  </span>
                </div>
              ) : generated.has(v.id) ? (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">
                      Generated
                    </span>
                  </div>
                  {v.preview}
                </div>
              ) : (
                v.preview
              )}
            </div>

            {/* Action */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={generated.has(v.id) ? "outline" : "default"}
                onClick={() => handleGenerate(v.id)}
                disabled={generating === v.id}
                className="flex-1 gap-1.5 text-xs"
              >
                {generating === v.id ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Generating...
                  </>
                ) : generated.has(v.id) ? (
                  <>
                    <Sparkles size={12} />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Generate Visual
                  </>
                )}
              </Button>
              {generated.has(v.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(v.title)}
                  className="gap-1.5 text-xs"
                >
                  <Download size={12} />
                  PNG
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
