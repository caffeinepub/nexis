import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type StudySession = {
    id : Text;
    title : Text;
    sourceType : Text;
    sourceUrl : Text;
    status : Text;
    createdAt : Int;
    subject : Text;
  };

  type OldActor = {
    sessions : Map.Map<Text, StudySession>;
    mediaFiles : Map.Map<Text, Storage.ExternalBlob>;
    notes : Map.Map<Text, {
      id : Text;
      sessionId : Text;
      type_ : Text;
      content : Text;
      headings : [Text];
    }>;
    flashcardTopics : Map.Map<Text, {
      id : Text;
      sessionId : Text;
      topicName : Text;
      cards : [{
        front : Text;
        back : Text;
        cardType : Text;
        difficulty : Text;
      }];
    }>;
    quizzes : Map.Map<Text, {
      id : Text;
      sessionId : Text;
      questions : [{
        question : Text;
        type_ : Text;
        options : [Text];
        answer : Text;
        explanation : Text;
      }];
    }>;
    mindMaps : Map.Map<Text, {
      id : Text;
      sessionId : Text;
      mapData : Text;
    }>;
    podcasts : Map.Map<Text, {
      id : Text;
      sessionId : Text;
      mode : Text;
      script : Text;
    }>;
  };

  public func run(old : OldActor) : OldActor { old };
};
