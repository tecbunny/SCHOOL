import { createClient } from "@/lib/supabase";
import { DatabaseError } from "@/lib/errors";

const supabase = createClient();

export class AnalyticsRepository {
  async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('class_id', classId)
      .eq('role', 'student');
    if (error) throw new DatabaseError(error.message);
    return data || [];
  }

  async getMasteryByStudents(studentIds: string[]) {
    if (!studentIds.length) return [];
    const { data, error } = await supabase
      .from('hpc_competencies')
      .select('*')
      .in('student_id', studentIds);
    if (error) throw new DatabaseError(error.message);
    return data || [];
  }

  async getHardwareFleetStatus() {
    const { data, error } = await supabase
      .from('hardware_nodes')
      .select('*')
      .order('last_heartbeat', { ascending: false });
    if (error) throw new DatabaseError(error.message);
    return data || [];
  }

  async triggerOtaUpdate(nodeId: string, releaseId: string) {
    const { error } = await supabase
      .from('fleet_deployments')
      .upsert({
        node_id: nodeId,
        release_id: releaseId,
        status: 'pending',
        updated_at: new Date().toISOString()
      });
    if (error) throw new DatabaseError(error.message);
    return { success: true };
  }

  async getGlobalStatsData() {
    const [schools, students, papers, requests] = await Promise.all([
      supabase.from('schools').select('id, plan_type, status'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('exam_papers').select('*', { count: 'exact', head: true }),
      supabase.from('registration_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    if (schools.error) throw new DatabaseError(schools.error.message);
    if (students.error) throw new DatabaseError(students.error.message);
    if (papers.error) throw new DatabaseError(papers.error.message);
    if (requests.error) throw new DatabaseError(requests.error.message);

    return {
      schools: schools.data || [],
      studentCount: students.count || 0,
      paperCount: papers.count || 0,
      requestCount: requests.count || 0
    };
  }

  async getSchoolStatsData(schoolId: string) {
    const today = new Date().toISOString().split('T')[0];
    const [students, staff, attendance, schoolCpd] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).neq('role', 'student'),
      supabase.from('attendance').select('status').eq('school_id', schoolId).eq('date', today),
      supabase.from('cpd_logs').select('hours_logged, profiles!inner(school_id)').eq('profiles.school_id', schoolId)
    ]);

    if (students.error) throw new DatabaseError(students.error.message);
    if (staff.error) throw new DatabaseError(staff.error.message);
    if (attendance.error) throw new DatabaseError(attendance.error.message);
    if (schoolCpd.error) throw new DatabaseError(schoolCpd.error.message);

    return {
      studentCount: students.count || 0,
      staffCount: staff.count || 0,
      attendance: attendance.data || [],
      schoolCpd: schoolCpd.data || []
    };
  }

  async getTeacherStatsData(teacherId: string, schoolId: string) {
    const [cpd, students, assignments] = await Promise.all([
      supabase.from('cpd_logs').select('hours_logged').eq('teacher_id', teacherId),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
      supabase.from('assignments').select('id').eq('teacher_id', teacherId)
    ]);

    if (cpd.error) throw new DatabaseError(cpd.error.message);
    if (students.error) throw new DatabaseError(students.error.message);
    if (assignments.error) throw new DatabaseError(assignments.error.message);

    let pendingGradingCount = 0;
    const assignmentData = assignments.data || [];
    if (assignmentData.length > 0) {
      const assignmentIds = assignmentData.map((a: { id: string }) => a.id);
      const { count, error } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .eq('status', 'submitted');
      
      if (error) throw new DatabaseError(error.message);
      pendingGradingCount = count || 0;
    }

    return {
      cpd: cpd.data || [],
      studentCount: students.count || 0,
      pendingGradingCount
    };
  }

  async getAnnouncements(schoolId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw new DatabaseError(error.message);
    return data || [];
  }

  async getTimetable(classId: string, schoolId: string, today: string) {
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('class_id', classId)
      .eq('school_id', schoolId)
      .eq('day_of_week', today)
      .order('start_time', { ascending: true });

    if (error) throw new DatabaseError(error.message);
    return data || [];
  }

  async getMaterials(schoolId: string, subject?: string) {
    let query = supabase
      .from('materials')
      .select('*')
      .eq('school_id', schoolId);
    
    if (subject && subject !== 'All') {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new DatabaseError(error.message);
    return data || [];
  }

  async getStudentStatsData(studentId: string) {
    const [attendance, grades, competencies] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', studentId),
      supabase.from('hpc_grades').select('*').eq('student_id', studentId),
      supabase.from('hpc_competencies').select('*').eq('student_id', studentId)
    ]);

    if (attendance.error) throw new DatabaseError(attendance.error.message);
    if (grades.error) throw new DatabaseError(grades.error.message);
    if (competencies.error) throw new DatabaseError(competencies.error.message);

    return {
      attendance: attendance.data || [],
      grades: grades.data || [],
      competencies: competencies.data || []
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
