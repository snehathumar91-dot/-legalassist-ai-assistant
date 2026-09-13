import React, { useState } from 'react';
import { 
  MessageSquareCode, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  User, 
  Bot, 
  ShieldCheck, 
  Lightbulb, 
  HelpCircle,
  FileQuestion,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ClauseClarificationResult, ChatMessage } from '../types';
import { safeFetchJson } from '../lib/api';

interface ClauseClarifierAndChatViewProps {
  initialClauseText: string;
  documentContext: string;
}

const PRESET_TRICKY_CLAUSES = [
  {
    title: 'Unilateral Unlimited Indemnity',
    clause: 'Contractor shall defend, indemnify, and hold harmless Company from and against ANY and ALL claims, losses, damages, liabilities, costs, and legal fees arising out of Contractor\'s services, regardless of Company negligence. Contractor\'s liability shall be completely UNLIMITED.',
    perspective: 'Contractor / Freelancer',
  },
  {
    title: 'Perpetual AI Model Training on User Data',
    clause: 'Customer grants Nexus an irrevocable, worldwide, perpetual, royalty-free license to use, process, modify, and vectorize all Customer data, confidential uploads, and prompts to train, tune, and commercialize Nexus foundation models.',
    perspective: 'SaaS Customer / Enterprise User',
  },
  {
    title: 'Work-For-Hire Transferring Pre-Existing IP',
    clause: 'All work product, concepts, code, and derivative works created by Contractor—including any pre-existing software, frameworks, or open-source templates utilized—shall be deemed "Work Made for Hire" and become the exclusive property of Company.',
    perspective: 'Software Engineer / Consultant',
  },
  {
    title: '120-Day Auto-Renewal with 25% Rent Hike',
    clause: 'Unless Tenant delivers written notice via registered postal mail at least 120 days prior to lease expiration, this Lease shall automatically renew for an additional 12-month period at an escalated rent equal to 125% of the preceding monthly rent.',
    perspective: 'Tenant / Resident',
  },
];

