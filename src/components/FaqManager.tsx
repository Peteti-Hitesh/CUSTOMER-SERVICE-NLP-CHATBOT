import React, { useState } from 'react';
import { FAQRule } from '../types';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, RefreshCcw, Save, Trash, HelpCircle, Code } from 'lucide-react';

interface FaqManagerProps {
  faqRules: FAQRule[];
  onUpdateRules: (rules: FAQRule[]) => void;
  onResetRules: () => void;
}

export default function FaqManager({ faqRules, onUpdateRules, onResetRules }: FaqManagerProps) {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  
  // Rule editing temp state
  const [tempQuestion, setTempQuestion] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  const [tempKeywords, setTempKeywords] = useState('');
  const [tempAnswers, setTempAnswers] = useState('');
  const [tempPattern, setTempPattern] = useState('');

  // New FAQ form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newKeywords, setNewKeywords] = useState('');
  const [newAnswers, setNewAnswers] = useState('');
  const [newPattern, setNewPattern] = useState('');

  const [errorText, setErrorText] = useState<string | null>(null);

  const startEditing = (rule: FAQRule) => {
    setEditingRuleId(rule.id);
    setErrorText(null);
    setTempQuestion(rule.question);
    setTempCategory(rule.category);
    setTempKeywords(rule.keywords.join(', '));
    setTempAnswers(rule.answers.join('\n'));
    setTempPattern(rule.pattern || '');
  };

  const cancelEditing = () => {
    setEditingRuleId(null);
    setErrorText(null);
  };

  const saveEditing = (ruleId: string) => {
    if (!tempQuestion.trim() || !tempAnswers.trim()) {
      setErrorText('Question and Answers cannot be blank.');
      return;
    }

    const updated = faqRules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          question: tempQuestion.trim(),
          category: tempCategory.trim(),
          keywords: tempKeywords.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0),
          answers: tempAnswers.split('\n').map(s => s.trim()).filter(s => s.length > 0),
          pattern: tempPattern.trim() ? tempPattern.trim() : undefined
        };
      }
      return r;
    });

    onUpdateRules(updated);
    setEditingRuleId(null);
    setErrorText(null);
  };

  const toggleRuleActive = (ruleId: string) => {
    const updated = faqRules.map(r => {
      if (r.id === ruleId) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    });
    onUpdateRules(updated);
  };

  const deleteRule = (ruleId: string) => {
    const updated = faqRules.filter(r => r.id !== ruleId);
    onUpdateRules(updated);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswers.trim()) {
      setErrorText('Please specify a Question and at least one Answer.');
      return;
    }

    const newRule: FAQRule = {
      id: `rule-custom-${Date.now()}`,
      category: newCategory.trim() || 'Custom',
      question: newQuestion.trim(),
      keywords: newKeywords.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0),
      answers: newAnswers.split('\n').map(s => s.trim()).filter(s => s.length > 0),
      pattern: newPattern.trim() ? newPattern.trim() : undefined,
      isActive: true
    };

    onUpdateRules([...faqRules, newRule]);
    setIsAddingNew(false);

    // reset forms
    setNewQuestion('');
    setNewCategory('Custom');
    setNewKeywords('');
    setNewAnswers('');
    setNewPattern('');
    setErrorText(null);
  };

  return (
    <div id="faq-manager-container" className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 border border-slate-100 rounded-xl shadow-2xs">
        <div>
          <h3 className="font-sans font-semibold text-slate-800 text-sm">FAQ & Rule Dataset Coordinator</h3>
          <p className="font-sans text-[11px] text-slate-400 mt-0.5">Toggle, edit, or append answers and trigger matrices instantly.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end">
          <button
            onClick={onResetRules}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-sans font-medium hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3 py-1.5 bg-blue-600 border border-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Rule</span>
            </button>
          )}
        </div>
      </div>

      {errorText && (
        <div className="bg-red-50 border border-red-150 text-red-700 rounded-lg p-3 text-xs font-sans">
          ⚠️ {errorText}
        </div>
      )}

      {/* NEW RULE FORM DRAWER */}
      {isAddingNew && (
        <form onSubmit={handleAddNew} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-sans text-xs font-semibold text-slate-800 uppercase tracking-wider">Create Custom Parser Rule</span>
            <button
              type="button"
              onClick={() => { setIsAddingNew(false); setErrorText(null); }}
              className="text-slate-400 hover:text-slate-600 font-sans text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Category:</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Sales, Technical, Policies"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Question Title / Friendly Match:</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What trigger handles this question?"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white text-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-600 block">
              Keywords (comma-separated for Vector & Jaccard overlap):
            </label>
            <input
              type="text"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
              placeholder="e.g. discounts, coupons, saves, cheap, percentage"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-650 focus:ring-blue-600 bg-slate-50 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span>Priority Overriding Regex Pattern (Optional):</span>
              </label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="e.g. order\s*(?:status|#)?\s*([0-9]+)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-700 bg-slate-50 text-xs"
              />
              <span className="text-[10px] text-slate-400 block">Use capture groups like (.*) to replace $1 in responses dynamically.</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Answers / Bot Replies (One per line for variance):</label>
              <textarea
                value={newAnswers}
                onChange={(e) => setNewAnswers(e.target.value)}
                placeholder="Type response here. Use $1 to print captured regex groups."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600 bg-slate-50 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-sans font-medium transition-all hover:shadow-xs cursor-pointer"
            >
              Save Custom FAQ Rule
            </button>
          </div>
        </form>
      )}

      {/* DETAILED FAQ LIST */}
      <div className="space-y-4">
        {faqRules.map(rule => {
          const isEditing = editingRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className={`border rounded-xl transition-all ${
                rule.isActive ? 'bg-white border-slate-150' : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              {/* Rule Card Head */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center space-x-3.5">
                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                    className="focus:outline-hidden cursor-pointer"
                  >
                    {rule.isActive ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div>
                    <span className="text-[9px] font-mono tracking-widest font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full uppercase">
                      {rule.category}
                    </span>
                    <h4 className="font-sans font-medium text-slate-800 text-sm mt-1">{rule.question}</h4>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => startEditing(rule)}
                        className="p-1 px-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded font-sans text-xs flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 px-2.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded font-sans text-xs flex items-center gap-1 cursor-pointer transition-all border border-transparent"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Rule Card Body */}
              <div className="p-5 font-sans">
                {isEditing ? (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block">Category:</label>
                        <input
                          type="text"
                          value={tempCategory}
                          onChange={(e) => setTempCategory(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 block">Question Title / Friend Label:</label>
                        <input
                          type="text"
                          value={tempQuestion}
                          onChange={(e) => setTempQuestion(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">Keywords (comma-separated):</label>
                      <input
                        type="text"
                        value={tempKeywords}
                        onChange={(e) => setTempKeywords(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-700 bg-slate-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">
                        Optional Regular Expression Pattern OVERRIDE:
                      </label>
                      <input
                        type="text"
                        value={tempPattern}
                        onChange={(e) => setTempPattern(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-xs text-slate-700 bg-slate-50 mb-1"
                        placeholder="Empty means no regular expression trigger matching filter"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">Answers / Bot Responses (One per line for randomized rotation):</label>
                      <textarea
                        value={tempAnswers}
                        onChange={(e) => setTempAnswers(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-slate-700 bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditing(rule.id)}
                        className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 text-xs">
                    {/* Keywords tags */}
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 block uppercase mb-1">Vector Keywords:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.keywords.map((kw, idx) => (
                          <span key={idx} className="font-mono bg-slate-50 text-slate-600 px-2 py-0.5 border border-slate-150 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Regex Pattern if available */}
                    {rule.pattern && (
                      <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg">
                        <span className="font-mono text-[9px] text-amber-700 block uppercase mb-1 font-bold">Regex Override Filter Pattern:</span>
                        <code className="font-mono text-[11px] text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded break-all">
                          /{rule.pattern}/i
                        </code>
                      </div>
                    )}

                    {/* Bot Answers */}
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 block uppercase mb-1">Rotated Support Answers:</span>
                      <ul className="space-y-1.5">
                        {rule.answers.map((ans, idx) => (
                          <li key={idx} className="bg-slate-50 p-2.5 text-slate-700 rounded-lg text-xs leading-relaxed italic border border-slate-100">
                            "{ans}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
