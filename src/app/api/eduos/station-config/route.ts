import { NextResponse } from "next/server";

import {
  readStationConfig,
  shouldRequireFirstBootSetup,
  writeStationConfig,
  type EduOsDeviceRole,
} from "@/lib/eduos-station-config";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";

const DEVICE_ROLES = new Set<EduOsDeviceRole>(["student-hub", "class-station"]);

export async function GET() {
    try {
    const config = readStationConfig();
    return NextResponse.json({
        configured: Boolean(config),
        setupRequired: shouldRequireFirstBootSetup(),
        stationId: config?.stationId ?? process.env.EDUOS_STATION_ID ?? null,
        schoolCode: config?.schoolCode ?? null,
        deviceRole: config?.deviceRole ?? process.env.EDUOS_ROLE ?? null,
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      console.error("[GET] Unhandled Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
    const body = await req.json().catch(() => ({})) as {
        stationId?: unknown;
        schoolCode?: unknown;
        deviceRole?: unknown;
        provisioningSecret?: unknown;
      };
    if (
        typeof body.provisioningSecret !== "string" ||
        !process.env.HARDWARE_PROVISIONING_SECRET ||
        body.provisioningSecret !== process.env.HARDWARE_PROVISIONING_SECRET
      ) {
        return NextResponse.json({ error: "Invalid provisioning secret." }, { status: 401 });
      }
    if (typeof body.schoolCode !== "string" || !/^SCH[A-Z0-9]{3,12}$/i.test(body.schoolCode.trim())) {
        return NextResponse.json({ error: "Enter a valid school code, for example SCH001." }, { status: 400 });
      }
    if (typeof body.stationId !== "string" || !/^[A-Z0-9-]{8,64}$/i.test(body.stationId.trim())) {
        return NextResponse.json({ error: "Station code can use letters, numbers, and hyphens only." }, { status: 400 });
      }
    if (typeof body.deviceRole !== "string" || !DEVICE_ROLES.has(body.deviceRole as EduOsDeviceRole)) {
        return NextResponse.json({ error: "Choose Student Hub or Class Station." }, { status: 400 });
      }
    const config = writeStationConfig({
        stationId: body.stationId,
        schoolCode: body.schoolCode,
        deviceRole: body.deviceRole as EduOsDeviceRole,
      });
    return NextResponse.json({
        configured: true,
        stationId: config.stationId,
        schoolCode: config.schoolCode,
        deviceRole: config.deviceRole,
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
