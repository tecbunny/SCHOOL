"use client";

import { UserPlus, X, ShieldCheck, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AddStaffModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'teacher' | 'moderator'>('teacher');
  const [credentials, setCredentials] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/school/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, role })
      });
      const data = await res.json();
      if (res.ok) {
        setCredentials(data.credentials);
      } else {
        alert(data.error || 'Failed to create staff');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = `Staff Login Details:\nName: ${credentials.fullName}\nRole: ${credentials.role.toUpperCase()}\nLogin ID: ${credentials.loginId}\nTemporary password delivery: Secure channel pending`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
        
        {!credentials ? (
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Add New Staff</h3>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Full Legal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Deshmukh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-white placeholder:text-muted/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Assign Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-1 ${role === 'teacher' ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <span className={`text-xs font-bold ${role === 'teacher' ? 'text-primary' : 'text-muted'}`}>Teacher</span>
                    <span className="text-[10px] text-muted leading-tight">Can manage classes and grade worksheets.</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('moderator')}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-1 ${role === 'moderator' ? 'border-secondary bg-secondary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <span className={`text-xs font-bold ${role === 'moderator' ? 'text-secondary' : 'text-muted'}`}>Moderator</span>
                    <span className="text-[10px] text-muted leading-tight">Manages syllabus and digital library.</span>
                  </button>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[10px] text-muted leading-relaxed">
                  <strong>Security Protocol:</strong> Accounts are created silently on the backend. This staff member will be automatically bound to your school tenant.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancel</button>
              <button type="submit" disabled={loading || !fullName} className="btn btn-primary flex-1 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creating...' : 'Provision Account'}
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 text-center border-b border-white/5 bg-primary/5">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Provisioning Successful</h3>
              <p className="text-sm text-muted">Account created and linked to your school.</p>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 font-mono relative group">
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-muted transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="flex flex-col gap-4 text-sm">
                   <div>
                      <div className="text-[10px] text-muted uppercase mb-1">Staff Member</div>
                      <div className="text-white font-bold">{credentials.fullName}</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-muted uppercase mb-1">Login ID</div>
                        <div className="text-primary font-bold">{credentials.loginId}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted uppercase mb-1">Role</div>
                        <div className="text-white opacity-60">{credentials.role.toUpperCase()}</div>
                      </div>
                   </div>
                   <div>
                      <div className="text-[10px] text-muted uppercase mb-1">Temporary Password</div>
                      <div className="text-secondary font-bold text-sm">Sent through secure channel only</div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button onClick={copyToClipboard} className="btn btn-primary w-full gap-2">
                    <Copy className="w-4 h-4" /> Copy Login ID
                 </button>
              </div>

              <button 
                onClick={onClose}
                className="text-xs text-muted hover:text-white transition-colors text-center mt-2 underline underline-offset-4"
              >
                Close and return to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
