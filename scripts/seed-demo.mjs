import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(file) {
  const path = resolve(file);
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ||= value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || serviceKey.includes("your-") || serviceKey.includes("generated-secret")) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and a real SUPABASE_SERVICE_ROLE_KEY before running seed:demo.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const schoolCode = process.env.DEMO_SCHOOL_CODE || "DEMO-SSPH";
const demoPassword = process.env.DEMO_USER_PASSWORD || "EduPortal#2026";

async function upsertSchool() {
  const { data, error } = await supabase
    .from("schools")
    .upsert({
      school_code: schoolCode,
      school_name: "Demo SSPH School",
      status: "active",
      plan_type: "enterprise",
      attendance_mode: "subject",
    }, { onConflict: "school_code" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureUser({ email, userCode, fullName, role, schoolId, classId, teachingStaff = false }) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (createError && !createError.message.toLowerCase().includes("already")) {
    throw createError;
  }

  let userId = created?.user?.id;
  if (!userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_code", userCode)
      .maybeSingle();
    userId = profile?.id;
  }
  if (!userId) {
    const { data: users } = await supabase.auth.admin.listUsers();
    userId = users.users.find((user) => user.email === email)?.id;
  }
  if (!userId) throw new Error(`Could not resolve demo user ${email}`);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    user_code: userCode,
    full_name: fullName,
    role,
    school_id: schoolId,
    class_id: classId,
    is_teaching_staff: teachingStaff,
  }, { onConflict: "id" });
  if (profileError) throw profileError;

  return userId;
}

const schoolId = await upsertSchool();
await ensureUser({ email: "admin.demo@eduportal.local", userCode: "ADMIN-DEMO", fullName: "Demo Admin", role: "admin", schoolId });
await ensureUser({ email: "principal.demo@eduportal.local", userCode: "PRINCIPAL-DEMO", fullName: "Dr. Anika Rao", role: "principal", schoolId });
const teacherId = await ensureUser({ email: "teacher.demo@eduportal.local", userCode: "TEACHER-DEMO", fullName: "Meera Sharma", role: "teacher", schoolId, teachingStaff: true });
const studentId = await ensureUser({ email: "student.demo@eduportal.local", userCode: "STUDENT-DEMO", fullName: "Aarav Singh", role: "student", schoolId, classId: "10-A" });

await supabase.from("announcements").delete().eq("school_id", schoolId).eq("title", "Demo readiness drill").throwOnError();
await supabase.from("announcements").insert({
  school_id: schoolId,
  title: "Demo readiness drill",
  content: "EduOS stations and dashboards are seeded for validation.",
  priority: "high",
}).throwOnError();

await supabase.from("timetable").delete().eq("school_id", schoolId).eq("class_id", "10-A").in("subject", ["Math", "Science"]).throwOnError();
await supabase.from("timetable").insert([
  { school_id: schoolId, class_id: "10-A", subject: "Math", day_of_week: "Monday", start_time: "09:00", end_time: "09:45", teacher_id: teacherId },
  { school_id: schoolId, class_id: "10-A", subject: "Science", day_of_week: "Monday", start_time: "10:00", end_time: "10:45", teacher_id: teacherId },
]).throwOnError();

await supabase.from("materials").delete().eq("school_id", schoolId).eq("file_name", "Quadratic Equations Demo Notes.pdf").throwOnError();
await supabase.from("materials").insert({
  school_id: schoolId,
  file_name: "Quadratic Equations Demo Notes.pdf",
  file_url: "https://example.com/demo/quadratic-equations.pdf",
  subject: "Math",
  material_type: "notes",
  is_ai_indexed: true,
  uploaded_by: teacherId,
}).throwOnError();

await supabase.from("assignments").delete().eq("school_id", schoolId).eq("title", "Demo Quadratic Equations Practice").throwOnError();
const { data: assignment, error: assignmentError } = await supabase.from("assignments").insert({
  school_id: schoolId,
  teacher_id: teacherId,
  class_id: "10-A",
  subject: "Math",
  title: "Demo Quadratic Equations Practice",
  description: "Solve five quadratic equations and upload your working.",
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
}).select("id").single();
if (assignmentError) throw assignmentError;

await supabase.from("submissions").upsert({
  assignment_id: assignment.id,
  student_id: studentId,
  content: "Demo submitted solution URL",
  status: "graded",
  grade: 9,
  feedback: "Strong method and clear steps.",
}, { onConflict: "assignment_id,student_id" }).throwOnError();

await supabase.from("hpc_grades").insert({
  student_id: studentId,
  subject: "Math",
  assessment_type: "competency",
  marks_obtained: 18,
  max_marks: 20,
  cbse_grade: "A1",
  teacher_id: teacherId,
}).throwOnError();

await supabase.from("cpd_logs").insert({
  teacher_id: teacherId,
  activity_name: "Demo NEP classroom analytics workshop",
  hours_logged: 2,
}).throwOnError();

await supabase.from("hardware_nodes").upsert({
  school_id: schoolId,
  node_name: "Demo Student Hub 01",
  node_type: "student-hub",
  mac_address: "02:DE:MO:00:00:01",
  station_code: "DEMO-HUB-01",
  status: "online",
  temp: 42,
  disk_usage: 37,
  memory_usage: 48,
  uptime: 3600,
  version: "1.0.0",
  last_heartbeat: new Date().toISOString(),
  node_secret_hash: randomUUID().replaceAll("-", ""),
}, { onConflict: "station_code" }).throwOnError();

await supabase.from("certifications").delete().eq("school_id", schoolId).eq("certification_name", "Demo Holistic Progress Certificate").throwOnError();
await supabase.from("certifications").insert({
  school_id: schoolId,
  student_id: studentId,
  certification_name: "Demo Holistic Progress Certificate",
  issued_by: "Demo SSPH School",
  file_url: "https://example.com/demo/hpc-certificate.pdf",
}).throwOnError();

console.log("Demo seed complete.");
console.log(`School code: ${schoolCode}`);
console.log(`Demo password: ${demoPassword}`);
console.log("Users:");
console.log("- admin.demo@eduportal.local");
console.log("- principal.demo@eduportal.local");
console.log("- teacher.demo@eduportal.local");
console.log("- student.demo@eduportal.local");
