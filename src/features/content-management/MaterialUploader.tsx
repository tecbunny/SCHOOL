"use client";

import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { staffService } from '@/services/staff.service';

export default function MaterialUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [metadata, setMetadata] = useState({
    title: '',
    subject: '',
    class: '',
    type: 'Notes'
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      await staffService.uploadMaterial(file, metadata);
      setStatus('success');
      setFile(null);
      setMetadata({ title: '', subject: '', class: '', type: 'Notes' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Material Uploader</h3>
      </div>

      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <div 
          className={`border-2 border-dashed border-white/10 rounded-2xl p-8 text-center transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
          }}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted">
              {file ? <FileText className="w-6 h-6 text-primary" /> : <Upload className="w-6 h-6" />}
            </div>
            <span className="text-sm font-medium">{file ? file.name : 'Click or drag to upload material'}</span>
            <span className="text-[10px] text-muted uppercase">PDF, MP4, JPEG (Max 50MB)</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Title</label>
            <input 
              type="text" 
              required
              value={metadata.title}
              onChange={(e) => setMetadata({...metadata, title: e.target.value})}
              placeholder="Chapter 1 Notes" 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Subject</label>
            <input 
              type="text" 
              required
              value={metadata.subject}
              onChange={(e) => setMetadata({...metadata, subject: e.target.value})}
              placeholder="Mathematics" 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Class</label>
            <select 
              value={metadata.class}
              onChange={(e) => setMetadata({...metadata, class: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white"
            >
              <option value="">Select Class</option>
              {['6', '7', '8', '9', '10', '11', '12'].map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted uppercase">Material Type</label>
            <select 
              value={metadata.type}
              onChange={(e) => setMetadata({...metadata, type: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors text-white"
            >
              <option value="Notes">Notes</option>
              <option value="Textbook">Textbook</option>
              <option value="Video">Video</option>
              <option value="Worksheet">Worksheet</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!file || loading}
          className="btn btn-primary w-full mt-2 gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Uploading...' : 'Publish Material'}
        </button>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-xs text-success animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="w-3.5 h-3.5" /> Material successfully uploaded to storage
          </div>
        )}
      </form>
    </div>
  );
}
