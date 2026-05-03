"use client";

import { useState, useEffect } from "react";
import { ScanFace, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function FaceEnrollment() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, user_code")
        .eq("role", "student")
        .limit(20);
      
      if (!error && data) {
        setStudents(data);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const handleEnroll = async () => {
    if (!selectedStudent) {
      setError("Please select a student.");
      return;
    }
    
    setError("");
    setScanning(true);
    setSuccess(false);

    // Simulate hardware face scanning delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a dummy 64-dimensional embedding array
    const dummyEmbedding = Array.from({ length: 64 }, () => Math.random() * 2 - 1);
    
    try {
      const response = await fetch("/api/school/face-enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          embedding: dummyEmbedding,
          embeddingModel: "eduos-v1-64d",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Enrollment failed.");
      }

      setSuccess(true);
      setSelectedStudent("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/20 p-3 rounded-2xl">
          <ScanFace className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Face Enrollment Engine</h2>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Biometric Onboarding</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <p className="text-sm font-bold text-success">Enrollment Successful</p>
            <p className="text-xs text-success/70 mt-1">The biometric template has been securely saved and synced to the Edge mesh.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-muted uppercase tracking-widest">Select Student</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={scanning || loading}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary focus:bg-white/10 transition-all appearance-none disabled:opacity-50"
            >
              <option value="" disabled className="bg-[#0a0a0a] text-muted">-- Choose a student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id} className="bg-[#0a0a0a] text-white">
                  {student.full_name} ({student.user_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8">
           <div className={`relative w-48 h-48 border-2 border-dashed rounded-full flex items-center justify-center transition-colors duration-500 ${scanning ? 'border-primary animate-pulse' : success ? 'border-success' : 'border-white/20'}`}>
              <ScanFace className={`w-20 h-20 ${scanning ? 'text-primary' : success ? 'text-success' : 'text-white/20'}`} />
              
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                  <div className="absolute -inset-4 rounded-full border-r-2 border-secondary animate-[spin_2s_linear_reverse]"></div>
                </>
              )}
           </div>
           
           <p className="mt-6 text-sm text-muted font-bold tracking-wider uppercase">
             {scanning ? 'Extracting biometric features...' : success ? 'Template Activated' : 'Ready for scan'}
           </p>
        </div>

        <button
          onClick={handleEnroll}
          disabled={scanning || loading || !selectedStudent}
          className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {scanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Processing...
            </>
          ) : (
            'Capture & Enroll'
          )}
        </button>
      </div>
    </div>
  );
}
