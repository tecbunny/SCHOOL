type RpcClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

export type EdgeGradeInput = {
  gradeId: string;
  studentId: string;
  subject: string;
  assessmentType: string;
  marksObtained: number;
  maxMarks: number;
  cbseGrade?: string | null;
  teacherId: string;
  versionCount: number;
  editedAt?: string | null;
  originDeviceId?: string | null;
  editEventId?: string | null;
};

export function validateEdgeGrade(input: EdgeGradeInput) {
  if (!input.gradeId) throw new Error("gradeId is required.");
  if (!input.studentId) throw new Error("studentId is required.");
  if (!input.teacherId) throw new Error("teacherId is required.");
  if (!input.subject.trim()) throw new Error("subject is required.");
  if (!input.assessmentType.trim()) throw new Error("assessmentType is required.");
  if (!Number.isFinite(input.marksObtained) || !Number.isFinite(input.maxMarks)) {
    throw new Error("marksObtained and maxMarks must be finite numbers.");
  }
  if (input.maxMarks <= 0 || input.marksObtained < 0 || input.marksObtained > input.maxMarks) {
    throw new Error("marks must be within the assessment range.");
  }
  if (!Number.isInteger(input.versionCount) || input.versionCount <= 0) {
    throw new Error("versionCount must be a positive integer.");
  }
}

export async function applyEdgeGradeVersion(client: RpcClient, input: EdgeGradeInput) {
  validateEdgeGrade(input);
  const { data, error } = await client.rpc("apply_grade_edge_version", {
    p_grade_id: input.gradeId,
    p_student_id: input.studentId,
    p_subject: input.subject,
    p_assessment_type: input.assessmentType,
    p_marks_obtained: input.marksObtained,
    p_max_marks: input.maxMarks,
    p_cbse_grade: input.cbseGrade ?? null,
    p_teacher_id: input.teacherId,
    p_version_count: input.versionCount,
    p_edited_at: input.editedAt ?? null,
    p_origin_device_id: input.originDeviceId ?? null,
    p_edit_event_id: input.editEventId ?? null,
  });

  if (error) throw new Error(error.message ?? "Failed to apply edge grade version.");
  return data;
}
