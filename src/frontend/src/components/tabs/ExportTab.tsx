import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Download,
  FileText,
  Image,
  Loader2,
  Music,
  Package,
  Presentation,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  color: string;
  bgColor: string;
  size: string;
}

const exportOptions: ExportOption[] = [
  {
    id: "pdf",
    title: "PDF Notes",
    description: "Structured notes with headings, definitions, and key points",
    icon: <FileText size={24} />,
    format: "PDF",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    size: "~2.4 MB",
  },
  {
    id: "ppt",
    title: "PowerPoint Slides",
    description: "Auto-generated presentation slides for each topic",
    icon: <Presentation size={24} />,
    format: "PPTX",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    size: "~1.8 MB",
  },
  {
    id: "mindmap",
    title: "Mind Map Image",
    description: "High-resolution PNG of your interactive mind map",
    icon: <Image size={24} />,
    format: "PNG",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    size: "~0.6 MB",
  },
  {
    id: "mp3",
    title: "MP3 Podcast",
    description: "All three podcast modes bundled as audio files",
    icon: <Music size={24} />,
    format: "MP3",
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    size: "~8.2 MB",
  },
  {
    id: "doc",
    title: "Word Document",
    description: "Fully editable DOC file with formatted notes",
    icon: <FileText size={24} />,
    format: "DOCX",
    color: "text-blue-500",
    bgColor: "bg-blue-600/10 border-blue-600/20",
    size: "~1.1 MB",
  },
];

export function ExportTab() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [exportingAll, setExportingAll] = useState(false);

  const handleDownload = async (id: string, title: string) => {
    setDownloading(id);
    await new Promise((r) => setTimeout(r, 1500));
    setDownloading(null);
    setDownloaded((prev) => new Set([...prev, id]));
    toast.success(`${title} downloaded successfully!`);
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    for (const opt of exportOptions) {
      setDownloading(opt.id);
      await new Promise((r) => setTimeout(r, 800));
      setDownloaded((prev) => new Set([...prev, opt.id]));
    }
    setDownloading(null);
    setExportingAll(false);
    toast.success("All materials exported successfully!");
  };

  return (
    <div className="p-5 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Export Materials
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Download your study materials in multiple formats
          </p>
        </div>
        <Button
          onClick={handleExportAll}
          disabled={exportingAll || downloading !== null}
          className="gap-2 gradient-brand text-white border-0 hover:opacity-90"
        >
          {exportingAll ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Package size={16} />
              Export All
            </>
          )}
        </Button>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exportOptions.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              "rounded-xl border p-4 flex items-center gap-4 transition-all duration-200",
              downloaded.has(opt.id)
                ? "border-emerald-500/30 bg-emerald-500/5"
                : `${opt.bgColor} hover:opacity-90`,
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                downloaded.has(opt.id)
                  ? "bg-emerald-500/15"
                  : opt.bgColor.split(" ")[0],
              )}
            >
              {downloaded.has(opt.id) ? (
                <CheckCircle size={24} className="text-emerald-400" />
              ) : (
                <span className={opt.color}>{opt.icon}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-sm text-foreground">
                  {opt.title}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    downloaded.has(opt.id)
                      ? "bg-emerald-500/15 text-emerald-400"
                      : opt.bgColor,
                  )}
                >
                  {opt.format}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {opt.description}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {opt.size}
              </p>
            </div>

            {/* Download button */}
            <Button
              size="sm"
              variant={downloaded.has(opt.id) ? "outline" : "default"}
              onClick={() => handleDownload(opt.id, opt.title)}
              disabled={downloading === opt.id || exportingAll}
              className="gap-1.5 shrink-0"
            >
              {downloading === opt.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : downloaded.has(opt.id) ? (
                <CheckCircle size={14} className="text-emerald-400" />
              ) : (
                <Download size={14} />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Export summary */}
      {downloaded.size > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <p className="text-sm font-medium text-emerald-400">
              {downloaded.size} of {exportOptions.length} files downloaded
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Files have been saved to your downloads folder.
          </p>
        </div>
      )}
    </div>
  );
}
