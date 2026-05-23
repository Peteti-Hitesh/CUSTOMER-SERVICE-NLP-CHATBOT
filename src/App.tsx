import React, { useState, useEffect } from 'react';
import { FAQRule, Message } from './types';
import { INITIAL_FAQ_RULES } from './mockData';
import { processCustomerServiceQuery } from './nlpEngine';
import Dashboard from './components/Dashboard';
import { Sparkles, MessageSquare, BookOpen, GraduationCap, Github } from 'lucide-react';

export default function App() {
  // FAQs and matching state
  const [faqRules, setFaqRules] = useState<FAQRule[]>(() => {
    const saved = localStorage.getItem('cs_rules_dataset');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved FAQ dataset, using defaults.', e);
      }
    }
    return INITIAL_FAQ_RULES;
  });

  // Chat message stream
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
      sender: 'bot',
      text: "Hello! 👋 I'm SwiftBot, a customer helper chatbot for our mock store, SwiftMart.\n\nType queries about your orders, returns, store hours, active coupons, or try my advanced NLP pipeline by editing FAQs or triggering Jaccard/TF-IDF Cosine algorithms dynamically on the right!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Persist FAQ edits locally
  useEffect(() => {
    localStorage.setItem('cs_rules_dataset', JSON.stringify(faqRules));
  }, [faqRules]);

  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `msg-user-${Date.now()}`;
    
    // Add user message to streams
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMessage]);

    // Triggers bot simulated think stage
    const typingMsgId = `msg-typing-${Date.now()}`;
    const botLoadingMessage: Message = {
      id: typingMsgId,
      sender: 'bot',
      text: '',
      timestamp: timeStr,
      isTyping: true
    };

    setMessages(prev => [...prev, botLoadingMessage]);

    // Process matching pipelines
    setTimeout(() => {
      const { reply, matchDetails } = processCustomerServiceQuery(text, faqRules);
      const botResponse: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchDetails
      };

      setMessages(prev => prev.filter(m => m.id !== typingMsgId).concat(botResponse));
    }, 650);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset-message',
        sender: 'bot',
        text: "Conversation reset! Send a query to begin auditing custom TF-IDF keyword matrices.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleUpdateRules = (updatedRules: FAQRule[]) => {
    setFaqRules(updatedRules);
  };

  const handleResetRules = () => {
    if (window.confirm('Are you sure you want to reset all FAQs back to their default configuration?')) {
      setFaqRules(INITIAL_FAQ_RULES);
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 flex flex-col">
      {/* GLOBAL HUD BAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm leading-none font-bold text-sm">
              N
            </div>
            <div>
              <h1 className="font-sans font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                Nexus Customer Service
              </h1>
              <p className="font-sans text-xs text-slate-500 font-medium">
                Rule-Based NLP & Coordinate Similarity Assistant
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-sans font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>Sandbox Testing Engine</span>
            </span>
            <span className="font-sans text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              System Active
            </span>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 shrink-0">
        <Dashboard
          messages={messages}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          faqRules={faqRules}
          onUpdateRules={handleUpdateRules}
          onResetRules={handleResetRules}
        />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-sans shrink-0 mt-6">
        <div className="max-w-5xl mx-auto px-6 space-y-2">
          <p className="font-medium text-slate-500">
            Nexus NLP Intelligence Center • Developed with React and Tailwind v4
          </p>
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-1.5 text-slate-400 text-[11px] max-w-xl mx-auto pt-1 font-mono">
            <span>
              1. <strong>Normalization:</strong> Stemming & stopwords filters.
            </span>
            <span>
              2. <strong>Vector Model:</strong> TF-IDF rarity weight scoring.
            </span>
            <span>
              3. <strong>Set Overlap:</strong> Jaccard set operations indices.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
