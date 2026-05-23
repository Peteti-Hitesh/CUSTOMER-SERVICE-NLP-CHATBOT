import { FAQRule, MatchDetails } from './types';

// Standard English stop words to filter out
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
  'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
  'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
  'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
  'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
  'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
  'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
  'your', 'yours', 'yourself', 'yourselves'
]);

// Helper for simple e-commerce stemming (suffix rules)
export function stemWord(word: string): string {
  let w = word.toLowerCase().trim();
  if (w.length <= 3) return w;

  // Basic e-commerce specific plurals and gerunds stemming
  if (w.endsWith('ing')) {
    w = w.slice(0, -3);
    if (w.endsWith('shipp')) w = w.slice(0, -1); // shipping -> ship
    if (w.endsWith('track')) return 'track';
    if (w.endsWith('sett')) w = w.slice(0, -1); // setting -> set
  } else if (w.endsWith('ed')) {
    w = w.slice(0, -2);
    if (w.endsWith('track')) return 'track';
    if (w.endsWith('order')) return 'order';
  } else if (w.endsWith('ment')) {
    w = w.slice(0, -4); // shipment -> ship
  } else if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) {
    w = w.slice(0, -1);
  }

  // Synonym mappings for better e-commerce matching
  const synonyms: { [key: string]: string } = {
    hi: 'hello',
    hey: 'hello',
    greetings: 'hello',
    purchase: 'buy',
    locate: 'find',
    address: 'location',
    returns: 'return',
    refunding: 'refund',
    discounts: 'coupon',
    discount: 'coupon',
    promo: 'coupon',
    sale: 'coupon'
  };

  return synonyms[w] || w;
}

// Tokenize a string into cleaned words, excluding punctuation and optionally stop words
export function tokenize(text: string, removeStopWords = true, applyStemming = true): string[] {
  if (!text) return [];
  
  // Strip punctuation and split by whitespace
  const rawTokens = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);

  if (removeStopWords) {
    const withoutStop = rawTokens.filter(token => !STOP_WORDS.has(token));
    if (applyStemming) {
      return withoutStop.map(token => stemWord(token));
    }
    return withoutStop;
  }

  if (applyStemming) {
    return rawTokens.map(token => stemWord(token));
  }
  return rawTokens;
}

// Calculates Jaccard Similarity: Intersection of unique tokens / Union of unique tokens
export function calculateJaccardSimilarity(queryTokens: string[], ruleTokens: string[]): {
  score: number;
  intersection: string[];
  union: string[];
} {
  const querySet = new Set(queryTokens);
  const ruleSet = new Set(ruleTokens);

  if (querySet.size === 0 && ruleSet.size === 0) {
    return { score: 0, intersection: [], union: [] };
  }

  const intersection = Array.from(querySet).filter(word => ruleSet.has(word));
  const unionSet = new Set([...queryTokens, ...ruleTokens]);
  const union = Array.from(unionSet);

  const score = intersection.length / unionSet.size;

  return {
    score,
    intersection,
    union
  };
}

