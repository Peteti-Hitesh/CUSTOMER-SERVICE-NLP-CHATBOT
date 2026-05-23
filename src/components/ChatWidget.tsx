import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, MessageSquare, RefreshCw, User, HelpCircle, Ticket, ArrowRight } from 'lucide-react';
import { MOCK_ORDERS, SUGGESTIVE_PROMPTS } from '../mockData';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWidgetProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
}

export default function ChatWidget({ messages, onSendMessage, onClearChat }: ChatWidgetProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleSuggestionClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div id="chat-widget-container" className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Head */}
      <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-slate-200 text-slate-950">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shrink-0">
            A
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm tracking-tight text-slate-900 flex items-center">
              Aria Assistant
              <span className="w-1.5 h-1.5 ml-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
            </h3>
            <p className="font-sans text-[11px] text-slate-500 mt-0.5">Powered by Nexus NLP</p>
          </div>
        </div>
        <button
          onClick={onClearChat}
          title="Clear Conversation"
          className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer border border-slate-200"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Embedded Mock Database Quick Panel */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
          <Ticket className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-medium text-slate-700">Test Order IDs:</span>
        </div>
        <div className="flex gap-2">
          {MOCK_ORDERS.map(order => (
            <button
              key={order.id}
              onClick={() => handleSuggestionClick(`Help me track order ${order.id}`)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>{order.id}</span>
              <span className="text-[10px] text-slate-400">({order.status})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUser ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-slate-900 text-slate-100 font-semibold'}`}>
                    {isUser ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col">
                    {/* Timestamp / Sender Name */}
                    <span className={`text-[10px] text-slate-400 mb-1 font-sans ${isUser ? 'text-right' : 'text-left'}`}>
                      {isUser ? 'You' : 'Aria'} • {msg.timestamp}
                    </span>

                    {/* Speech card */}
                    <div className={`rounded-xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none font-sans'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none font-sans'
                    }`}>
                      {msg.isTyping ? (
                        <div className="flex items-center gap-1 py-1 px-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap select-text">
                          {msg.text}
                        </div>
                      )}
                    </div>

                    {/* NLP Tag Details */}
                    {!isUser && msg.matchDetails && !msg.isTyping && (
                      <div className="mt-1 flex items-center gap-1.5 bg-slate-100/75 border border-slate-200/50 rounded px-2 py-0.5 w-fit">
                        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Matched: {msg.matchDetails.method === 'none' ? 'None (Fallback)' : `${msg.matchDetails.method}`}</span>
                        {msg.matchDetails.score > 0 && (
                          <>
                            <span className="text-slate-300 text-[10px]">•</span>
                            <span className="font-mono text-[9px] font-semibold text-blue-600">Conf: {Math.round(msg.matchDetails.score * 100)}%</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Click a trigger scenario to test NLP categorization:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {SUGGESTIVE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(prompt)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-full text-xs font-sans font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Input controls form */}
      <form onSubmit={handleSubmit} className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 px-4.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 tracking-wide text-slate-900"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 py-2.5 bg-blue-600 border border-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:bg-slate-200 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
