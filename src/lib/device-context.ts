import { NextResponse } from "next/server";

export const DEVICE_COOKIE = {
  studentHub: "is-eduos",
  classStation: "is-class-station",
} as const;

const hasCookie = (cookieHeader: string | null, name: string, value = "true") => {
  if (!cookieHeader) return false;
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${name}=${value}`);
};

export function isStudentHubRequest(req: Request) {
  return req.headers.get("x-eduos") === "true" || hasCookie(req.headers.get("cookie"), DEVICE_COOKIE.studentHub);
}

export function isClassStationRequest(req: Request) {
  return req.headers.get("x-class-station") === "true" || hasCookie(req.headers.get("cookie"), DEVICE_COOKIE.classStation);
}

export function isOnlineWebPortal() {
  return process.env.NEXT_PUBLIC_ONLINE_PORTAL === "true";
}

export function requireStudentHub(req: Request) {
  if (isStudentHubRequest(req)) return null;
  return NextResponse.json(
    { error: "Student Hub device required for exams, tests, and quizzes." },
    { status: 403 }
  );
}

export function requireClassStation(req: Request) {
  if (isClassStationRequest(req)) return null;
  return NextResponse.json(
    { error: "Class Station device required for in-class assessment actions." },
    { status: 403 }
  );
}
