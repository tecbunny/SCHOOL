"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  HelpCircle,
  Network,
  RefreshCw,
  Smartphone,
  WifiOff,
} from "lucide-react";

type HealthStatus = "ok" | "warning" | "critical";

type DiagnosticItem = {
  id: string;
  label: string;
  status: HealthStatus;
  value: string;
  instruction: string;
};

type LocalDiagnostics = {
  stationId: string;
  capturedAt: string;
  browserOnline: boolean;
  storageUsagePercent: number | null;
  pendingExamEvents: number;
  pendingLiveTests: number;
  lastKnownUrl: string;
  userAgent: string;
};

const SUPPORT_BASE_URL = "https://support.tecbunny.local/edge-report";

function base64Url(value: string) {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getStationId() {
  const existing = window.localStorage.getItem("eduportal.station-id");
  if (existing) return existing;

  const created = `class-station-${crypto.randomUUID()}`;
  window.localStorage.setItem("eduportal.station-id", created);
  return created;
}

function countPendingExamEvents() {
  return Object.keys(window.localStorage)
    .filter(key => key.startsWith("eduportal.live-test."))
    .reduce((total, key) => {
      try {
        const state = JSON.parse(window.localStorage.getItem(key) ?? "{}") as { queue?: unknown[] };
        return total + (Array.isArray(state.queue) ? state.queue.length : 0);
      } catch {
        return total;
      }
    }, 0);
}

function countPendingLiveTests() {
  return Object.keys(window.localStorage).filter(key => key.startsWith("eduportal.live-test.")).length;
}

function buildItems(diagnostics: LocalDiagnostics): DiagnosticItem[] {
  const storageStatus: HealthStatus =
    diagnostics.storageUsagePercent === null ? "warning" :
    diagnostics.storageUsagePercent >= 95 ? "critical" :
    diagnostics.storageUsagePercent >= 85 ? "warning" :
    "ok";

  return [
    {
      id: "internet",
      label: "Broadband link",
      status: diagnostics.browserOnline ? "ok" : "critical",
      value: diagnostics.browserOnline ? "Browser reports online" : "No upstream internet detected",
      instruction: diagnostics.browserOnline
        ? "Cloud sync can be attempted. Keep the Class Station powered on until receipts complete."
        : "Check the router power light, then check the WAN or fiber cable from the wall box.",
    },
    {
      id: "storage",
      label: "Local storage",
      status: storageStatus,
      value: diagnostics.storageUsagePercent === null ? "Browser quota unavailable" : `${diagnostics.storageUsagePercent}% used`,
      instruction: storageStatus === "critical"
        ? "Stop new tests. Export old reports or call support before continuing."
        : storageStatus === "warning"
          ? "Finish pending sync, then archive old exam drafts from this station."
          : "Storage is healthy for offline exams and answer autosave.",
    },
    {
      id: "queue",
      label: "Unsynced exam queue",
      status: diagnostics.pendingExamEvents > 100 ? "critical" : diagnostics.pendingExamEvents > 0 ? "warning" : "ok",
      value: `${diagnostics.pendingExamEvents} pending event${diagnostics.pendingExamEvents === 1 ? "" : "s"}`,
      instruction: diagnostics.pendingExamEvents > 0
        ? "Do not shut down. Keep tablets connected and use the QR support bridge if broadband stays down."
        : "No unsynced exam answers are waiting on this browser profile.",
    },
    {
      id: "student-wifi",
      label: "Student Wi-Fi",
      status: diagnostics.browserOnline ? "ok" : "warning",
      value: diagnostics.browserOnline ? "No local browser alarm" : "Cannot verify from cloud",
      instruction: "Ask one student hub to open the Student Dashboard. If it fails, restart only the classroom router.",
    },
  ];
}

export default function OfflineHealthDashboard() {
  const [diagnostics, setDiagnostics] = useState<LocalDiagnostics | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  const refresh = async () => {
    let storageUsagePercent: number | null = null;

    try {
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.usage !== undefined) {
          storageUsagePercent = Math.round((estimate.usage / estimate.quota) * 100);
        }
      }
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Storage estimate failed.");
    }

    setDiagnostics({
      stationId: getStationId(),
      capturedAt: new Date().toISOString(),
      browserOnline: navigator.onLine,
      storageUsagePercent,
      pendingExamEvents: countPendingExamEvents(),
      pendingLiveTests: countPendingLiveTests(),
      lastKnownUrl: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  useEffect(() => {
    void refresh();
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.clearInterval(timer);
    };
  }, []);

  const items = useMemo(() => diagnostics ? buildItems(diagnostics) : [], [diagnostics]);
  const worstStatus = items.some(item => item.status === "critical")
    ? "critical"
    : items.some(item => item.status === "warning")
      ? "warning"
      : "ok";
  const qrUrl = diagnostics
    ? `${SUPPORT_BASE_URL}?p=${base64Url(JSON.stringify({
      ...diagnostics,
      items: items.map(({ id, status, value }) => ({ id, status, value })),
    }))}`
    : "";

  const statusStyle = {
    ok: "text-success border-success/20 bg-success/10",
    warning: "text-warning border-warning/20 bg-warning/10",
    critical: "text-danger border-danger/20 bg-danger/10",
  } satisfies Record<HealthStatus, string>;

  return (
    <section className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${statusStyle[worstStatus]}`}>
            {worstStatus === "ok" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Offline Health</h3>
            <p className="text-xs text-muted">Class Station diagnostics that work without cloud access.</p>
          </div>
        </div>
        <button onClick={() => void refresh()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className={`border rounded-xl p-4 ${statusStyle[item.status]}`}>
            <div className="flex items-center gap-2 mb-2">
              {item.id === "internet" && <Network className="w-4 h-4" />}
              {item.id === "storage" && <HardDrive className="w-4 h-4" />}
              {item.id === "queue" && <HelpCircle className="w-4 h-4" />}
              {item.id === "student-wifi" && <WifiOff className="w-4 h-4" />}
              <div className="text-xs font-black uppercase tracking-widest">{item.label}</div>
            </div>
            <div className="text-sm font-bold text-white">{item.value}</div>
            <p className="text-[11px] leading-relaxed text-muted mt-2">{item.instruction}</p>
          </div>
        ))}
      </div>

      {diagnostics && worstStatus !== "ok" && (
        <div className="grid grid-cols-[140px_1fr] gap-4 items-center border border-white/10 rounded-xl p-4 bg-black/20">
          <div className="bg-white p-2 rounded-lg">
            <QRCodeSVG value={qrUrl} size={124} marginSize={1} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-warning font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              Scan with teacher phone
            </div>
            <p className="text-xs text-muted leading-relaxed">
              This QR carries the station id, offline status, storage pressure, and pending exam queue count so support can diagnose an air-gapped failure through the teacher phone.
            </p>
            <div className="text-[10px] text-muted font-mono break-all">Station: {diagnostics.stationId}</div>
          </div>
        </div>
      )}

      {storageError && <p className="text-[11px] text-warning">Storage diagnostic note: {storageError}</p>}
    </section>
  );
}
