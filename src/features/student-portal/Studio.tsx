"use client";

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  FileText, 
  Headphones, 
  Layers, 
  HelpCircle, 
  Presentation,
  Upload,
  Loader2,
  CheckCircle,
  Play,
  Wand2,
  XCircle
} from 'lucide-react';

export default function Studio() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<any[]>([]);
  const [activeAssetType, setActiveAssetType] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch initial history
      const { data: history } = await supabase
        .from('generations')
        .select('*, generation_assets(id, content)')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (history) {
        setGeneratedAssets(history);
      }

      // Subscribe to real-time changes
      channel = supabase.channel('studio_generations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'generations', filter: `requester_id=eq.${user.id}` },
          async (payload: any) => {
             // Refresh history on any change to keep assets joined
             const { data: newHistory } = await supabase
              .from('generations')
              .select('*, generation_assets(id, content)')
              .eq('requester_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10);
              
             if (newHistory) {
                setGeneratedAssets(newHistory);
                
                // If an item we were actively generating completes, stop the local loader
                const completedItem = newHistory.find((h: any) => h.id === payload.new?.id && payload.new?.status === 'completed');
                if (completedItem) {
                   setIsProcessing(false);
                   setActiveAssetType(null);
                }
             }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (type: string) => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setActiveAssetType(type);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);

      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Failed to queue generation");
      
      // Real-time listener will handle state updates and disable the loader when completed
    } catch (error) {
      console.error("Generation failed:", error);
      setIsProcessing(false);
      setActiveAssetType(null);
    }
  };

  const assetTypes = [
    { id: 'audio', dbType: 'audio_overview', label: 'Audio Overview', icon: Headphones, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'flashcards', dbType: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'quiz', dbType: 'interactive_quiz', label: 'Interactive Quiz', icon: HelpCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'slides', dbType: 'slide_deck', label: 'Slide Deck', icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-500/10' }
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      
      {/* Upload & Generator Section */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="bg-card border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wand2 className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Transform Your Notes</h2>
            <p className="text-muted mb-8">Upload any study material and let AI create interactive learning assets instantly.</p>
            
            <div className="mb-8">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-3xl hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {selectedFile ? (
                    <>
                      <FileText className="w-12 h-12 text-primary mb-3" />
                      <p className="mb-2 text-sm text-white font-bold">{selectedFile.name}</p>
                      <p className="text-xs text-muted">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted mb-3" />
                      <p className="mb-2 text-sm text-muted"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-muted">PDF, DOCX, or TXT (Max. 10MB)</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {assetTypes.map((type) => {
                const Icon = type.icon;
                const isGeneratingThis = isProcessing && activeAssetType === type.id;
                
                return (
                  <button
                    key={type.id}
                    disabled={!selectedFile || isProcessing}
                    onClick={() => handleGenerate(type.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      !selectedFile ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/5' :
                      isGeneratingThis ? 'bg-primary/20 border-primary' : 'bg-card border-white/10 hover:border-primary/50 hover:bg-white/5'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${type.bg}`}>
                      <Icon className={`w-6 h-6 ${type.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-white">{type.label}</div>
                      <div className="text-xs text-muted">Generate {type.id}</div>
                    </div>
                    {isGeneratingThis ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 text-muted opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Assets Section */}
      <div className="col-span-12 lg:col-span-4 bg-card border border-white/10 rounded-[2rem] p-6 flex flex-col h-[600px]">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-secondary" />
          Queue & Assets
        </h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {generatedAssets.length > 0 ? generatedAssets.map((asset) => {
            const typeInfo = assetTypes.find(t => t.dbType === asset.generation_type);
            const Icon = typeInfo?.icon || FileText;
            const isCompleted = asset.status === 'completed';
            const isFailed = asset.status === 'failed';
            
            return (
              <div key={asset.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-secondary/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-2 rounded-lg ${typeInfo?.bg}`}>
                    <Icon className={`w-5 h-5 ${typeInfo?.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">
                      {typeInfo?.label || 'Asset Generation'}
                    </h4>
                    <p className="text-[10px] text-muted">
                      {new Date(asset.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
                  {isFailed && <XCircle className="w-4 h-4 text-danger" />}
                  {!isCompleted && !isFailed && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                </div>
                {isCompleted && (
                  <button className="w-full py-2 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-colors">
                    Open Asset
                  </button>
                )}
                {!isCompleted && !isFailed && (
                   <div className="text-[10px] text-center text-muted font-bold uppercase tracking-widest">
                     Processing at Edge...
                   </div>
                )}
              </div>
            );
          }) : (
             <div className="h-full flex flex-col items-center justify-center text-muted text-center p-8 opacity-50">
                <Wand2 className="w-12 h-12 mb-4" />
                <p className="font-bold">No assets yet</p>
                <p className="text-xs mt-2">Upload a file and generate your first learning asset.</p>
             </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