export const ClauseClarifierAndChatView: React.FC<ClauseClarifierAndChatViewProps> = ({
  initialClauseText,
  documentContext,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'clarify' | 'chat'>('clarify');

  // Clarifier State
  const [clauseText, setClauseText] = useState<string>(initialClauseText || PRESET_TRICKY_CLAUSES[0].clause);
  const [userPerspective, setUserPerspective] = useState<string>(PRESET_TRICKY_CLAUSES[0].perspective);
  const [isClarifying, setIsClarifying] = useState<boolean>(false);
  const [clarifyError, setClarifyError] = useState<string | null>(null);
  const [clarifyResult, setClarifyResult] = useState<ClauseClarificationResult | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedWording, setCopiedWording] = useState<boolean>(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your LegalAssist interactive Q&A advisor. Ask me anything about your contract—for example: *'Can they terminate without cause?'*, *'Do they own my prior work?'*, or *'What happens if I miss a payment deadline?'*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Handle Clarification
  const handleClarifyClause = async () => {
    if (!clauseText.trim()) {
      setClarifyError('Please enter or select a legal clause to analyze.');
      return;
    }

    setIsClarifying(true);
    setClarifyError(null);

    try {
      const data = await safeFetchJson<ClauseClarificationResult>('/api/clarify-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText,
          context: documentContext,
          userPerspective,
        }),
      });

      setClarifyResult(data);
    } catch (err: any) {
      console.error(err);
      setClarifyError(err.message || 'Error occurred while contacting the AI service.');
    } finally {
      setIsClarifying(false);
    }
  };

  // Handle Chat Submit
  const handleSendChat = async (questionText?: string) => {
    const q = questionText || chatInput;
    if (!q.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const data = await safeFetchJson<{ answer: string }>('/api/chat-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: documentContext || clauseText,
          question: q,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Unable to retrieve answer. Please verify your connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sub tabs: Clause Deep Dive vs Document Chat */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('clarify')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'clarify'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            Clause Deep Dive & Redline Generator
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'chat'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            Interactive Legal Q&A Assistant
          </button>
        </div>

        {documentContext && (
          <span className="hidden md:inline-flex items-center gap-1 text-xs text-stone-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active document loaded in context
          </span>
        )}
      </div>

      {/* Mode 1: Clause Deep Dive & Redline */}
      {activeSubTab === 'clarify' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                  <MessageSquareCode className="w-5 h-5 text-amber-600" />
                  Clarify Individual Clause & Generate Redline Proposal
                </h3>
                <p className="text-xs text-stone-500">
                  Select a common trap clause below or paste any tricky sentence from your agreement to get an everyday analogy and alternative wording.
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Presets:
                </span>
                {PRESET_TRICKY_CLAUSES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setClauseText(preset.clause);
                      setUserPerspective(preset.perspective);
                      setClarifyResult(null);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium transition-colors"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Perspective */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
                  Your Perspective / Role:
                </label>
                <input
                  type="text"
                  value={userPerspective}
                  onChange={(e) => setUserPerspective(e.target.value)}
                  placeholder="e.g. Independent Contractor, Tenant, Customer, Employee"
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <textarea
                value={clauseText}
                onChange={(e) => setClauseText(e.target.value)}
                rows={4}
                placeholder="Paste the confusing legal sentence or clause here..."
                className="w-full rounded-xl border border-stone-300 p-3 font-mono text-xs text-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none leading-relaxed bg-stone-50/40 resize-y"
              />

              <div className="flex justify-end pt-1">
                <button
                  id="clarify-clause-btn"
                  onClick={handleClarifyClause}
                  disabled={isClarifying || !clauseText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 font-medium text-sm transition-all shadow-sm cursor-pointer"
                >
                  {isClarifying ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      Clarifying Legalese...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Demystify Clause & Generate Redline
                    </>
                  )}
                </button>
              </div>
            </div>

            {clarifyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{clarifyError}</span>
              </div>
            )}
          </div>

          {/* Clarification Output */}
          {clarifyResult && !isClarifying && (
            <div className="space-y-6">
              {/* Clause Header & Rating */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Clause Identification
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 font-serif">
                      {clarifyResult.clauseName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        clarifyResult.riskRating === 'Severe Trap' || clarifyResult.riskRating === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : clarifyResult.riskRating === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {clarifyResult.riskRating}
                    </span>
                    <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-medium">
                      Market Context: {clarifyResult.standardVsAggressive}
                    </span>
                  </div>
                </div>

                {/* Plain English & Analogy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      In Plain English:
                    </span>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {clarifyResult.plainEnglishBreakdown}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                    <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Intuitive Real-World Analogy:
                    </span>
                    <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-serif italic">
                      "{clarifyResult.inSimpleAnalogies}"
                    </p>
                  </div>
                </div>

                {/* Trap Explanation */}
                {clarifyResult.trapExplanation && (
                  <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/60 text-xs text-rose-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Where the Trap Closes:
                    </strong>
                    <p className="text-rose-800/90 leading-relaxed">
                      {clarifyResult.trapExplanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Redline Proposal & Pushback Script */}
              {clarifyResult.redlineProposal && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-stone-900 font-serif">
                        AI Redline & Negotiation Script
                      </h4>
                      <p className="text-xs text-stone-500">
                        Balanced wording you can propose to replace the dangerous terms
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Suggested replacement */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                            Suggested Replacement Wording:
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(clarifyResult.redlineProposal.suggestedReplacement);
                              setCopiedWording(true);
                              setTimeout(() => setCopiedWording(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
                          >
                            {copiedWording ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copiedWording ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs font-mono text-stone-800 bg-white p-3 rounded-lg border border-emerald-200/60 leading-relaxed">
                          {clarifyResult.redlineProposal.suggestedReplacement}
                        </p>
                      </div>
                    </div>

                    {/* Friendly email script */}
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                            Friendly Pushback Email Script:
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(clarifyResult.redlineProposal.negotiationTalkingPoint);
                              setCopiedScript(true);
                              setTimeout(() => setCopiedScript(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-900"
                          >
                            {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copiedScript ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-xs text-stone-700 bg-white p-3 rounded-lg border border-stone-200 leading-relaxed italic font-serif">
                          "{clarifyResult.redlineProposal.negotiationTalkingPoint}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* What-If Scenarios */}
              {clarifyResult.scenarios && clarifyResult.scenarios.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                    <h4 className="text-base font-bold text-stone-900 font-serif">
                      "What-If" Scenario Simulator
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {clarifyResult.scenarios.map((sc, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5 text-xs">
                        <span className="font-bold text-stone-900 block flex items-center gap-1">
                          ❓ {sc.whatIf}
                        </span>
                        <p className="text-stone-600 leading-relaxed pl-4 border-l-2 border-amber-300">
                          {sc.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Interactive Legal Assistant Q&A Chat */}
      {activeSubTab === 'chat' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="space-y-1 border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-600" />
              Document Legal Assistant Chat
            </h3>
            <p className="text-xs text-stone-500">
              Directly query your uploaded contract or ask general legal interpretation questions with clause citations.
            </p>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Ask:
            </span>
            <button
              onClick={() => handleSendChat("Can they terminate this agreement without cause, and what notice is required?")}
              className="text-xs px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              Can they terminate without cause?
            </button>
            <button
              onClick={() => handleSendChat("Do they gain ownership of my pre-existing intellectual property or code?")}
              className="text-xs px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              Do they own my pre-existing IP?
            </button>
            <button
              onClick={() => handleSendChat("What are the payment terms and is there any penalty if client pays late?")}
              className="text-xs px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              Payment deadlines & late fees?
            </button>
            <button
              onClick={() => handleSendChat("What is the dispute resolution clause and where is the governing law located?")}
              className="text-xs px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              Dispute venue & governing law?
            </button>
          </div>

          {/* Chat Messages Container */}
          <div className="min-h-[360px] max-h-[500px] overflow-y-auto space-y-4 p-4 rounded-xl bg-stone-50/60 border border-stone-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-stone-900 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="prose prose-sm prose-stone max-w-none leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <span className={`text-[10px] block text-right ${msg.role === 'user' ? 'text-stone-400' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 text-xs sm:text-sm items-center text-stone-500">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-xs">
                  Reviewing contract clauses and preparing cited answer...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about this contract (e.g., 'What happens if I miss a deliverable?')..."
              className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-xs sm:text-sm text-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none bg-stone-50/40"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 font-medium text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
