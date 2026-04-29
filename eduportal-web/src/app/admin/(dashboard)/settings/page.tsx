"use client";

import { Bot, Save, Cpu, Globe, Lock, Sliders, Zap, Loader2, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AISettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    gemini_config: { model: 'gemini-1.5-pro', temperature: 0.7 },
    global_features: { ai_enabled: true, registrations_open: true, maintenance_mode: false }
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/config');
        const data = await res.json();
        if (res.ok && Object.keys(data).length > 0) setConfig(data);
      } catch (err) {
        console.error("Fetch config failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Intelligence Configuration</h1>
        </div>
        <div className="flex items-center gap-4">
          {saving && <span className="text-xs text-muted animate-pulse">Saving changes...</span>}
          <button 
            className="btn btn-primary gap-2"
            onClick={() => {
               handleSave('gemini_config', config.gemini_config);
               handleSave('global_features', config.global_features);
            }}
          >
            <Save className="w-4 h-4" /> Save Global State
          </button>
        </div>
      </header>

      <div className="p-8 max-w-4xl flex flex-col gap-8">
        {/* Model Selection */}
        <section className="bg-card border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Model Orchestration</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Primary Generation Model</label>
              <select 
                value={config.gemini_config.model} 
                onChange={(e) => setConfig({
                  ...config, 
                  gemini_config: { ...config.gemini_config, model: e.target.value }
                })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Ultra Performance)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Low Latency)</option>
                <option value="gpt-4o">GPT-4o (Hybrid Mode)</option>
              </select>
              <p className="text-[10px] text-muted">High-priority for exam generation and curriculum mapping.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">Temperature ({config.gemini_config.temperature})</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={config.gemini_config.temperature} 
                onChange={(e) => setConfig({
                  ...config, 
                  gemini_config: { ...config.gemini_config, temperature: parseFloat(e.target.value) }
                })}
                className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-4"
              />
            </div>
          </div>
        </section>

        {/* Global Feature Toggles */}
        <section className="bg-card border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-warning" />
            <h2 className="font-bold text-lg">Platform Global Flags (Kill Switch)</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <label className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">AI Modules</span>
                <input 
                  type="checkbox" 
                  checked={config.global_features.ai_enabled} 
                  onChange={(e) => setConfig({
                    ...config,
                    global_features: { ...config.global_features, ai_enabled: e.target.checked }
                  })}
                  className="w-5 h-5 accent-primary" 
                />
              </div>
              <p className="text-[10px] text-muted leading-relaxed">Globally enable/disable AI generation features for all schools.</p>
            </label>
            
            <label className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-warning/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Registrations</span>
                <input 
                  type="checkbox" 
                  checked={config.global_features.registrations_open} 
                  onChange={(e) => setConfig({
                    ...config,
                    global_features: { ...config.global_features, registrations_open: e.target.checked }
                  })}
                  className="w-5 h-5 accent-warning" 
                />
              </div>
              <p className="text-[10px] text-muted leading-relaxed">Open or close the self-registration portal for new schools.</p>
            </label>

            <label className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-danger/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Maintenance</span>
                <input 
                  type="checkbox" 
                  checked={config.global_features.maintenance_mode} 
                  onChange={(e) => setConfig({
                    ...config,
                    global_features: { ...config.global_features, maintenance_mode: e.target.checked }
                  })}
                  className="w-5 h-5 accent-danger" 
                />
              </div>
              <p className="text-[10px] text-muted leading-relaxed">Put the entire platform into read-only maintenance mode.</p>
            </label>
          </div>
        {/* Platform Announcements */}
        <section className="bg-card border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Megaphone className="w-5 h-5 text-secondary" />
            <h2 className="font-bold text-lg">Platform Broadcasts</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted">System Announcement Banner</label>
              <textarea 
                placeholder="Enter message to display on all school dashboards..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-secondary transition-colors text-sm min-h-[100px]"
              ></textarea>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                    <input type="checkbox" className="accent-secondary" /> Global Broadcast
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                    <input type="checkbox" className="accent-secondary" /> Maintenance Alert
                  </label>
                </div>
                <button className="btn btn-outline btn-sm gap-2">
                  <Megaphone className="w-3.5 h-3.5" /> Post Announcement
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

