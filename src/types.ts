export interface MatchDetails {
  ruleId?: string;
  method: 'regex' | 'tfidf' | 'jaccard' | 'none';
  score: number;
  tokens: string[];
  matchedKeywords: string[];
  calculations?: {
    jaccardDetails?: {
      intersection: string[];
      union: string[];
      score: number;
    };
    tfidfDetails?: {
      similarities: { ruleId: string; question: string; score: number }[];
      documentVectors: { [word: string]: number }[];
      queryVector: { [word: string]: number };
    };
    regexDetails?: {
      matchedPattern: string;
      matchGroups: string[];
    };
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isTyping?: boolean;
  matchDetails?: MatchDetails;
}

export interface FAQRule {
  id: string;
  category: string;
  question: string;
  keywords: string[]; // for regex/keyword matches
  answers: string[]; // list of replies (pick one at random or sequential)
  pattern?: string; // custom regex string
  isActive: boolean;
}

export interface DocumentVector {
  ruleId: string;
  vector: Record<string, number>;
}
