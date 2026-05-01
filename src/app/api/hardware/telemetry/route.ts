import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-auth";
import { verifyHardwareNode } from "@/lib/hardware-auth";

export async function POST(req: Request) {
  try {
    const { nodeId, temp, disk_usage, memory_usage, uptime } = await req.json();
    if (!nodeId || typeof temp !== "number") {
      return NextResponse.json({ error: "Node id and temperature are required." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const auth = await verifyHardwareNode(supabase, nodeId, req.headers.get("x-node-secret"));
    if (!auth.ok) return auth.response;

    // 1. Update Node Status & Telemetry
    const { error } = await supabase
      .from('hardware_nodes')
      .update({
        temp,
        last_heartbeat: new Date().toISOString(),
        status: 'online'
      })
      .eq('id', auth.node.id);

    if (error) throw error;

    // 2. Log Detailed Telemetry to System Logs
    const { logger } = await import("@/services/logger.service");
    await logger.log({
      eventType: 'HARDWARE',
      severity: temp > 75 ? 'warning' : 'info',
      message: `Node ${nodeId} reported telemetry.`,
      metadata: { disk_usage, memory_usage, uptime, temp }
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Telemetry report failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
