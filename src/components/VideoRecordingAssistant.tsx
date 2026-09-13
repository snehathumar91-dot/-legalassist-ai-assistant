import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Circle, 
  Square, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  X,
  Volume2,
  Clock,
  HelpCircle,
  UploadCloud,
  FileCheck
} from 'lucide-react';

interface VideoRecordingAssistantProps {
  onNavigateTab: (tab: 'simplify' | 'compare' | 'clause') => void;
  onSetDocumentText: (text: string) => void;
  onTriggerSimplify: () => void;
}

const DEMO_STEPS = [
  {
    id: 1,
    timeRange: '0:00 - 0:30',
    title: 'Introduction & Problem Statement',
    tab: 'simplify' as const,
    subtitles: "Hi Judges! I'm Sneha Thumar. For the Legal Assistance track, I built LegalAssist AI to protect freelancers, tenants, and small businesses from unfair, predatory contracts using Google Gemini 3.1 Flash.",
    actionDescription: 'Show homepage, LegalAssist AI title, and PromptWars banner.',
  },
  {
    id: 2,
    timeRange: '0:30 - 1:15',
    title: 'Live Testing & Edge-Case Validation',
    tab: 'simplify' as const,
    subtitles: "Let's live test with a high-risk contractor agreement. Notice the live GenAI badge as Gemini 3.1 Flash analyzes clauses, calculates a 95/100 Critical Risk score, and flags the IP grab trap in real time.",
    actionDescription: 'Loads high-risk contract, shows live AI analysis badge, and reveals 95/100 risk score and critical red flags.',
    sampleText: 'AGREEMENT: Contractor agrees that Company shall own all IP and pre-existing code. Contractor shall indemnify Company for all losses regardless of Company negligence. Liability of Contractor is completely UNLIMITED. Payment is Net 120 days.',
  },
  {
    id: 3,
    timeRange: '1:15 - 1:45',
    title: 'Multilingual Legal Access (Hindi / Gujarati)',
    tab: 'simplify' as const,
    subtitles: "Legal access requires language inclusivity. Here, our AI translates the legal analysis and gotchas into simple conversational Hindi so non-lawyers can easily understand their rights.",
    actionDescription: 'Show language toggle to Hindi (हिंदी) with translated plain-language risk breakdowns.',
  },
  {
    id: 4,
    timeRange: '1:45 - 2:30',
    title: 'Semantic Contract Comparison (Diff)',
    tab: 'compare' as const,
    subtitles: "Pillar 2: Comparing contracts. When a counterparty sends a redline, our semantic diff detects that Draft B shifts the balance of power, pushes payment terms from 15 to 90 days, and deletes interest penalties.",
    actionDescription: 'Navigate to Compare Contracts tab, run AI diff, show Balance of Power and Critical Differences.',
  },
  {
    id: 5,
    timeRange: '2:30 - 3:15',
    title: 'Clause Clarifier & AI Redline Proposal',
    tab: 'clause' as const,
    subtitles: "Pillar 3: Clause Clarifier. Non-lawyers don't know how to push back. Our AI gives an everyday analogy, a safe redline replacement clause, and a polite email negotiation script to send to the client.",
    actionDescription: 'Navigate to Clause Clarifier, show real-world analogy and ready-to-copy polite email pushback script.',
  },
  {
    id: 6,
    timeRange: '3:15 - 3:45',
    title: 'Interactive Legal Q&A Chat & Conclusion',
    tab: 'clause' as const,
    subtitles: "Finally, our interactive chat cites specific clauses to answer direct questions like 'Can I terminate without notice?'. Built with Google GenAI SDK, lightweight under 300KB, ready for evaluation. Thank you!",
    actionDescription: 'Switch to Interactive Legal Assistant chat, show cited response, conclude video.',
  },
];

