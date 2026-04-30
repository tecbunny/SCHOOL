import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nodeId, currentVersion, releaseType } = await req.json();
    const supabase = createClient();

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
      node_id: nodeId,
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
