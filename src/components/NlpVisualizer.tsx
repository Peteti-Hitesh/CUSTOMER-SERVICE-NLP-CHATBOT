import React from 'react';
import { MatchDetails, FAQRule } from '../types';
import { FileCode, Activity, CheckCircle, Info, BookOpen, AlertCircle } from 'lucide-react';
import { STOP_WORDS, stemWord } from '../nlpEngine';

interface NlpVisualizerProps {
  lastQuery: string | null;
  matchDetails: MatchDetails | null;
  faqRules: FAQRule[];
}

export default function NlpVisualizer({ lastQuery, matchDetails, faqRules }: NlpVisualizerProps) {
  if (!lastQuery || !matchDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="font-sans font-medium text-slate-700 text-sm">NLP Pipeline Standby</h4>
        <p className="font-sans text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Ask a question or select a prompt on the chat interface to visualize the real-time processing, tokenization, stemming, & similarity calculations.
        </p>
      </div>
    );
  }

  // Tokenize local raw words to show stopword/stemming breakdown
  const rawWords = lastQuery
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);

  return (
    <div id="nlp-visualizer-container" className="space-y-6">
      {/* SECTION 1: Pipeline Breakdown Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4.5 h-4.5 text-blue-600" />
            <h3 className="font-sans font-bold text-xs tracking-wide text-slate-900 uppercase">
              1. Linguistic Normalization Stage
            </h3>
          </div>
          <span className="font-mono text-[10px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded font-semibold border border-slate-200">
            Step 1: Text Cleanup
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <span className="font-sans text-[10px] text-slate-400 block uppercase mb-1 font-bold">Raw User Query:</span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-sans">
              "{lastQuery}"
            </div>
          </div>

          <div>
            <span className="font-sans text-[10px] text-slate-400 block uppercase mb-1 font-bold">Tokenization, Stopwords Exclusion & Stemming:</span>
            <div className="flex flex-wrap gap-2.5 p-3.5 bg-slate-50/50 border border-slate-200 rounded-lg">
              {rawWords.map((word, index) => {
                const isStopWord = STOP_WORDS.has(word);
                const stemmed = stemWord(word);
                const isStemmed = stemmed !== word && !isStopWord;

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center rounded-lg border px-2.5 py-1.5 font-sans relative ${
                      isStopWord
                        ? 'bg-red-50/50 border-red-200 text-red-500'
                        : isStemmed
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-blue-50/40 border-blue-200 text-blue-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{word}</span>
                    <span className="text-[9px] mt-1 text-slate-400 font-mono">
                      {isStopWord ? 'stopword' : isStemmed ? `stemmed: ${stemmed}` : 'keyword'}
                    </span>
                    <div className="absolute -top-1.5 -right-1 text-[8px] px-1 font-mono rounded">
                      {isStopWord && '❌'}
                      {isStemmed && '✏️'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className="font-sans text-[10px] text-slate-400 block uppercase mb-1 font-bold">Final Token Set passed to Matching Stage:</span>
            <div className="flex flex-wrap gap-1.5">
              {matchDetails.tokens.length > 0 ? (
                matchDetails.tokens.map((token, i) => (
                  <span key={i} className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded-md">
                    "{token}"
                  </span>
                ))
              ) : (
                <span className="font-sans text-xs text-slate-400 italic">No valid tokens remained. Relying on default fallback triggers.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Matching Classifier Engine Visualizer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4.5 h-4.5 text-blue-600" />
            <h3 className="font-sans font-bold text-xs tracking-wide text-slate-900 uppercase">
              2. Vector Similarity & Scoring Stage
            </h3>
          </div>
          <span className="font-mono text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded uppercase border border-blue-150">
            Matcher: {matchDetails.method}
          </span>
        </div>

        {/* REGEX PIPELINE */}
        {matchDetails.method === 'regex' && matchDetails.calculations?.regexDetails && (
          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-150 text-emerald-800 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Regular Expression Match Triggered!</p>
                <p>A priority regex pattern captured a structured command or parameters in the user prompt.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono text-[11px] text-slate-500">Regex Pattern Run:</span>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  /{matchDetails.calculations.regexDetails.matchedPattern}/i
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-sans text-[10px] text-slate-400 block uppercase">Extracted Captured Group Variables ($1):</span>
                {matchDetails.calculations.regexDetails.matchGroups && matchDetails.calculations.regexDetails.matchGroups.length > 0 ? (
                  matchDetails.calculations.regexDetails.matchGroups.map((grp: string, idx: number) => (
                    <div key={idx} className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500">Group {idx + 1}:</span>
                      <strong className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">"{grp}"</strong>
                    </div>
                  ))
                ) : (
                  <span className="font-sans text-xs text-slate-400 italic">No capture variables needed</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JACCARD INDEX SIMILARITY PIPELINE */}
        {matchDetails.calculations?.jaccardDetails && (matchDetails.method === 'jaccard' || matchDetails.method === 'tfidf' || matchDetails.method === 'none') && (
          <div className="space-y-4 pt-1">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="font-sans text-xs font-semibold text-slate-700">Jaccard Set Index Theory</span>
                <span className="font-mono text-[11px] text-slate-400 font-semibold font-semibold">J(A, B) = |A ∩ B| / |A ∪ B|</span>
              </div>

              <div className="p-3 space-y-3.5">
                {/* Intersection */}
                <div>
                  <span className="font-sans text-[10px] text-zinc-500 uppercase block mb-1 font-semibold">Intersection (Matched Keywords Set | A ∩ B):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchDetails.calculations.jaccardDetails.intersection.length > 0 ? (
                      matchDetails.calculations.jaccardDetails.intersection.map((word: string, i: number) => (
                        <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded font-mono font-semibold">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 font-sans text-xs italic">∅ Empty intersection</span>
                    )}
                  </div>
                </div>

                {/* Union */}
                <div>
                  <span className="font-sans text-[10px] text-zinc-500 uppercase block mb-1 font-semibold">Union (All Combined Terms Set | A ∪ B):</span>
                  <div className="flex flex-wrap gap-1">
                    {matchDetails.calculations.jaccardDetails.union.map((word: string, i: number) => {
                      const isIntersect = matchDetails.calculations?.jaccardDetails?.intersection.includes(word);
                      return (
                        <span
                          key={i}
                          className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                            isIntersect
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-50 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Jaccard score display */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-sans text-xs">
                  <span className="text-slate-600 font-medium">Jaccard Similarity Score:</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {matchDetails.calculations.jaccardDetails.score}
                    {matchDetails.method === 'jaccard' && <span className="text-xs text-blue-600 ml-1.5 font-bold">(Winning Match)</span>}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TF-IDF COSINE SIMILARITY MATRIX PIPELINE */}
        {matchDetails.calculations?.tfidfDetails && (
          <div className="space-y-4 pt-1">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-sans text-xs font-bold text-slate-700">FAQ Vector Space (TF-IDF Cosine Table)</span>
                </div>
                <span className="font-mono text-[9px] text-slate-400 font-semibold">Score range: [0 to 1]</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {matchDetails.calculations.tfidfDetails.similarities.map((item: any, idx: number) => {
                  const correlatedRule = faqRules.find(rf => rf.id === item.ruleId);
                  const isCurrentWinner = matchDetails.ruleId === item.ruleId && matchDetails.method === 'tfidf';

                  return (
                    <div
                      key={idx}
                      className={`p-3 transition-colors ${
                        isCurrentWinner ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-800 font-semibold truncate pr-4 max-w-[70%]" title={item.question}>
                          {item.question}
                        </span>
                        <span className={`font-mono font-bold ${isCurrentWinner ? 'text-blue-600' : 'text-slate-500'}`}>
                          Score: {item.score}
                        </span>
                      </div>

                      {/* Score bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isCurrentWinner ? 'bg-blue-600' : 'bg-slate-300'}`}
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>

                      {/* Display Keywords linked to the matching rule */}
                      {correlatedRule && (
                        <div className="flex gap-1.5 flex-wrap mt-2.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Terms:</span>
                          {correlatedRule.keywords.slice(0, 4).map((kw, idx) => (
                            <span key={idx} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm border border-slate-200">
                              {kw}
                            </span>
                          ))}
                          {correlatedRule.keywords.length > 4 && (
                            <span className="text-[9px] font-mono text-slate-400">+{correlatedRule.keywords.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3.5 bg-slate-50 rounded-lg flex items-start gap-2.5 border border-slate-200 text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] font-sans space-y-1.5 leading-relaxed">
                <p className="font-semibold text-slate-700">What is TF-IDF?</p>
                <p>
                  <strong>Term Frequency (TF)</strong> counts how often a clean keyword appears in each query.
                  <strong>Inverse Document Frequency (IDF)</strong> penalizes words that are extremely common across ALL FAQs (like "refund" or "policy"), keeping search focus directed to rare unique terms!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FALLBACK ACTION DESCRIPTION */}
        {matchDetails.method === 'none' && (
          <div className="p-3.5 bg-amber-50 rounded-lg flex items-start gap-2.5 border border-amber-200 text-amber-800">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs font-sans space-y-1">
              <p className="font-semibold text-amber-900">Below Confidence Match Threshold!</p>
              <p>
                The query had no regex overlaps, and both Cosine & Jaccard scores fell below critical limits.
                The engine responded with a randomized default FAQ placeholder reply.
              </p>
              <p className="text-[11px] text-amber-700 pt-1">
                💡 Tip: Try editing the FAQs on the side panel or adding explicit keywords like "discount" or "returns"!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
