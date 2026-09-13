import React from 'react';
import { Scale, ShieldCheck, Languages, BookOpen, Sparkles, FileText, GitCompare, MessageSquareCode } from 'lucide-react';
import { SupportedLanguage, ReadingLevel } from '../types';

interface HeaderProps {
  activeTab: 'simplify' | 'compare' | 'clause';
  setActiveTab: (tab: 'simplify' | 'compare' | 'clause') => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  readingLevel: ReadingLevel;
  setReadingLevel: (level: ReadingLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  readingLevel,
  setReadingLevel,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-40">
      {/* Top Banner / Event Bar */}
      <div className="bg-stone-900 text-stone-200 px-4 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400 text-stone-950 uppercase tracking-wider">
            PromptWars 2026
          </span>
          <span className="text-stone-300">
            Problem Statement: <strong className="text-white font-semibold">AI for Legal Assistance & Access</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-stone-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Gemini 3.1 Flash Engine
          </span>
          <span className="hidden sm:inline text-stone-600">|</span>
          <span className="hidden sm:inline text-stone-300">
            Builder: <span className="text-amber-300 font-medium">Sneha Thumar</span>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight font-serif">
                LegalAssist AI
              </h1>
              <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Legal Access & Rights
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Contract simplifier, semantic diff analysis & plain-language clause negotiation
            </p>
          </div>
        </div>

        {/* Global Controls: Language & Reading Level */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Target Language for Accessibility */}
          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700">
            <Languages className="w-3.5 h-3.5 text-stone-500" />
            <label htmlFor="language-select" className="text-stone-500 font-medium hidden sm:inline">
              Language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Spanish">Español (Spanish)</option>
            </select>
          </div>

          {/* Reading Level Selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700">
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <label htmlFor="reading-level-select" className="text-stone-500 font-medium hidden sm:inline">
              Mode:
            </label>
            <select
              id="reading-level-select"
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value as ReadingLevel)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="everyday">Everyday Consumer (Simple)</option>
              <option value="business">Business Executive</option>
              <option value="detailed">Comprehensive Legal Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs corresponding to the 3 PromptWars Problem Statement goals */}
      <div className="border-t border-stone-100 bg-stone-50/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-1">
          <button
            id="tab-simplify-doc"
            onClick={() => setActiveTab('simplify')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'simplify'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'simplify' ? 'text-amber-600' : 'text-stone-400'}`} />
            1. Simplify Legal Documents
          </button>

          <button
            id="tab-compare-contracts"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <GitCompare className={`w-4 h-4 ${activeTab === 'compare' ? 'text-amber-600' : 'text-stone-400'}`} />
            2. Compare Contracts & Semantic Diff
          </button>

          <button
            id="tab-clause-clarifier"
            onClick={() => setActiveTab('clause')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'clause'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <MessageSquareCode className={`w-4 h-4 ${activeTab === 'clause' ? 'text-amber-600' : 'text-stone-400'}`} />
            3. Clarify Clauses & AI Redline
          </button>
        </div>
      </div>
    </header>
  );
};
