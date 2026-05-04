import { randomBytes } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type EduOsDeviceRole = "student-hub" | "class-station";

export type EduOsStationConfig = {
  stationId: string;
  schoolCode: string;
  deviceRole: EduOsDeviceRole;
  stationSigningSecret: string;
  configuredAt: string;
};

const LOCAL_STATE_DIR = process.env.EDUOS_LOCAL_STATE_DIR ?? path.join(process.cwd(), ".eduos-local");
const CONFIG_FILE = path.join(LOCAL_STATE_DIR, "station-config.json");

function normalizeStationId(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

export function readStationConfig(): EduOsStationConfig | null {
  if (!existsSync(CONFIG_FILE)) return null;

  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as EduOsStationConfig;
  } catch {
    return null;
  }
}

export function getConfiguredStationId() {
  return process.env.EDUOS_STATION_ID || readStationConfig()?.stationId || null;
}

export function getConfiguredStationSigningSecret() {
  return process.env.EDUOS_STATION_SIGNING_SECRET || readStationConfig()?.stationSigningSecret || null;
}

export function isStationConfigured() {
  return Boolean(getConfiguredStationId() && getConfiguredStationSigningSecret());
}

export function shouldRequireFirstBootSetup() {
  return process.env.EDUOS_STANDALONE === "true" && !isStationConfigured();
}

export function writeStationConfig(input: {
  stationId: string;
  schoolCode: string;
  deviceRole: EduOsDeviceRole;
}) {
  mkdirSync(LOCAL_STATE_DIR, { recursive: true });

  const config: EduOsStationConfig = {
    stationId: normalizeStationId(input.stationId),
    schoolCode: input.schoolCode.trim().toUpperCase(),
    deviceRole: input.deviceRole,
    stationSigningSecret: randomBytes(32).toString("hex"),
    configuredAt: new Date().toISOString(),
  };

  writeFileSync(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return config;
}
