const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const checks = [
  { path: "/", name: "Landing" },
  { path: "/school", name: "School portal" },
  { path: "/school/student", name: "EduOS student station" },
  { path: "/school/teacher", name: "EduOS class station" },
  { path: "/eduos/setup", name: "EduOS first boot setup" },
  { path: "/admin", name: "Admin entry" },
  { path: "/auditor", name: "Auditor entry" },
  { path: "/api/eduos/station-config", name: "Station config API" },
];

const failures = [];

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const ok = response.status >= 200 && response.status < 400;
    const body = await response.text();
    if (!ok || body.length < 20) {
      failures.push(`${check.name} (${check.path}) returned ${response.status}`);
      continue;
    }
    console.log(`ok ${check.name} ${response.status}`);
  } catch (error) {
    failures.push(`${check.name} (${check.path}) failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error("\nSmoke test failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nSmoke checks passed against ${baseUrl}`);
