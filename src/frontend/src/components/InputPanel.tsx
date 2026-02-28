import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FileText,
  Loader2,
  Mic,
  Presentation,
  Sparkles,
  Upload,
  Youtube,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreateSession, useProcessWithAI } from "../hooks/useQueries";

interface Props {
  onSessionCreated: (sessionId: string) => void;
}

type SourceType = "youtube" | "pdf" | "ppt" | "audio";

interface SourceOption {
  id: SourceType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  inputType: "url" | "file";
  accept?: string;
}

const sourceOptions: SourceOption[] = [
  {
    id: "youtube",
    label: "YouTube URL",
    description: "Paste a YouTube video link",
    icon: <Youtube size={28} />,
    color: "text-red-400",
    placeholder: "https://www.youtube.com/watch?v=...",
    inputType: "url",
  },
  {
    id: "pdf",
    label: "Upload PDF",
    description: "Upload a PDF document",
    icon: <FileText size={28} />,
    color: "text-blue-400",
    placeholder: "Select PDF file",
    inputType: "file",
    accept: ".pdf",
  },
  {
    id: "ppt",
    label: "Upload PPT",
    description: "Upload a PowerPoint file",
    icon: <Presentation size={28} />,
    color: "text-orange-400",
    placeholder: "Select PPT file",
    inputType: "file",
    accept: ".ppt,.pptx",
  },
  {
    id: "audio",
    label: "Record Audio",
    description: "Upload or record audio",
    icon: <Mic size={28} />,
    color: "text-green-400",
    placeholder: "Select audio file",
    inputType: "file",
    accept: ".mp3,.wav,.m4a",
  },
];

export function InputPanel({ onSessionCreated }: Props) {
  const [selectedType, setSelectedType] = useState<SourceType>("youtube");
  const [urlValue, setUrlValue] = useState("");
  const [fileName, setFileName] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isFetching: isActorFetching } = useActor();
  const createSession = useCreateSession();
  const processWithAI = useProcessWithAI();

  const isLoading =
    createSession.isPending || processWithAI.isPending || isActorFetching;
  const selected = sourceOptions.find((o) => o.id === selectedType)!;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleGenerate = async () => {
    const sourceUrl = selectedType === "youtube" ? urlValue : fileName;
    if (!sourceUrl.trim()) {
      toast.error(
        selectedType === "youtube"
          ? "Please enter a YouTube URL"
          : "Please select a file",
      );
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    const sessionTitle =
      title.trim() || sourceUrl.split("/").pop() || "Study Session";
    const sessionId = crypto.randomUUID();

    try {
      await createSession.mutateAsync({
        id: sessionId,
        title: sessionTitle,
        sourceType: selectedType,
        sourceUrl: sourceUrl,
        subject: subject.trim(),
      });

      // Kick off AI processing in the background; ProcessingScreen polls for completion
      processWithAI.mutate({
        sessionId,
        topicTitle: sessionTitle,
        subject: subject.trim(),
      });

      onSessionCreated(sessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("not ready")) {
        toast.error(
          "Backend is still loading. Please wait a moment and try again.",
        );
      } else {
        toast.error("Failed to create session. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 gradient-mesh">
      <div className="w-full max-w-2xl">
        {/* Heading */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">
              AI Study Companion
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            What would you like to{" "}
            <span className="text-transparent bg-clip-text gradient-brand">
              study today?
            </span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Transform any content into structured notes, flashcards, quizzes,
            mind maps, and more.
          </p>
        </div>

        {/* Source type selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {sourceOptions.map((opt, i) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => {
                setSelectedType(opt.id);
                setFileName("");
                setUrlValue("");
              }}
              className={cn(
                "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 animate-fade-in-up",
                `delay-${(i + 1) * 100}`,
                selectedType === opt.id
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <span className={opt.color}>{opt.icon}</span>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {opt.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Input form */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-fade-in-up delay-500">
          {/* Source input */}
          {selected.inputType === "url" ? (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Video URL</Label>
              <Input
                value={urlValue}
                onChange={(e) => {
                  setUrlValue(e.target.value);
                  if (!title) {
                    const match = e.target.value.match(/v=([^&]+)/);
                    if (match) setTitle(`Video: ${match[1]}`);
                  }
                }}
                placeholder={selected.placeholder}
                className="bg-muted/50"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{selected.label}</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <Upload
                  size={18}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {fileName || "Click to select file"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={selected.accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Session Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Photosynthesis Lecture"
                className="bg-muted/50"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology, Physics..."
                className="bg-muted/50"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold gradient-brand text-white border-0 hover:opacity-90 transition-opacity shadow-glow"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {isActorFetching
                  ? "Connecting to backend..."
                  : "Creating session..."}
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Generate Study Materials
              </>
            )}
          </Button>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-muted-foreground mt-4 animate-fade-in-up delay-600">
          Processing takes 1–3 minutes. All 7 study tools are being generated.
        </p>
      </div>
    </div>
  );
}
