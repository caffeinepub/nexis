import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Note {
    id: string;
    content: string;
    headings: Array<string>;
    type: string;
    sessionId: string;
}
export interface FlashcardTopic {
    id: string;
    cards: Array<Flashcard>;
    sessionId: string;
    topicName: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface QuizQuestion {
    question: string;
    explanation: string;
    type: string;
    answer: string;
    options: Array<string>;
}
export interface Quiz {
    id: string;
    questions: Array<QuizQuestion>;
    sessionId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MindMap {
    id: string;
    mapData: string;
    sessionId: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Flashcard {
    front: string;
    cardType: string;
    back: string;
    difficulty: string;
}
export interface StudySession {
    id: string;
    status: string;
    title: string;
    subject: string;
    createdAt: bigint;
    sourceUrl: string;
    sourceType: string;
}
export type Media = Uint8Array;
export interface Podcast {
    id: string;
    script: string;
    mode: string;
    sessionId: string;
}
export interface backendInterface {
    addMedia(id: string, media: Media): Promise<void>;
    createFlashcardTopic(topic: FlashcardTopic): Promise<void>;
    createMindMap(map: MindMap): Promise<void>;
    createNote(note: Note): Promise<void>;
    createPodcast(podcast: Podcast): Promise<void>;
    createQuiz(quiz: Quiz): Promise<void>;
    createSession(id: string, title: string, sourceType: string, sourceUrl: string, subject: string): Promise<StudySession>;
    deleteMedia(id: string): Promise<void>;
    deleteSession(id: string): Promise<void>;
    generateSampleContent(sessionId: string, topicTitle: string): Promise<void>;
    getAllSessions(subject: string | null, sourceType: string | null): Promise<Array<StudySession>>;
    getFlashcardTopic(id: string): Promise<FlashcardTopic>;
    getFlashcardTopicsBySession(sessionId: string): Promise<Array<FlashcardTopic>>;
    getMedia(id: string): Promise<Media>;
    getMindMap(id: string): Promise<MindMap>;
    getMindMapsBySession(sessionId: string): Promise<Array<MindMap>>;
    getNote(id: string): Promise<Note>;
    getNotesBySession(sessionId: string): Promise<Array<Note>>;
    getPodcast(id: string): Promise<Podcast>;
    getPodcastsBySession(sessionId: string): Promise<Array<Podcast>>;
    getQuiz(id: string): Promise<Quiz>;
    getQuizzesBySession(sessionId: string): Promise<Array<Quiz>>;
    getSession(id: string): Promise<StudySession>;
    processWithAI(sessionId: string, topicTitle: string, _subject: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateSessionStatus(id: string, status: string): Promise<void>;
}
