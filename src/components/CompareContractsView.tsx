import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';
import { ComparisonResult, ContractDifference } from '../types';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';
import { safeFetchJson } from '../lib/api';

export const CompareContractsView: React.FC = () => {
  const [docA, setDocA] = useState<string>(SAMPLE_CONTRACTS[0].text);
  const [docB, setDocB] = useState<string>(SAMPLE_CONTRACTS[0].comparisonVersion?.text || '');
  const [docALabel, setDocALabel] = useState<string>('Original Draft / Your Standard');
  const [docBLabel, setDocBLabel] = useState<string>('Counterparty Redline / Revision');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCompare = async () => {
    if (!docA.trim() || !docB.trim()) {
      setError('Please provide text for both Document A and Document B to compare.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await safeFetchJson<ComparisonResult>('/api/compare-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA,
          docB,
          docALabel,
          docBLabel,
        }),
      });

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while comparing contracts.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPresetComparison = (contractId: string) => {
    const sample = SAMPLE_CONTRACTS.find((c) => c.id === contractId);
    if (sample && sample.comparisonVersion) {
      setDocA(sample.text);
      setDocB(sample.comparisonVersion.text);
      setDocALabel(sample.title);
      setDocBLabel(sample.comparisonVersion.label);
      setResult(null);
      setError(null);
    }
  };

  const swapDocuments = () => {
    const tempText = docA;
    const tempLabel = docALabel;
    setDocA(docB);
    setDocALabel(docBLabel);
    setDocB(tempText);
    setDocBLabel(tempLabel);
    setResult(null);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `CONTRACT COMPARISON ANALYSIS REPORT
Balance of Power: ${result.balanceOfPower}
Summary: ${result.comparisonSummary}

KEY DIFFERENCES:
${result.differences
  .map(
    (d) => `[${d.severity}] ${d.topic}
- Document A: ${d.docAVersion}
- Document B: ${d.docBVersion}
- Impact: ${d.legalImpact}
- Counter Proposal: ${d.counterSuggestion}`
  )
  .join('\n\n')}

RECOMMENDATIONS:
${result.recommendations.map((r) => `- ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDiffReport = () => {
    if (!result) return;
    const markdown = `# Contract Semantic Diff & Comparison Report
**Version A:** ${docALabel}
**Version B:** ${docBLabel}

## Balance of Power
**Status:** ${result.balanceOfPower}
**Critical Risks:** ${result.keyChangesCount.criticalRisks} | **Moderate:** ${result.keyChangesCount.moderateChanges} | **Minor:** ${result.keyChangesCount.minorOrNeutral}

## Executive Summary
${result.comparisonSummary}

## Material Differences Breakdown
${result.differences
  .map(
    (d) => `### ${d.topic} (${d.changeType}) - [Severity: ${d.severity}]
- **Favorability:** ${d.favorability}
- **${docALabel}:** ${d.docAVersion}
- **${docBLabel}:** ${d.docBVersion}
- **Strategic / Legal Impact:** ${d.legalImpact}
- **Recommended Pushback / Alternative:** ${d.counterSuggestion}
`
  )
  .join('\n')}

## Recommended Pushbacks Before Signing
${result.recommendations.map((r) => `- ${r}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contract-Diff-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Intro Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 font-serif flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-amber-600" />
              Compare Contracts & Semantic Diff Engine
            </h2>
            <p className="text-sm text-stone-600 max-w-3xl">
              Detect subtle word changes, stripped protections, added liabilities, and leverage shifts between two draft versions of any legal agreement.
            </p>
          </div>

          {/* Quick Comparison Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Sample Diffs:
            </span>
            <button
              onClick={() => loadPresetComparison('freelance-contractor')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 font-medium text-stone-700 transition-colors shadow-xs"
            >
              Contractor: High Risk vs Balanced
            </button>
            <button
              onClick={() => loadPresetComparison('mutual-nda')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 font-medium text-stone-700 transition-colors shadow-xs"
            >
              NDA: Mutual vs One-Sided
            </button>
          </div>
        </div>

        {/* Dual Textarea Inputs */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
          {/* Document A */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={docALabel}
                onChange={(e) => setDocALabel(e.target.value)}
                className="text-xs font-bold text-stone-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none px-1 py-0.5"
                placeholder="Label for Doc A"
              />
              <span className="text-[11px] text-stone-400 font-medium">
                {docA.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={docA}
              onChange={(e) => setDocA(e.target.value)}
              rows={9}
              placeholder="Paste original contract draft (Version A)..."
              className="w-full rounded-xl border border-stone-300 p-3 font-mono text-xs text-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all leading-relaxed bg-stone-50/40 resize-y"
            />
          </div>

          {/* Swap button between panes */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={swapDocuments}
              className="p-2 rounded-full bg-white border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-sm transition-all"
              title="Swap Document A and Document B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Document B */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={docBLabel}
                onChange={(e) => setDocBLabel(e.target.value)}
                className="text-xs font-bold text-stone-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-none px-1 py-0.5"
                placeholder="Label for Doc B"
              />
              <span className="text-[11px] text-stone-400 font-medium">
                {docB.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={docB}
              onChange={(e) => setDocB(e.target.value)}
              rows={9}
              placeholder="Paste counterparty revision or modified draft (Version B)..."
              className="w-full rounded-xl border border-stone-300 p-3 font-mono text-xs text-stone-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all leading-relaxed bg-stone-50/40 resize-y"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={swapDocuments}
              className="lg:hidden text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1 px-2 py-1 border border-stone-200 rounded"
            >
              <ArrowRightLeft className="w-3 h-3" /> Swap Versions
            </button>
          </div>

          <button
            id="run-compare-btn"
            onClick={handleCompare}
            disabled={isLoading || !docA.trim() || !docB.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all shadow-sm hover:shadow cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                Analyzing Semantic Differences...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Run AI Contract Diff
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Comparison Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-4 shadow-xs animate-pulse">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-stone-800">
              Comparing legal implications and clauses...
            </h3>
            <p className="text-xs text-stone-500">
              Evaluating shifted liabilities, altered payment terms, indemnities, and balance of power between drafts.
            </p>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Balance of Power Shift
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">
                    {result.balanceOfPower}
                  </h3>
                </div>
              </div>

              {/* Metrics Pill counts */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {result.keyChangesCount.criticalRisks} Critical Changes
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {result.keyChangesCount.moderateChanges} Moderate
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-stone-100 text-stone-700">
                  {result.keyChangesCount.minorOrNeutral} Minor
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed pt-2 border-t border-stone-100">
              {result.comparisonSummary}
            </p>

            {/* Quick action bar */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 font-medium text-stone-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Diff Summary'}
              </button>
              <button
                onClick={handleDownloadDiffReport}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 font-medium text-stone-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Report (.md)
              </button>
            </div>
          </div>

          {/* Material Differences Table / List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif">
              Material Semantic Differences ({result.differences.length})
            </h3>

            <div className="space-y-4">
              {result.differences.map((diff, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-stone-300 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">
                        {diff.topic}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                        {diff.changeType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          diff.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : diff.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {diff.severity} Severity
                      </span>
                      <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        Advantage: {diff.favorability}
                      </span>
                    </div>
                  </div>

                  {/* Side by side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-sans">
                        {docALabel}:
                      </span>
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 leading-relaxed">
                        {diff.docAVersion}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block font-sans">
                        {docBLabel}:
                      </span>
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 text-stone-900 leading-relaxed font-semibold">
                        {diff.docBVersion}
                      </div>
                    </div>
                  </div>

                  {/* Real World Impact */}
                  <div className="text-xs text-stone-800 bg-stone-50/80 p-3 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="font-bold text-stone-900 block">
                      Strategic / Legal Impact:
                    </span>
                    <p className="text-stone-700 leading-relaxed font-sans">
                      {diff.legalImpact}
                    </p>
                  </div>

                  {/* Pushback suggestion */}
                  {diff.counterSuggestion && (
                    <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/70 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block font-sans">
                          Recommended Counter-Offer / Revision Wording:
                        </strong>
                        <p className="font-mono text-stone-800 bg-white/70 p-2 rounded border border-emerald-200/50">
                          {diff.counterSuggestion}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Priorities & Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Prioritized Pushback Checklist Before Signing
                </h3>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
