import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nodeId, temp, disk_usage, memory_usage, uptime } = await req.json();
    const supabase = createClient();

    // 1. Update Node Status & Telemetry
    const { error } = await supabase
      .from('hardware_nodes')
      .update({
        temp,
        last_heartbeat: new Date().toISOString(),
        status: 'online'
      })
      .eq('id', nodeId);

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
