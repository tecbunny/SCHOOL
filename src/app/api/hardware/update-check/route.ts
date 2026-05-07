import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-auth";
import { verifySignedHardwareRequest } from "@/lib/hardware-auth";
import { AppError } from "@/lib/errors";

function compareVersion(left: string, right: string) {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const diff = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

function isMaintenanceWindow(now = new Date()) {
  const startHour = Number.parseInt(process.env.EDUOS_OTA_WINDOW_START_HOUR ?? "1", 10);
  const endHour = Number.parseInt(process.env.EDUOS_OTA_WINDOW_END_HOUR ?? "4", 10);
  const hour = now.getHours();

  if (startHour === endHour) return true;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const { currentVersion, releaseType } = JSON.parse(bodyText);
    if (!currentVersion || !releaseType) {
      return NextResponse.json({ error: "Version and release type are required." }, { status: 400 });
    }
    if (!["os", "pwa"].includes(releaseType)) {
      return NextResponse.json({ error: "Unsupported release type." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const auth = await verifySignedHardwareRequest(supabase, req, bodyText);
    if (!auth.ok) return auth.response;

    // 1. Fetch latest release of specified type
    const { data: latestRelease, error } = await supabase
      .from('fleet_releases')
      .select('*')
      .eq('release_type', releaseType)
      .order('version_code', { ascending: false })
      .limit(1)
      .single();

    if (error || !latestRelease) {
      return NextResponse.json({ update_available: false });
    }

    // 2. Compare semantic versions where possible.
    const isNewer = compareVersion(String(latestRelease.version_code), String(currentVersion)) > 0;
    const withinMaintenanceWindow = isMaintenanceWindow();
    const updateAllowed = isNewer && (withinMaintenanceWindow || latestRelease.is_mandatory === true);

    // 3. Log the check-in from the node
    await supabase.from('fleet_deployments').upsert({
      node_id: auth.node.id,
      release_id: latestRelease.id,
      status: updateAllowed ? 'pending' : 'installed',
      updated_at: new Date().toISOString()
    });

    // 4. Log Hardware Event
    const { logger } = await import("@/services/logger.service");
    await logger.log({
      eventType: 'HARDWARE',
      severity: isNewer ? 'info' : 'info',
      message: `Node ${auth.node.id} checked for updates. Available: ${isNewer}. Allowed now: ${updateAllowed}`,
      metadata: {
        current_version: currentVersion,
        release_type: releaseType,
        update_found: isNewer,
        update_allowed: updateAllowed,
        maintenance_window: {
          start_hour: process.env.EDUOS_OTA_WINDOW_START_HOUR ?? "1",
          end_hour: process.env.EDUOS_OTA_WINDOW_END_HOUR ?? "4"
        }
      }
    });

    return NextResponse.json({
      update_available: updateAllowed,
      version: latestRelease.version_code,
      url: updateAllowed ? latestRelease.download_url : null,
      checksum: updateAllowed ? latestRelease.checksum : null,
      is_mandatory: latestRelease.is_mandatory,
      maintenance_window_active: withinMaintenanceWindow,
      next_window: {
        start_hour: process.env.EDUOS_OTA_WINDOW_START_HOUR ?? "1",
        end_hour: process.env.EDUOS_OTA_WINDOW_END_HOUR ?? "4"
      },
      changelog: updateAllowed ? latestRelease.changelog : "Update deferred until the maintenance window."
    });

  } catch (error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  console.error("[POST] Unhandled Error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}
