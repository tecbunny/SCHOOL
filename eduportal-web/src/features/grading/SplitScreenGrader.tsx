"use client";

import { 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Save, 
  CheckCircle, 
  MessageSquare,
  Maximize2,
  Download,
  Loader2
} from 'lucide-react';
import { useState } from 'react';

import WorksheetScanner from './WorksheetScanner';

export default function SplitScreenGrader() {
  const [suggesting, setSuggesting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    conceptual: 0,
    grammar: 0,
    presentation: 0
  });

  const handleAiGrading = async (capturedImage: string) => {
    setScannedImage(capturedImage);
    setSuggesting(true);
    try {
      const response = await fetch('/api/ai/vision-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedImage,
          rubric: {
            conceptual: "Understanding of core physics laws",
            grammar: "Clarity of expression",
            presentation: "Cleanliness of work"
          },
          context: "Grade 8 Physics - Newton's Laws Worksheet"
        })
      });

      const aiResult = await response.json();
      
      // Update UI with AI suggestions
      setFeedback(`[EXTRACTED TEXT]:\n${aiResult.extractedText}\n\n[GEMINI FEEDBACK]: ${aiResult.evaluations.map((e: any) => e.feedback).join(' ')}`);
      
      const newScores: Record<string, number> = {};
      aiResult.evaluations.forEach((evalItem: any) => {
        if (evalItem.criteria.toLowerCase().includes('conceptual')) newScores.conceptual = evalItem.suggestedScore;
        if (evalItem.criteria.toLowerCase().includes('grammar') || evalItem.criteria.toLowerCase().includes('linguistic')) newScores.grammar = evalItem.suggestedScore;
        if (evalItem.criteria.toLowerCase().includes('presentation')) newScores.presentation = evalItem.suggestedScore;
      });

      setScores(prev => ({ ...prev, ...newScores }));
      
    } catch (err) {
      console.error("AI Grading Error:", err);
    } finally {
      setSuggesting(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!scannedImage) return;
    await handleAiGrading(scannedImage);
  };

  return (
    <div className="flex h-full bg-[#0a0a0a] overflow-hidden">
      
      {/* Left Side: Document Renderer (60%) */}
      <div className="w-[60%] flex flex-col border-r border-white/5 bg-black/40">
        <header className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Worksheet_001_Aryan_Sharma.pdf</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors"><Maximize2 className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors"><Download className="w-4 h-4" /></button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center gap-8 bg-[#111]">
          
          {scannedImage ? (
            <img src={scannedImage} className="w-full max-w-2xl bg-white aspect-[1/1.414] shadow-2xl object-contain" alt="Scanned" />
          ) : (
            <div className="w-full max-w-2xl">
              <WorksheetScanner onScanComplete={handleAiGrading} />
            </div>
          )}

          {/* Fallback Mock Document if scanner not used */}
          {!scannedImage && (
            <div className="w-full max-w-2xl bg-white aspect-[1/1.414] shadow-2xl p-16 flex flex-col gap-8 text-black font-serif opacity-50">
               <div className="flex justify-between border-b-2 border-black pb-4 mb-4">
                  <div className="font-bold text-xl uppercase">Reference: Physics Unit 1</div>
               </div>
               <p className="italic text-gray-400 text-center">Reference sheet will appear here after scanning.</p>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-center gap-8">
           <button className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous Student
           </button>
           <span className="text-xs font-mono bg-white/5 px-3 py-1 rounded-full text-muted">04 / 32</span>
           <button className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
              Next Student <ChevronRight className="w-4 h-4" />
           </button>
        </footer>
      </div>

      {/* Right Side: Grading Panel (40%) */}
      <div className="w-[40%] flex flex-col bg-card">
        <header className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">Grading Panel</h2>
          <p className="text-sm text-muted">Assessment ID: PHYS-UNIT1-2026</p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-8">
          
          {/* Rubric Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Evaluation Rubric</h3>
              <button 
                onClick={handleAISuggestion}
                disabled={suggesting}
                className="flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
              >
                {suggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {suggesting ? 'AI Assessing...' : 'Suggest with Gemini'}
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {[
                { id: 'conceptual', label: 'Conceptual Clarity', max: 10 },
                { id: 'grammar', label: 'Linguistic Accuracy', max: 10 },
                { id: 'presentation', label: 'Presentation & Flow', max: 10 },
              ].map((item) => (
                <div key={item.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{item.label}</label>
                    <span className="text-sm font-bold text-primary">{scores[item.id]} <span className="text-muted font-normal">/ {item.max}</span></span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={item.max} 
                    value={scores[item.id]} 
                    onChange={(e) => setScores({...scores, [item.id]: parseInt(e.target.value)})}
                    className="w-full accent-primary h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Feedback Section */}
          <section className="flex flex-col gap-3">
             <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted">
                <MessageSquare className="w-4 h-4" /> Manual Feedback
             </div>
             <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter personalized feedback for the student..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-primary transition-colors min-h-[150px] resize-none"
             />
          </section>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex gap-3">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-[10px] text-muted leading-relaxed">
              <strong>HPC Integration:</strong> These scores will automatically contribute to the student's Holistic Progress Card and NEP 2020 competency metrics.
            </p>
          </div>
        </div>

        <footer className="p-6 border-t border-white/5 bg-white/[0.02]">
          <button className="btn btn-primary w-full gap-2">
            <Save className="w-4 h-4" /> Submit & Finalize Grade
          </button>
        </footer>
      </div>

    </div>
  );
}
