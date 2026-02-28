import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Baby,
  BookOpen,
  Check,
  Copy,
  FileText,
  GraduationCap,
  Loader2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Note } from "../../backend.d";
import { useNotesBySession } from "../../hooks/useQueries";

interface Props {
  sessionId: string;
}

type NoteType = "detailed" | "short" | "exam";

const noteTypes: {
  id: NoteType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "detailed",
    label: "Detailed",
    icon: <BookOpen size={14} />,
    color: "text-blue-400",
  },
  {
    id: "short",
    label: "Short",
    icon: <Zap size={14} />,
    color: "text-amber-400",
  },
  {
    id: "exam",
    label: "Exam-focused",
    icon: <GraduationCap size={14} />,
    color: "text-emerald-400",
  },
];

function renderContent(content: string, eli5: boolean): React.ReactNode {
  if (eli5) {
    // Simplified ELI5 rendering
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Baby size={16} className="text-amber-400 shrink-0" />
          <span className="text-sm text-amber-300 font-medium">
            ELI5 Mode – Simplified Explanation
          </span>
        </div>
        {content.split("\n\n").map((para) => (
          <p
            key={para.slice(0, 40)}
            className="text-base leading-relaxed text-foreground"
          >
            {para}
          </p>
        ))}
      </div>
    );
  }

  // Parse markdown-ish content
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const k = `${lineIdx}-${line.slice(0, 20)}`;
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={k}
          className="font-display text-2xl font-bold text-foreground mt-6 mb-3"
        >
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={k}
          className="font-display text-xl font-semibold text-foreground mt-5 mb-2"
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={k}
          className="font-display text-lg font-semibold text-primary mt-4 mb-2"
        >
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={k} className="flex items-start gap-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <p className="text-sm leading-relaxed text-foreground/90">
            {line.slice(2)}
          </p>
        </div>,
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={k} className="font-semibold text-foreground mt-2">
          {line.slice(2, -2)}
        </p>,
      );
    } else if (line.trim()) {
      elements.push(
        <p key={k} className="text-sm leading-relaxed text-foreground/90 mb-1">
          {line}
        </p>,
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

export function NotesTab({ sessionId }: Props) {
  const [activeType, setActiveType] = useState<NoteType>("detailed");
  const [eli5, setEli5] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: notes = [], isLoading } = useNotesBySession(sessionId);

  const activeNote = notes.find((n: Note) => n.type === activeType) ?? notes[0];

  const handleCopy = async () => {
    if (activeNote) {
      await navigator.clipboard.writeText(activeNote.content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileText size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No notes generated yet</p>
        <p className="text-sm opacity-60">
          Notes will appear here after processing completes
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
          {noteTypes.map((nt) => (
            <button
              type="button"
              key={nt.id}
              onClick={() => setActiveType(nt.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                activeType === nt.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={
                  activeType === nt.id ? "text-primary-foreground" : nt.color
                }
              >
                {nt.icon}
              </span>
              {nt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEli5(!eli5)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200",
              eli5
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "border-border text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Baby size={14} />
            ELI5
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Note content */}
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-3xl mx-auto">
          {/* Headings summary */}
          {activeNote?.headings?.length > 0 && !eli5 && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                Contents
              </p>
              <div className="flex flex-wrap gap-2">
                {activeNote.headings.map((h: string) => (
                  <Badge
                    key={h}
                    variant="outline"
                    className="text-xs border-border/60"
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="animate-fade-in-up">
            {activeNote ? (
              renderContent(activeNote.content, eli5)
            ) : (
              <p className="text-muted-foreground">
                No {activeType} notes available
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
