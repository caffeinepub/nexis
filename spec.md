# Nexis

## Current State

Nexis is a full-stack AI study companion app. Users paste a YouTube URL, PDF, PPT or audio, enter a subject, and click Generate. The backend creates a StudySession and calls `generateSampleContent` which stores thin placeholder data (e.g. "Question 1", "Answer 1") and marks the session "ready". The frontend ProcessingScreen polls until the session is ready, then shows a workspace with Notes, Flashcards, Quiz, MindMap, Visuals, Podcast, and Export tabs.

The problems:
1. Mock content is generic ("Question 1 / Answer 1") and contains no information about the topic.
2. There is no real AI processing -- no HTTP outcalls to transcription or LLM APIs.
3. The processing UI is a simple spinner with animated step labels -- no granular per-step feedback.

## Requested Changes (Diff)

### Add
- **HTTP outcalls** component wired to backend -- backend calls OpenAI-compatible API (configurable) to generate topic-aware content from the YouTube URL / subject title.
- **Rich topic-aware mock content generator** in the backend -- when HTTP outcall is unavailable or fails, falls back to structured, realistic content derived from the topicTitle and subject using pattern-based generation (multiple named subtopics, real-sounding questions/definitions, etc.).
- **Per-step processing UI** -- ProcessingScreen shows a vertical checklist of named steps (Extract, Analyze, Notes, Flashcards, Quiz, Mind Map, Podcast, Finalize), each one ticking to "done" with a checkmark animation as time passes, so the user sees clear progress for up to 3 minutes.
- **Estimated time indicator** -- ProcessingScreen shows "Estimated time: ~1–3 min" and a live elapsed timer.

### Modify
- `generateSampleContent` in backend -- replace thin placeholder strings with rich, topic-aware generated content (multi-paragraph notes, real-sounding flashcard Q&A per subtopic, meaningful quiz questions with proper options, structured mindmap JSON, and a realistic podcast script intro).
- `ProcessingScreen` component -- redesign to show vertical step-by-step checklist with checkmark/spinner per step, elapsed timer, and estimated time label.
- `InputPanel` hint text -- update processing time hint to "~1–3 minutes".

### Remove
- Nothing removed.

## Implementation Plan

1. Update backend `generateSampleContent` to produce rich, topic-aware content for all content types (notes with headings/paragraphs, flashcards with real Q&A per subtopic, quiz with realistic MCQ + short answer, structured mindmap JSON, podcast script).
2. Select `http-outcalls` component to enable real HTTP calls from backend.
3. Add a `processWithAI` function in backend that attempts an HTTP outcall to a configurable AI endpoint; falls back to rich mock if unavailable.
4. Update ProcessingScreen to show a vertical step checklist with per-step status (waiting / in-progress / done), elapsed timer, and estimated time banner.
5. Update InputPanel hint text.
6. Validate (typecheck + build), fix any errors.
