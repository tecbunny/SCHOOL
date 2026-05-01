export function isStudentHubDevice() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("is-eduos=true");
}

export function isClassStationDevice() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("is-class-station=true");
}
