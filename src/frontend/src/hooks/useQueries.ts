import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FlashcardTopic,
  MindMap,
  Note,
  Podcast,
  Quiz,
  StudySession,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Sessions ─────────────────────────────────────────────────────

export function useAllSessions(
  subject?: string | null,
  sourceType?: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<StudySession[]>({
    queryKey: ["sessions", subject ?? null, sourceType ?? null],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions(subject ?? null, sourceType ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSession(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<StudySession>({
    queryKey: ["session", id],
    queryFn: () => actor!.getSession(id!),
    enabled: !!actor && !isFetching && !!id,
    refetchInterval: (query) => {
      const data = query.state.data as StudySession | undefined;
      return data?.status === "processing" ? 2000 : false;
    },
  });
}

export function useCreateSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      title,
      sourceType,
      sourceUrl,
      subject,
    }: {
      id: string;
      title: string;
      sourceType: string;
      sourceUrl: string;
      subject: string;
    }) => {
      if (!actor)
        throw new Error(
          "Backend not ready. Please wait a moment and try again.",
        );
      return actor.createSession(id, title, sourceType, sourceUrl, subject);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useGenerateSampleContent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      topicTitle,
    }: { sessionId: string; topicTitle: string }) => {
      if (!actor) throw new Error("Backend not ready.");
      return actor.generateSampleContent(sessionId, topicTitle);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["session", vars.sessionId] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useProcessWithAI() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      topicTitle,
      subject,
    }: { sessionId: string; topicTitle: string; subject: string }) => {
      if (!actor) throw new Error("Backend not ready.");
      return actor.processWithAI(sessionId, topicTitle, subject);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["session", vars.sessionId] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ── Notes ─────────────────────────────────────────────────────────

export function useNotesBySession(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotesBySession(sessionId!);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

// ── Flashcards ────────────────────────────────────────────────────

export function useFlashcardTopicsBySession(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FlashcardTopic[]>({
    queryKey: ["flashcards", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlashcardTopicsBySession(sessionId!);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

// ── Quizzes ───────────────────────────────────────────────────────

export function useQuizzesBySession(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz[]>({
    queryKey: ["quizzes", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuizzesBySession(sessionId!);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

// ── Mind Maps ─────────────────────────────────────────────────────

export function useMindMapsBySession(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<MindMap[]>({
    queryKey: ["mindmaps", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMindMapsBySession(sessionId!);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

// ── Podcasts ──────────────────────────────────────────────────────

export function usePodcastsBySession(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Podcast[]>({
    queryKey: ["podcasts", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPodcastsBySession(sessionId!);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}
