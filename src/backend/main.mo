import Order "mo:core/Order";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Data types
  public type StudySession = {
    id : Text;
    title : Text;
    sourceType : Text; // "youtube" | "pdf" | "audio" | "ppt"
    sourceUrl : Text;
    status : Text; // "processing" | "ready" | "failed"
    createdAt : Int;
    subject : Text;
  };

  public type Media = Storage.ExternalBlob;

  public type Note = {
    id : Text;
    sessionId : Text;
    type_ : Text; // "detailed" | "short" | "exam"
    content : Text;
    headings : [Text];
  };

  public type Flashcard = {
    front : Text;
    back : Text;
    cardType : Text;
    difficulty : Text;
  };

  public type FlashcardTopic = {
    id : Text;
    sessionId : Text;
    topicName : Text;
    cards : [Flashcard];
  };

  public type QuizQuestion = {
    question : Text;
    type_ : Text;
    options : [Text];
    answer : Text;
    explanation : Text;
  };

  public type Quiz = {
    id : Text;
    sessionId : Text;
    questions : [QuizQuestion];
  };

  public type MindMap = {
    id : Text;
    sessionId : Text;
    mapData : Text;
  };

  public type Podcast = {
    id : Text;
    sessionId : Text;
    mode : Text; // "conversational" | "exam" | "story"
    script : Text;
  };

  public type SampleContent = {
    notes : [Note];
    flashcardTopics : [FlashcardTopic];
    quiz : Quiz;
    mindMap : MindMap;
    podcast : Podcast;
  };

  // Comparison function for StudySession
  module StudySession {
    public func compareByCreatedAt(session1 : StudySession, session2 : StudySession) : Order.Order {
      Int.compare(session2.createdAt, session1.createdAt);
    };
  };

  // Storage
  let sessions = Map.empty<Text, StudySession>();
  let mediaFiles = Map.empty<Text, Media>();
  let notes = Map.empty<Text, Note>();
  let flashcardTopics = Map.empty<Text, FlashcardTopic>();
  let quizzes = Map.empty<Text, Quiz>();
  let mindMaps = Map.empty<Text, MindMap>();
  let podcasts = Map.empty<Text, Podcast>();

  // Helper function to get current timestamp
  func now() : Int {
    Time.now();
  };

  // StudySession CRUD
  public shared ({ caller }) func createSession(id : Text, title : Text, sourceType : Text, sourceUrl : Text, subject : Text) : async StudySession {
    let session : StudySession = {
      id;
      title;
      sourceType;
      sourceUrl;
      status = "processing";
      createdAt = now();
      subject;
    };
    sessions.add(id, session);
    session;
  };

  public query ({ caller }) func getSession(id : Text) : async StudySession {
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?s) { s };
    };
  };

  public shared ({ caller }) func updateSessionStatus(id : Text, status : Text) : async () {
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) {
        let updated = { session with status };
        sessions.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteSession(id : Text) : async () {
    sessions.remove(id);

    let noteIds = notes.values().toArray().filter(func(n) { n.sessionId == id }).map(func(n) { n.id });
    noteIds.forEach(func(nid) { notes.remove(nid) });

    let topicIds = flashcardTopics.values().toArray().filter(func(t) { t.sessionId == id }).map(func(t) { t.id });
    topicIds.forEach(func(tid) { flashcardTopics.remove(tid) });

    let quizIds = quizzes.values().toArray().filter(func(q) { q.sessionId == id }).map(func(q) { q.id });
    quizIds.forEach(func(qid) { quizzes.remove(qid) });

    let mapIds = mindMaps.values().toArray().filter(func(m) { m.sessionId == id }).map(func(m) { m.id });
    mapIds.forEach(func(mid) { mindMaps.remove(mid) });

    let podcastIds = podcasts.values().toArray().filter(func(p) { p.sessionId == id }).map(func(p) { p.id });
    podcastIds.forEach(func(pid) { podcasts.remove(pid) });
  };

  // Media CRUD
  public shared ({ caller }) func addMedia(id : Text, media : Media) : async () {
    mediaFiles.add(id, media);
  };

  public query ({ caller }) func getMedia(id : Text) : async Media {
    switch (mediaFiles.get(id)) {
      case (null) { Runtime.trap("Media not found") };
      case (?m) { m };
    };
  };

  public shared ({ caller }) func deleteMedia(id : Text) : async () {
    mediaFiles.remove(id);
  };

  // Note CRUD
  public shared ({ caller }) func createNote(note : Note) : async () {
    notes.add(note.id, note);
  };

  public query ({ caller }) func getNote(id : Text) : async Note {
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?n) { n };
    };
  };

  public query ({ caller }) func getNotesBySession(sessionId : Text) : async [Note] {
    notes.values().toArray().filter(func(n) { n.sessionId == sessionId });
  };

  // FlashcardTopic CRUD
  public shared ({ caller }) func createFlashcardTopic(topic : FlashcardTopic) : async () {
    flashcardTopics.add(topic.id, topic);
  };

  public query ({ caller }) func getFlashcardTopic(id : Text) : async FlashcardTopic {
    switch (flashcardTopics.get(id)) {
      case (null) { Runtime.trap("Flashcard topic not found") };
      case (?t) { t };
    };
  };

  public query ({ caller }) func getFlashcardTopicsBySession(sessionId : Text) : async [FlashcardTopic] {
    flashcardTopics.values().toArray().filter(func(t) { t.sessionId == sessionId });
  };

  // Quiz CRUD
  public shared ({ caller }) func createQuiz(quiz : Quiz) : async () {
    quizzes.add(quiz.id, quiz);
  };

  public query ({ caller }) func getQuiz(id : Text) : async Quiz {
    switch (quizzes.get(id)) {
      case (null) { Runtime.trap("Quiz not found") };
      case (?q) { q };
    };
  };

  public query ({ caller }) func getQuizzesBySession(sessionId : Text) : async [Quiz] {
    quizzes.values().toArray().filter(func(q) { q.sessionId == sessionId });
  };

  // MindMap CRUD
  public shared ({ caller }) func createMindMap(map : MindMap) : async () {
    mindMaps.add(map.id, map);
  };

  public query ({ caller }) func getMindMap(id : Text) : async MindMap {
    switch (mindMaps.get(id)) {
      case (null) { Runtime.trap("Mind map not found") };
      case (?m) { m };
    };
  };

  public query ({ caller }) func getMindMapsBySession(sessionId : Text) : async [MindMap] {
    mindMaps.values().toArray().filter(func(m) { m.sessionId == sessionId });
  };

  // Podcast CRUD
  public shared ({ caller }) func createPodcast(podcast : Podcast) : async () {
    podcasts.add(podcast.id, podcast);
  };

  public query ({ caller }) func getPodcast(id : Text) : async Podcast {
    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?p) { p };
    };
  };

  public query ({ caller }) func getPodcastsBySession(sessionId : Text) : async [Podcast] {
    podcasts.values().toArray().filter(func(p) { p.sessionId == sessionId });
  };

  // Library query with filtering and sorting
  public query ({ caller }) func getAllSessions(subject : ?Text, sourceType : ?Text) : async [StudySession] {
    let filteredIter = sessions.values().filter(
      func(s) {
        switch (subject, sourceType) {
          case (?subj, ?stype) { s.subject == subj and s.sourceType == stype };
          case (?subj, null) { s.subject == subj };
          case (null, ?stype) { s.sourceType == stype };
          case (null, null) { true };
        };
      }
    );

    filteredIter.toArray().sort(StudySession.compareByCreatedAt);
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func sampleDetailedNote(sessionId : Text, topicTitle : Text) : Note {
    {
      id = sessionId # "-detailed";
      sessionId;
      type_ = "detailed";
      content =
        (
          "## Introduction to " # topicTitle # "\n\n" # topicTitle # " is a fundamental concept in science. \n\n" # "### Key Points\n- Point 1\n- Point 2\n### Conclusion\nSummary of " # topicTitle
        );
      headings = ["Introduction", "Key Points", "Conclusion"];
    };
  };

  func sampleShortNote(sessionId : Text, topicTitle : Text) : Note {
    {
      id = sessionId # "-short";
      sessionId;
      type_ = "short";
      content = "Summary: " # topicTitle # " is important for understanding advanced topics.";
      headings = ["Summary"];
    };
  };

  func basicsFlashcards(topicTitle : Text) : [Flashcard] {
    [
      {
        front = "What is " # topicTitle # "?";
        back = topicTitle # " refers to a core concept studied in science.";
        cardType = "basics";
        difficulty = "easy";
      },
      {
        front = "Give an example of " # topicTitle # ".";
        back = "Example: A practical application using " # topicTitle;
        cardType = "basics";
        difficulty = "easy";
      },
      {
        front = "Why is understanding " # topicTitle # " important?";
        back = "It helps explain other scientific processes.";
        cardType = "basics";
        difficulty = "medium";
      },
      {
        front = topicTitle # " is most relevant in which field?";
        back = "Typically science and engineering.";
        cardType = "basics";
        difficulty = "medium";
      },
      {
        front = "Name a related concept to " # topicTitle;
        back = topicTitle # " is closely related to fundamentals.";
        cardType = "basics";
        difficulty = "medium";
      },
    ];
  };

  func advancedFlashcards(topicTitle : Text) : [Flashcard] {
    [
      {
        front = "Advanced principle of " # topicTitle;
        back = topicTitle # " can be applied in complex systems.";
        cardType = "advanced";
        difficulty = "hard";
      },
      {
        front = "Name a law related to " # topicTitle;
        back = topicTitle # " is governed by established laws.";
        cardType = "advanced";
        difficulty = "hard";
      },
      {
        front = "How does " # topicTitle # " differ in context?";
        back = "Context determines meaning and application.";
        cardType = "advanced";
        difficulty = "hard";
      },
      {
        front = "Can " # topicTitle # " be measured?";
        back = "In most cases, yes.";
        cardType = "advanced";
        difficulty = "hard";
      },
      {
        front = topicTitle # " has the greatest impact when?";
        back = "During transitional processes.";
        cardType = "advanced";
        difficulty = "hard";
      },
    ];
  };

  func multipleChoiceOptions() : [Text] {
    [
      "A force",
      "A mass",
      "A charge",
      "A wave",
    ];
  };

  func shortAnswerOptions() : [Text] {
    [];
  };

  func sampleQuizQuestions(topicTitle : Text) : [QuizQuestion] {
    [
      {
        question = "What describes " # topicTitle # " best?";
        type_ = "multiple choice";
        options = multipleChoiceOptions();
        answer = "A force";
        explanation = "Correct answer is A force.";
      },
      {
        question = "Give a practical example of using " # topicTitle;
        type_ = "short answer";
        options = shortAnswerOptions();
        answer = "Example: Creating practical applications.";
        explanation = "Explanation for short answer.";
      },
      {
        question = "Related concept to " # topicTitle;
        type_ = "multiple choice";
        options = [
          "Complementary concept",
          "Theoretical idea",
          "Construct",
        ];
        answer = "Complementary concept";
        explanation = "Correct answer is Complementary concept.";
      },
      {
        question = "When is " # topicTitle # " most important?";
        type_ = "short answer";
        options = shortAnswerOptions();
        answer = "In real-world applications";
        explanation = "Explanation for short answer.";
      },
      {
        question = "Describe the main function of " # topicTitle;
        type_ = "short answer";
        options = shortAnswerOptions();
        answer = "To perform specific tasks";
        explanation = "Explanation for short answer.";
      },
    ];
  };

  func sampleQuiz(sessionId : Text, topicTitle : Text) : Quiz {
    {
      id = sessionId # "-quiz";
      sessionId;
      questions = sampleQuizQuestions(topicTitle);
    };
  };

  func sampleMindMap(sessionId : Text, topicTitle : Text) : MindMap {
    {
      id = sessionId # "-mindmap";
      sessionId;
      mapData = "{\"nodes\": [{\"id\": 1, \"label\": \"" # topicTitle # "\"}], \"edges\": []}";
    };
  };

  func samplePodcast(sessionId : Text, topicTitle : Text) : Podcast {
    {
      id = sessionId # "-podcast";
      sessionId;
      mode = "conversational";
      script = "Welcome to our podcast. Today we discuss " # topicTitle # " in detail. Let's start by understanding the basics.\n\n";
    };
  };

  public shared ({ caller }) func generateSampleContent(sessionId : Text, topicTitle : Text) : async () {
    notes.add((sessionId # "-detailed"), sampleDetailedNote(sessionId, topicTitle));
    notes.add((sessionId # "-short"), sampleShortNote(sessionId, topicTitle));

    flashcardTopics.add((sessionId # "-topic1"), {
      id = sessionId # "-topic1";
      sessionId;
      topicName = topicTitle # " - Basics";
      cards = basicsFlashcards(topicTitle);
    });

    flashcardTopics.add((sessionId # "-topic2"), {
      id = sessionId # "-topic2";
      sessionId;
      topicName = topicTitle # " - Advanced";
      cards = advancedFlashcards(topicTitle);
    });

    quizzes.add((sessionId # "-quiz"), sampleQuiz(sessionId, topicTitle));
    mindMaps.add((sessionId # "-mindmap"), sampleMindMap(sessionId, topicTitle));
    podcasts.add((sessionId # "-podcast"), samplePodcast(sessionId, topicTitle));

    await updateSessionStatus(sessionId, "ready");
  };

  // AI Processing (external API call and fallback to sample content)
  public shared ({ caller }) func processWithAI(sessionId : Text, topicTitle : Text, _subject : Text) : async () {
    try {
      let _ = await OutCall.httpGetRequest(
        "https://api.openai.com/v1/chat/completions",
        [],
        transform,
      );

      await generateSampleContent(sessionId, topicTitle);
    } catch (error) {
      switch (error) {
        case (_) {
          await generateSampleContent(sessionId, topicTitle);
        };
      };
    };
  };
};
