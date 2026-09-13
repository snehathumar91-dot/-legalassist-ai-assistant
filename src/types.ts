export type ReadingLevel = 'everyday' | 'business' | 'detailed';
export type SupportedLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Spanish';

export interface RedFlag {
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  clauseSnippet: string;
  plainExplanation: string;
  recommendedAction: string;
}

export interface SimplifiedClause {
  sectionName: string;
  originalTextSnippet: string;
  plainLanguageMeaning: string;
  riskRating: 'Safe' | 'Caution' | 'Hazardous';
  gotchas: string;
}

export interface KeyObligation {
  party: string;
  obligation: string;
  timelineOrTrigger: string;
}

export interface SimplifiedDocumentResult {
  documentType: string;
  executiveSummary: string;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskSummary: string;
  keyParties: Array<{
    role: string;
    name: string;
    keyObligation: string;
  }>;
  redFlags: RedFlag[];
  simplifiedClauses: SimplifiedClause[];
  keyObligations: KeyObligation[];
  financialAndTerminationTerms: {
    paymentTerms: string;
    terminationConditions: string;
    renewalTerms: string;
  };
  overallVerdict: string;
}

export interface ContractDifference {
  topic: string;
  docAVersion: string;
  docBVersion: string;
  changeType: string;
  legalImpact: string;
  favorability: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  counterSuggestion: string;
}

export interface ComparisonResult {
  comparisonSummary: string;
  balanceOfPower: string;
  keyChangesCount: {
    criticalRisks: number;
    moderateChanges: number;
    minorOrNeutral: number;
  };
  differences: ContractDifference[];
  recommendations: string[];
}

export interface ClauseClarificationResult {
  clauseName: string;
  plainEnglishBreakdown: string;
  inSimpleAnalogies: string;
  riskRating: 'Safe' | 'Moderate' | 'High' | 'Severe Trap';
  trapExplanation: string;
  standardVsAggressive: string;
  redlineProposal: {
    originalExcerpt: string;
    suggestedReplacement: string;
    negotiationTalkingPoint: string;
  };
  scenarios: Array<{
    whatIf: string;
    outcome: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
