"use client";

import { Suspense } from "react";
import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MonitorCheck, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type DeviceRole = "student-hub" | "class-station";

function EduOsSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/school/student";
  const defaultRole = (searchParams.get("role") === "class-station" ? "class-station" : "student-hub") as DeviceRole;

  const [schoolCode, setSchoolCode] = useState("SCH001");
  const [stationId, setStationId] = useState("SCH001-STUDENT-HUB-01");
  const [deviceRole, setDeviceRole] = useState<DeviceRole>(defaultRole);
  const [provisioningSecret, setProvisioningSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStationId((current) => {
      const suffix = deviceRole === "student-hub" ? "STUDENT-HUB-01" : "CLASS-STATION-01";
      return current.startsWith(schoolCode) ? `${schoolCode}-${suffix}` : current;
    });
  }, [deviceRole, schoolCode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      const response = await fetch("/api/eduos/station-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode, stationId, deviceRole, provisioningSecret }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Station setup failed.");

      document.cookie = `${deviceRole === "student-hub" ? "is-eduos" : "is-class-station"}=true;path=/;max-age=31536000;samesite=lax`;
      setStatus("done");
      setTimeout(() => router.replace(next), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Station setup failed.");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-[#05070d] text-white flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-xl bg-card border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/15 border border-primary/20 rounded-2xl p-3">
            <MonitorCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black">EduOS First Boot</h1>
            <p className="text-sm text-muted mt-1">Bind this physical station before opening the kiosk.</p>
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {status === "done" && (
          <div className="bg-success/10 border border-success/30 text-success text-sm p-4 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Station saved. Opening EduOS...
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {([
            ["student-hub", "Student Hub"],
            ["class-station", "Class Station"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDeviceRole(value)}
              className={`rounded-2xl border px-4 py-4 text-left font-bold transition-all ${
                deviceRole === value ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted">School Code</span>
          <input
            value={schoolCode}
            onChange={(event) => setSchoolCode(event.target.value.toUpperCase())}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-primary font-mono"
            placeholder="SCH001"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted">Station Code</span>
          <input
            value={stationId}
            onChange={(event) => setStationId(event.target.value.toUpperCase().replace(/\s+/g, "-"))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-primary font-mono"
            placeholder="SCH001-STUDENT-HUB-01"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted">Provisioning Secret</span>
          <input
            type="password"
            value={provisioningSecret}
            onChange={(event) => setProvisioningSecret(event.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-primary"
            placeholder="Admin provisioning secret"
            required
          />
        </label>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 text-xs text-primary leading-relaxed">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          This saves the station code only on this EduOS device. Vercel keeps shared cloud settings.
        </div>

        <button type="submit" className="btn btn-primary w-full py-4 rounded-xl font-bold" disabled={status === "saving" || status === "done"}>
          {status === "saving" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register This Station"}
        </button>
      </form>
    </main>
  );
}

export default function EduOsSetupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#05070d] text-white flex items-center justify-center">Loading EduOS setup...</main>}>
      <EduOsSetupForm />
    </Suspense>
  );
}