// Calculates cosine similarity between two numeric vectors
export function cosineSimilarity(vec1: Record<string, number>, vec2: Record<string, number>): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

  for (const key of allKeys) {
    const val1 = vec1[key] || 0;
    const val2 = vec2[key] || 0;
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Build TF-IDF vectorizer and calculate matches
export function getTfidfMatches(
  query: string,
  rules: FAQRule[]
): {
  similarities: { ruleId: string; question: string; score: number }[];
  documentVectors: Record<string, number>[];
  queryVector: Record<string, number>;
  bestRule: FAQRule | null;
  bestScore: number;
} {
  const activeRules = rules.filter(r => r.isActive);
  if (activeRules.length === 0) {
    return { similarities: [], documentVectors: [], queryVector: {}, bestRule: null, bestScore: 0 };
  }

  // Helper tokenize
  const queryTokens = tokenize(query, true, true);

  // 1. Gather all document tokens
  const docTokensMap = activeRules.map(rule => ({
    ruleId: rule.id,
    tokens: tokenize(rule.question + ' ' + rule.keywords.join(' '), true, true)
  }));

  // 2. Build vocabulary of entire corpus
  const vocabulary = new Set<string>();
  docTokensMap.forEach(d => d.tokens.forEach(t => vocabulary.add(t)));
  queryTokens.forEach(t => vocabulary.add(t));

  const totalDocuments = activeRules.length;

  // 3. Compute Inverse Document Frequency (IDF) for each word
  // IDF = ln(1 + TotalDocuments / (1 + DocumentsContainingWord))
  const idf: Record<string, number> = {};
  vocabulary.forEach(word => {
    let docCount = 0;
    docTokensMap.forEach(doc => {
      if (doc.tokens.includes(word)) {
        docCount++;
      }
    });
    idf[word] = Math.log(1 + totalDocuments / (1 + docCount));
  });

  // 4. Compute TF-IDF calculations for each FAQ Rule
  const documentVectors: Record<string, number>[] = docTokensMap.map(doc => {
    const vector: Record<string, number> = {};
    const wordCounts: Record<string, number> = {};

    doc.tokens.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Compute TF * IDF
    VocabularyArray().forEach(word => {
      if (wordCounts[word]) {
        vector[word] = wordCounts[word] * idf[word];
      } else {
        vector[word] = 0;
      }
    });

    return vector;
  });

  function VocabularyArray() {
    return Array.from(vocabulary);
  }

  // 5. Compute TF-IDF vector of query
  const queryVector: Record<string, number> = {};
  const queryWordCounts: Record<string, number> = {};
  queryTokens.forEach(word => {
    queryWordCounts[word] = (queryWordCounts[word] || 0) + 1;
  });

  VocabularyArray().forEach(word => {
    if (queryWordCounts[word]) {
      queryVector[word] = queryWordCounts[word] * idf[word];
    } else {
      queryVector[word] = 0;
    }
  });

  // 6. Compute similarity scores
  const similarities = activeRules.map((rule, idx) => {
    const score = cosineSimilarity(queryVector, documentVectors[idx]);
    return {
      ruleId: rule.id,
      question: rule.question,
      score: isNaN(score) ? 0 : parseFloat(score.toFixed(4))
    };
  });

  // Sort descending
  similarities.sort((a, b) => b.score - a.score);

  const bestMatch = similarities[0];
  const bestRule = bestMatch && bestMatch.score > 0.15 ? activeRules.find(r => r.id === bestMatch.ruleId) || null : null;
  const bestScore = bestRule ? bestMatch.score : 0;

  return {
    similarities,
    documentVectors,
    queryVector,
    bestRule,
    bestScore
  };
}

// Full NLP and Rule-based Pipeline match coordinator
export function processCustomerServiceQuery(
  rawQuery: string,
  rules: FAQRule[]
): {
  reply: string;
  matchDetails: MatchDetails;
} {
  const activeRules = rules.filter(r => r.isActive);
  const normalizedQuery = rawQuery.toLowerCase().trim();
  const queryTokens = tokenize(rawQuery, true, true);

  // --- STAGE 1: Regex & Priority Pattern Matcher ---
  for (const rule of activeRules) {
    if (rule.pattern) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        const matchResult = normalizedQuery.match(regex);
        if (matchResult) {
          // Select random answer
          const answerIndex = Math.floor(Math.random() * rule.answers.length);
          let response = rule.answers[answerIndex];

          // Dynamic Variable Replacement: e.g. Regex Groups
          // Replace $1 with the first captured group pattern like order ID or email
          if (matchResult[1]) {
            response = response.replace(/\$1/g, matchResult[1]);
          }

          return {
            reply: response,
            matchDetails: {
              ruleId: rule.id,
              method: 'regex',
              score: 1.0,
              tokens: queryTokens,
              matchedKeywords: [matchResult[0]],
              calculations: {
                regexDetails: {
                  matchedPattern: rule.pattern,
                  matchGroups: matchResult.slice(1)
                }
              }
            }
          };
        }
      } catch (e) {
        console.error('Invalid regex configuration:', rule.pattern, e);
      }
    }
  }

  // --- STAGE 2: Keyword exact overlaps / Matcher ---
  // If we can find visual matches in standard rules
  let bestKeywordRule: FAQRule | null = null;
  let maxKeywordOverlap = 0;
  let overlappingWords: string[] = [];

  for (const rule of activeRules) {
    const stemmedRuleKeywords = rule.keywords.map(kw => stemWord(kw));
    const intersection = queryTokens.filter(word => stemmedRuleKeywords.includes(word));
    if (intersection.length > maxKeywordOverlap) {
      maxKeywordOverlap = intersection.length;
      bestKeywordRule = rule;
      overlappingWords = intersection;
    }
  }

  // If high overlap, we can use TF-IDF or Jaccard
  // In our comprehensive design, we compile stats for BOTH metrics, but prioritize the best NLP mode.
  const tfidfResult = getTfidfMatches(rawQuery, activeRules);

  // Calculate Jaccard similarity for all FAQs and find best
  let bestJaccardRule: FAQRule | null = null;
  let bestJaccardScore = 0;
  let bestJaccardDetails: any = null;

  activeRules.forEach(rule => {
    const ruleTokens = tokenize(rule.question + ' ' + rule.keywords.join(' '), true, true);
    const details = calculateJaccardSimilarity(queryTokens, ruleTokens);
    if (details.score > bestJaccardScore) {
      bestJaccardScore = details.score;
      bestJaccardRule = rule;
      bestJaccardDetails = details;
    }
  });

  // Decide Best Path: Compare TF-IDF Cosine Similarity and Jaccard Similarity
  const tfidfScore = tfidfResult.bestScore;
  const jaccardScore = bestJaccardScore;

  // Compile calculations info for display in the Inspector
  const calculations: any = {};
  if (bestJaccardDetails) {
    calculations.jaccardDetails = {
      intersection: bestJaccardDetails.intersection,
      union: bestJaccardDetails.union,
      score: parseFloat(bestJaccardScore.toFixed(4))
    };
  }

  calculations.tfidfDetails = {
    similarities: tfidfResult.similarities,
    documentVectors: tfidfResult.documentVectors,
    queryVector: tfidfResult.queryVector
  };

  // Threshold check to filter out complete gibberish
  const MIN_TFIDF_THRESHOLD = 0.20;
  const MIN_JACCARD_THRESHOLD = 0.15;

  if (tfidfScore >= MIN_TFIDF_THRESHOLD && tfidfScore >= jaccardScore) {
    const rule = tfidfResult.bestRule!;
    const answerIndex = Math.floor(Math.random() * rule.answers.length);
    return {
      reply: rule.answers[answerIndex],
      matchDetails: {
        ruleId: rule.id,
        method: 'tfidf',
        score: tfidfScore,
        tokens: queryTokens,
        matchedKeywords: overlappingWords,
        calculations
      }
    };
  } else if (jaccardScore >= MIN_JACCARD_THRESHOLD) {
    const rule = bestJaccardRule!;
    const answerIndex = Math.floor(Math.random() * rule.answers.length);
    return {
      reply: rule.answers[answerIndex],
      matchDetails: {
        ruleId: rule.id,
        method: 'jaccard',
        score: jaccardScore,
        tokens: queryTokens,
        matchedKeywords: overlappingWords,
        calculations
      }
    };
  }

  // Default Fallback
  const fallbacks = [
    "I'm not quite sure I understand that. Could you please rephrase your question, or ask about our order tracking, store location, returns, or active coupon codes?",
    "Sorry, my simple brain couldn't find a direct match. You can try asking 'Where is my order?' or 'Do you have discounts?'",
    "I'm designed to help with simple customer service. I couldn't map that query to any FAQ rules. Try asking about our return policy or opening hours!"
  ];

  const defaultReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  return {
    reply: defaultReply,
    matchDetails: {
      method: 'none',
      score: 0,
      tokens: queryTokens,
      matchedKeywords: [],
      calculations
    }
  };
}
