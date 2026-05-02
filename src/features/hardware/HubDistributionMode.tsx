"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Barcode, CheckCircle2, Lock, RefreshCw, ScanFace, Tablet, Users } from "lucide-react";

import { createClient } from "@/lib/supabase";

type Student = {
  id: string;
  full_name: string;
  user_code: string;
  class_id: string | null;
};

type Checkout = {
  id: string;
  session_id: string;
  hub_device_id: string;
  student_id: string;
  status: "checked_out" | "locked" | "returned" | "missing";
  checked_out_at: string;
  profiles?: {
    full_name: string;
    user_code: string;
  };
};

function parseHubQr(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed) as { hubId?: string; deviceId?: string };
    return parsed.hubId ?? parsed.deviceId ?? trimmed;
  } catch {
    return trimmed;
  }
}

export default function HubDistributionMode({ schoolId, classId }: { schoolId: string; classId?: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [recognizedStudentId, setRecognizedStudentId] = useState("");
  const [scannerValue, setScannerValue] = useState("");
  const [message, setMessage] = useState("Ready for face recognition.");
  const [isEnding, setIsEnding] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const supabase = useMemo(() => createClient(), []);
  const scannerRef = useRef<HTMLInputElement | null>(null);

  const recognizedStudent = students.find(student => student.id === recognizedStudentId);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setTeacherId(user?.id ?? null);

    const studentQuery = supabase
      .from("profiles")
      .select("id, full_name, user_code, class_id")
      .eq("school_id", schoolId)
      .eq("role", "student")
      .order("full_name", { ascending: true });

    if (classId) studentQuery.eq("class_id", classId);
    const { data: studentData } = await studentQuery;
    setStudents((studentData ?? []) as Student[]);

    const { data: checkoutData } = await supabase
      .from("student_hub_checkouts")
      .select("*, profiles(full_name, user_code)")
      .eq("session_id", sessionId)
      .order("checked_out_at", { ascending: false });

    setCheckouts((checkoutData ?? []) as Checkout[]);
  }, [classId, schoolId, sessionId, supabase]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    scannerRef.current?.focus();
  }, [recognizedStudentId]);

  const pairHub = async (rawQr: string) => {
    const hubDeviceId = parseHubQr(rawQr);
    if (!recognizedStudent || !teacherId || !hubDeviceId) return;

    const { error } = await supabase.from("student_hub_checkouts").insert({
      session_id: sessionId,
      school_id: schoolId,
      class_id: classId ?? recognizedStudent.class_id,
      hub_device_id: hubDeviceId,
      student_id: recognizedStudent.id,
      teacher_id: teacherId,
      status: "checked_out",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(`${recognizedStudent.full_name} paired with ${hubDeviceId}. Next student.`);
    setRecognizedStudentId("");
    setScannerValue("");
    await fetchData();
  };

  const handleScannerSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await pairHub(scannerValue);
  };

  const endSession = async () => {
    if (!teacherId) return;
    setIsEnding(true);
    const active = checkouts.filter(checkout => checkout.status === "checked_out");

    if (active.length > 0) {
      await supabase.from("device_commands").insert(active.map(checkout => ({
        target_student_id: checkout.student_id,
        issuer_id: teacherId,
        command_type: "SESSION_END",
        payload: {
          sessionId,
          hubDeviceId: checkout.hub_device_id,
          reason: "class_session_complete",
        },
      })));

      await supabase
        .from("student_hub_checkouts")
        .update({ status: "locked", locked_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("status", "checked_out");
    }

    setMessage(`Session ended. ${active.length} Hub${active.length === 1 ? "" : "s"} locked. Reconcile the cart slots now.`);
    setIsEnding(false);
    await fetchData();
  };

  return (
    <section className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary p-3 rounded-xl border border-primary/20">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Distribution Mode</h3>
            <p className="text-xs text-muted">Face-first identity, scanner-gun Hub pairing, soft return.</p>
          </div>
        </div>
        <button onClick={() => void fetchData()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1.2fr] gap-4">
        <div className="border border-white/10 rounded-xl p-4 bg-black/20 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
            <ScanFace className="w-4 h-4" />
            Face Recognized
          </div>
          <select
            value={recognizedStudentId}
            onChange={(event) => setRecognizedStudentId(event.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
          >
            <option value="">Waiting for student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.user_code})
              </option>
            ))}
          </select>

          <form onSubmit={handleScannerSubmit} className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted">USB scanner input</label>
            <input
              ref={scannerRef}
              value={scannerValue}
              onChange={(event) => setScannerValue(event.target.value)}
              disabled={!recognizedStudent}
              placeholder="Scan Hub QR code"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-40"
            />
          </form>

          <div className="text-xs text-muted leading-relaxed min-h-10">{message}</div>
        </div>

        <div className="border border-white/10 rounded-xl p-4 bg-black/20 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
              <Tablet className="w-4 h-4" />
              Active checkout
            </div>
            <span className="text-xs text-muted">{checkouts.length} paired</span>
          </div>

          <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            {checkouts.map(checkout => (
              <div key={checkout.id} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3">
                <div>
                  <div className="text-sm font-bold text-white">{checkout.profiles?.full_name ?? checkout.student_id}</div>
                  <div className="text-[10px] text-muted font-mono">{checkout.hub_device_id}</div>
                </div>
                <span className={`text-[10px] font-black uppercase ${checkout.status === "checked_out" ? "text-primary" : "text-warning"}`}>
                  {checkout.status.replace("_", " ")}
                </span>
              </div>
            ))}

            {checkouts.length === 0 && (
              <div className="py-8 text-center text-muted text-sm flex flex-col items-center gap-2">
                <Users className="w-8 h-8 opacity-40" />
                No Hubs checked out.
              </div>
            )}
          </div>

          <button
            onClick={endSession}
            disabled={isEnding || checkouts.length === 0}
            className="btn btn-primary justify-center gap-2 disabled:opacity-50"
          >
            {isEnding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            End Session and Lock Hubs
          </button>

          {checkouts.some(checkout => checkout.status === "locked") && (
            <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              Hubs are locked. Reconcile numbered cart slots; missing devices remain tied to the last checked-out student.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
