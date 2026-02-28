import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import { InputPanel } from "./components/InputPanel";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { ProcessingScreen } from "./components/ProcessingScreen";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { WorkspaceView } from "./components/WorkspaceView";
import { ThemeProvider } from "./context/ThemeContext";

type AppState = "input" | "processing" | "workspace";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appState, setAppState] = useState<AppState>("input");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleSessionCreated = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setAppState("processing");
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setAppState("workspace");
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setAppState("workspace");
  }, []);

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setAppState("input");
  }, []);

  const handleBack = useCallback(() => {
    setActiveSessionId(null);
    setAppState("input");
  }, []);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background font-sans">
        {/* Library Sidebar */}
        <LibrarySidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/generated/nexis-logo.dim_120x120.png"
                  alt="Nexis"
                  className="w-7 h-7 rounded-lg"
                />
                <span className="font-display font-bold text-lg tracking-tight text-foreground">
                  Nexis
                </span>
              </div>
              <span className="hidden sm:inline text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                AI Study Companion
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-hidden relative">
            {appState === "input" && (
              <div className="absolute inset-0 overflow-auto animate-fade-in-up">
                <InputPanel onSessionCreated={handleSessionCreated} />
              </div>
            )}
            {appState === "processing" && activeSessionId && (
              <div className="absolute inset-0 overflow-auto animate-fade-in-up">
                <ProcessingScreen
                  sessionId={activeSessionId}
                  onComplete={handleProcessingComplete}
                />
              </div>
            )}
            {appState === "workspace" && activeSessionId && (
              <div className="absolute inset-0 animate-fade-in-up">
                <WorkspaceView
                  sessionId={activeSessionId}
                  onBack={handleBack}
                />
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="shrink-0 px-4 py-2 border-t border-border/50 bg-background/50">
            <p className="text-[11px] text-muted-foreground text-center">
              © {new Date().getFullYear()}. Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  );
}
