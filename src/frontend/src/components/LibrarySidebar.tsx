import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Loader2,
  Mic,
  Plus,
  Presentation,
  Search,
  Trash2,
  Youtube,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { StudySession } from "../backend.d";
import { useAllSessions, useDeleteSession } from "../hooks/useQueries";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

const sourceIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube size={16} className="text-red-500" />,
  pdf: <FileText size={16} className="text-blue-400" />,
  ppt: <Presentation size={16} className="text-orange-400" />,
  audio: <Mic size={16} className="text-green-400" />,
};

const statusColors: Record<string, string> = {
  processing: "text-neon-amber",
  ready: "text-neon-emerald",
  error: "text-destructive",
};

function formatDate(ts: bigint) {
  const d = new Date(Number(ts) / 1_000_000);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

export function LibrarySidebar({
  collapsed,
  onToggle,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: sessions = [], isLoading } = useAllSessions();
  const deleteMutation = useDeleteSession();

  const filtered = useMemo(() => {
    return sessions.filter((s: StudySession) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.subject.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || s.sourceType === filterType;
      return matchesSearch && matchesType;
    });
  }, [sessions, search, filterType]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    }
  };

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center py-4 gap-3 w-[56px] shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={18} />
        </button>
        <div className="w-px h-4 bg-sidebar-border" />
        <button
          type="button"
          onClick={onNewSession}
          className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
          title="New session"
        >
          <Plus size={18} />
        </button>
        <div className="w-px h-4 bg-sidebar-border" />
        {filtered.slice(0, 8).map((s: StudySession) => (
          <button
            type="button"
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            title={s.title}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              activeSessionId === s.id
                ? "bg-primary/30 text-primary"
                : "hover:bg-sidebar-accent text-sidebar-foreground",
            )}
          >
            {sourceIcons[s.sourceType] ?? <BookOpen size={16} />}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-[260px] shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-display font-semibold text-sm text-sidebar-foreground">
            Library
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* New Session */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={onNewSession}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-sm font-medium transition-all duration-200 group"
        >
          <Plus
            size={16}
            className="group-hover:rotate-90 transition-transform duration-200"
          />
          New Session
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="pl-8 h-8 text-xs bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="px-3 pb-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
            <Filter size={12} className="mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="ppt">PowerPoint</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions list */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-4 space-y-1">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2
                size={20}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No sessions yet</p>
              <p className="text-xs opacity-60">
                Create your first study session
              </p>
            </div>
          )}
          {filtered.map((s: StudySession) => (
            <button
              type="button"
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                activeSessionId === s.id
                  ? "bg-primary/15 border border-primary/30"
                  : "hover:bg-sidebar-accent border border-transparent",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {sourceIcons[s.sourceType] ?? <BookOpen size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">
                    {s.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {s.subject && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 border-border/50"
                      >
                        {s.subject}
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "text-[10px]",
                        statusColors[s.status] || "text-muted-foreground",
                      )}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Clock size={10} />
                    {formatDate(s.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-all duration-150"
                  title="Delete session"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} total
        </p>
      </div>
    </aside>
  );
}
