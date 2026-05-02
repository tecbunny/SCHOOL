import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-auth";
import { verifySignedHardwareRequest } from "@/lib/hardware-auth";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const { temp, disk_usage, memory_usage, uptime } = JSON.parse(bodyText);
    if (typeof temp !== "number") {
      return NextResponse.json({ error: "Temperature is required." }, { status: 400 });
    }
    if (temp < -20 || temp > 125) {
      return NextResponse.json({ error: "Temperature is outside the accepted telemetry range." }, { status: 400 });
    }
    for (const [field, value] of Object.entries({ disk_usage, memory_usage })) {
      if (value !== undefined && (typeof value !== "number" || value < 0 || value > 100)) {
        return NextResponse.json({ error: `${field} must be a percentage from 0 to 100.` }, { status: 400 });
      }
    }
    if (uptime !== undefined && (typeof uptime !== "number" || uptime < 0)) {
      return NextResponse.json({ error: "Uptime must be a positive number." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const auth = await verifySignedHardwareRequest(supabase, req, bodyText);
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
      message: `Node ${auth.node.id} reported telemetry.`,
      metadata: { disk_usage, memory_usage, uptime, temp }
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Telemetry report failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
