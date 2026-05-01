import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-auth";
import { verifyHardwareNode } from "@/lib/hardware-auth";

export async function POST(req: Request) {
  try {
    const { nodeId, currentVersion, releaseType } = await req.json();
    if (!nodeId || !currentVersion || !releaseType) {
      return NextResponse.json({ error: "Node id, version, and release type are required." }, { status: 400 });
    }
    if (!["os", "pwa"].includes(releaseType)) {
      return NextResponse.json({ error: "Unsupported release type." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const auth = await verifyHardwareNode(supabase, nodeId, req.headers.get("x-node-secret"));
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

    // 2. Compare versions (simple string comparison for now)
    const isNewer = latestRelease.version_code !== currentVersion;

    // 3. Log the check-in from the node
    await supabase.from('fleet_deployments').upsert({
      node_id: auth.node.id,
      release_id: latestRelease.id,
      status: isNewer ? 'pending' : 'installed',
      updated_at: new Date().toISOString()
    });

    // 4. Log Hardware Event
    const { logger } = await import("@/services/logger.service");
    await logger.log({
      eventType: 'HARDWARE',
      severity: isNewer ? 'info' : 'info',
      message: `Node ${nodeId} checked for updates. Available: ${isNewer}`,
      metadata: { current_version: currentVersion, release_type: releaseType, update_found: isNewer }
    });

    return NextResponse.json({
      update_available: isNewer,
      version: latestRelease.version_code,
      url: latestRelease.download_url,
      checksum: latestRelease.checksum,
      is_mandatory: latestRelease.is_mandatory,
      changelog: latestRelease.changelog
    });

  } catch (err) {
    console.error("Update check failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
