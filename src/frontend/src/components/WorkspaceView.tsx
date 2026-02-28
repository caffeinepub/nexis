import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  FileIcon,
  FileText,
  Headphones,
  HelpCircle,
  Layers,
  Loader2,
  Mic,
  Network,
  Palette,
  Presentation,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "../hooks/useQueries";
import { ExportTab } from "./tabs/ExportTab";
import { FlashcardsTab } from "./tabs/FlashcardsTab";
import { MindMapTab } from "./tabs/MindMapTab";
import { NotesTab } from "./tabs/NotesTab";
import { PodcastTab } from "./tabs/PodcastTab";
import { QuizTab } from "./tabs/QuizTab";
import { VisualsTab } from "./tabs/VisualsTab";

interface Props {
  sessionId: string;
  onBack: () => void;
}

type Tab =
  | "notes"
  | "flashcards"
  | "quiz"
  | "mindmap"
  | "visuals"
  | "podcast"
  | "export";

const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] =
  [
    {
      id: "notes",
      label: "Notes",
      icon: <FileText size={16} />,
      color: "text-blue-400",
    },
    {
      id: "flashcards",
      label: "Flashcards",
      icon: <Layers size={16} />,
      color: "text-violet-400",
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: <HelpCircle size={16} />,
      color: "text-amber-400",
    },
    {
      id: "mindmap",
      label: "Mind Map",
      icon: <Network size={16} />,
      color: "text-emerald-400",
    },
    {
      id: "visuals",
      label: "Visuals",
      icon: <Palette size={16} />,
      color: "text-pink-400",
    },
    {
      id: "podcast",
      label: "Podcast",
      icon: <Headphones size={16} />,
      color: "text-cyan-400",
    },
    {
      id: "export",
      label: "Export",
      icon: <Download size={16} />,
      color: "text-orange-400",
    },
  ];

const sourceIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube size={14} className="text-red-400" />,
  pdf: <FileIcon size={14} className="text-blue-400" />,
  ppt: <Presentation size={14} className="text-orange-400" />,
  audio: <Mic size={14} className="text-green-400" />,
};

export function WorkspaceView({ sessionId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          title="Back to input"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {session && (
            <>
              {sourceIcons[session.sourceType]}
              <h1 className="font-display font-semibold text-foreground text-sm truncate">
                {session.title}
              </h1>
              {session.subject && (
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 border-border/60"
                >
                  {session.subject}
                </Badge>
              )}
              <Badge
                className={cn(
                  "text-[10px] shrink-0",
                  session.status === "ready"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20",
                )}
              >
                {session.status}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-background/50 overflow-x-auto shrink-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 group",
              activeTab === tab.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "transition-all duration-200",
                activeTab === tab.id ? tab.color : "group-hover:scale-110",
                "group-hover:animate-bounce-gentle",
              )}
            >
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden relative">
        <div
          key={activeTab}
          className="absolute inset-0 overflow-auto animate-fade-in-up"
        >
          {activeTab === "notes" && <NotesTab sessionId={sessionId} />}
          {activeTab === "flashcards" && (
            <FlashcardsTab sessionId={sessionId} />
          )}
          {activeTab === "quiz" && <QuizTab sessionId={sessionId} />}
          {activeTab === "mindmap" && <MindMapTab sessionId={sessionId} />}
          {activeTab === "visuals" && <VisualsTab />}
          {activeTab === "podcast" && <PodcastTab sessionId={sessionId} />}
          {activeTab === "export" && <ExportTab />}
        </div>
      </div>
    </div>
  );
}