export const VideoRecordingAssistant: React.FC<VideoRecordingAssistantProps> = ({
  onNavigateTab,
  onSetDocumentText,
  onTriggerSimplify,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Screen Recorder State (using browser MediaRecorder API)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Auto-prompter timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Start Screen Recording
  const handleStartRecording = async () => {
    try {
      setDownloadUrl(null);
      setRecordedChunks([]);
      setRecordingSeconds(0);

      // Request browser screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        },
        audio: true,
      });

      const options = { mimeType: 'video/webm; codecs=vp9' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const completeBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(completeBlob);
        setDownloadUrl(url);
        setIsRecording(false);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Handle user manually clicking "Stop sharing" in browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.start(1000); // chunk every 1s
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error starting screen recording:', err);
      alert('Could not start screen recording: ' + (err.message || 'Permission denied or browser unsupported.'));
    }
  };

  // Stop Screen Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Step trigger
  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = DEMO_STEPS[index];
    onNavigateTab(step.tab);

    if (step.sampleText) {
      onSetDocumentText(step.sampleText);
    }
  };

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all border-2 border-white cursor-pointer"
        >
          <Video className="w-4 h-4 text-stone-900 animate-pulse" />
          <span>🎬 Record 4-Min Demo Video</span>
          {isRecording && (
            <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
              <Circle className="w-2 h-2 fill-white" /> REC {formatTime(recordingSeconds)}
            </span>
          )}
        </button>
      </div>

      {/* Main Video Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900 font-bold">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-serif flex items-center gap-2 text-white">
                    4-Minute Video Recording Studio
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PromptWars Official Guide
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    One-click screen recorder with live prompts and real-time script teleprompter
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recorder Controls Bar */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <Circle className="w-3.5 h-3.5 fill-white animate-ping" />
                    <span>🔴 Start Screen Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>⏹️ Stop Recording ({formatTime(recordingSeconds)})</span>
                  </button>
                )}

                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Target: &lt; 4:00 (Current: {formatTime(recordingSeconds)})
                  </span>
                )}
              </div>

              {/* Download link when finished */}
              {downloadUrl && !isRecording && (
                <a
                  href={downloadUrl}
                  download="LegalAssist-AI-PromptWars-Demo.webm"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all animate-bounce"
                >
                  <Download className="w-4 h-4" />
                  <span>💾 Download Finished Video</span>
                </a>
              )}
            </div>

            {/* Step-by-Step Teleprompter */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Step Navigation Pills */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-100">
                {DEMO_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentStepIndex === idx
                        ? 'bg-amber-500 text-stone-900 shadow-xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span>{step.title}</span>
                    <span className="text-[10px] opacity-75">({step.timeRange})</span>
                  </button>
                ))}
              </div>

              {/* Current Active Step Box */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Current Step: {currentStep.title} ({currentStep.timeRange})
                  </span>
                  <button
                    onClick={() => {
                      onNavigateTab(currentStep.tab);
                      if (currentStep.sampleText) {
                        onSetDocumentText(currentStep.sampleText);
                        onTriggerSimplify();
                      }
                      setIsOpen(false);
                    }}
                    className="text-xs px-3 py-1 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Execute on Screen</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    What to Show on Screen:
                  </span>
                  <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed">
                    {currentStep.actionDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    Exact Voiceover / Script to Read:
                  </span>
                  <p className="text-xs sm:text-sm text-stone-900 bg-white p-3.5 rounded-xl border border-amber-200 leading-relaxed italic font-serif">
                    "{currentStep.subtitles}"
                  </p>
                </div>
              </div>

              {/* Submission Guide Checklist */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-600">
                <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  PromptWars Video Submission Rules
                </span>
                <ul className="space-y-1 pl-4 list-disc text-stone-600 text-[11px] leading-relaxed">
                  <li>Keep total video length strictly <strong>under 4 minutes</strong> (3:15 to 3:45 is optimal).</li>
                  <li>Show dynamic data entry live on screen — do not cut or skip results.</li>
                  <li>After downloading the video, upload to <strong>Google Drive (set to Anyone with Link)</strong> or <strong>YouTube (Unlisted)</strong>.</li>
                  <li>Test link in an Incognito private tab before submitting.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-200 disabled:opacity-40"
              >
                Previous Step
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
                >
                  Close & View Screen
                </button>
                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))}
                  disabled={currentStepIndex === DEMO_STEPS.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-900 text-xs font-bold hover:bg-amber-600 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  Next Step
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
