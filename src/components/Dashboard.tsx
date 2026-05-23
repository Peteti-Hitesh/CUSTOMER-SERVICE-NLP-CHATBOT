import React, { useState } from 'react';
import { Message, FAQRule } from '../types';
import ChatWidget from './ChatWidget';
import NlpVisualizer from './NlpVisualizer';
import FaqManager from './FaqManager';
import { Activity, BookOpen, Terminal, Code, Settings, Share2, HelpCircle } from 'lucide-react';

interface DashboardProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  faqRules: FAQRule[];
  onUpdateRules: (rules: FAQRule[]) => void;
  onResetRules: () => void;
}

export default function Dashboard({
  messages,
  onSendMessage,
  onClearChat,
  faqRules,
  onUpdateRules,
  onResetRules
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'nlp' | 'faqs'>('nlp');

  // Identify last user sent query and last message matching details to visualize
  const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
  const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot' && !m.isTyping);

  const activeRulesCount = faqRules.filter(r => r.isActive).length;
  const lastMatchScore = lastBotMessage?.matchDetails?.score || 0;
  const lastMatchMethod = lastBotMessage?.matchDetails?.method || 'none';

  return (
    <div id="dashboard-grid-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-full min-h-[calc(100vh-140px)] animate-fade-in">
      {/* LEFT CHAT CONSOLE: 5 columns */}
      <div className="lg:col-span-5 xl:col-span-4 h-[720px] lg:h-auto min-h-[500px]">
        <ChatWidget
          messages={messages}
          onSendMessage={onSendMessage}
          onClearChat={onClearChat}
        />
      </div>

      {/* RIGHT SIDE DIAGNOSTICS & EDITORS: 7 columns */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header toolbar */}
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Quick tab controllers */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('nlp')}
              className={`flex items-center gap-1.5 px-4.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === 'nlp'
                  ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>NLP Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-1.5 px-4.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>FAQ Dataset Editor</span>
              <span className="ml-1 bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-mono text-slate-500 rounded-md">
                {faqRules.length}
              </span>
            </button>
          </div>

          {/* Quick Engine metrics */}
          <div className="flex gap-4 self-center sm:self-auto text-right">
            <div className="text-center sm:text-right">
              <span className="font-sans text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Active Corpus Laws</span>
              <strong className="font-sans text-sm text-slate-800">{activeRulesCount} FAQs</strong>
            </div>
            <div className="w-px h-8 bg-slate-200 inline-block self-center" />
            <div className="text-center sm:text-right">
              <span className="font-sans text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Latest Match</span>
              <strong className={`font-sans text-sm ${lastMatchMethod === 'none' ? 'text-slate-400 font-medium' : 'text-blue-600 font-semibold'}`}>
                {lastMatchMethod === 'none' ? 'Fallback' : `${Math.round(lastMatchScore * 100)}% (${lastMatchMethod})`}
              </strong>
            </div>
          </div>
        </div>

        {/* Content body frame */}
        <div className="flex-1 overflow-y-auto p-6 bg-white max-h-[750px]">
          {activeTab === 'nlp' ? (
            <NlpVisualizer
              lastQuery={lastUserMessage?.text || null}
              matchDetails={lastBotMessage?.matchDetails || null}
              faqRules={faqRules}
            />
          ) : (
            <FaqManager
              faqRules={faqRules}
              onUpdateRules={onUpdateRules}
              onResetRules={onResetRules}
            />
          )}
        </div>
      </div>
    </div>
  );
}
