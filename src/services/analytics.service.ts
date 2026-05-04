import { createClient } from "@/lib/supabase";

const supabase = createClient();

type PlanDistribution = Record<string, number>;
type StatusDistribution = Record<string, number>;

const countBy = <T extends Record<string, any>>(rows: T[] | null | undefined, key: keyof T) => {
  return (rows || []).reduce<Record<string, number>>((acc, row) => {
    const value = String(row[key] || 'unknown');
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
};

export const analyticsService = {
  async getClassHealthSnapshot(classId: string) {
    // 1. Fetch Students in class
    const { data: students, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('class_id', classId)
      .eq('role', 'student');

    if (studentError) throw studentError;

    // 2. Fetch Aggregated Mastery Data (Mock logic for now)
    const { data: mastery, error: masteryError } = await supabase
      .from('hpc_competencies')
      .select('*')
      .in('student_id', students.map((s: any) => s.id));

    if (masteryError) throw masteryError;

    // 3. Process into NEP 2020 Categories
    const categories = {
      academic: 0,
      socio_emotional: 0,
      physical: 0
    };

    mastery.forEach((m: any) => {
      if (m.category === 'academic') categories.academic += m.score;
      if (m.category === 'socio_emotional') categories.socio_emotional += m.score;
      if (m.category === 'physical') categories.physical += m.score;
    });

    const count = mastery.length || 1;

    return {
      className: "Class Snapshot",
      studentCount: students.length,
      averageMastery: {
        academic: (categories.academic / count).toFixed(2),
        socio_emotional: (categories.socio_emotional / count).toFixed(2),
        physical: (categories.physical / count).toFixed(2)
      },
      generatedAt: new Date().toISOString()
    };
  },

  async getHardwareFleetStatus() {
    // Super Admin Fleet Monitoring
    const { data, error } = await supabase
      .from('hardware_nodes')
      .select('*')
      .order('last_heartbeat', { ascending: false });

    if (error) throw error;
    return data;
  },

  async triggerOtaUpdate(nodeId: string, releaseId: string) {
    const { error } = await supabase
      .from('fleet_deployments')
      .upsert({
        node_id: nodeId,
        release_id: releaseId,
        status: 'pending',
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  },

  async getGlobalStats(): Promise<{
    totalSchools: number;
    activeSchools: number;
    totalStudents: number;
    totalPapers: number;
    totalRequests: number;
    planDistribution: PlanDistribution;
    statusDistribution: StatusDistribution;
  }> {
    const [schools, students, papers, requests] = await Promise.all([
      supabase.from('schools').select('id, plan_type, status'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('exam_papers').select('*', { count: 'exact', head: true }),
      supabase.from('registration_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const schoolRows = schools.data || [];
    const statusDistribution = countBy(schoolRows, 'status');

    return {
      totalSchools: schoolRows.length,
      activeSchools: statusDistribution.active || 0,
      totalStudents: students.count || 0,
      totalPapers: papers.count || 0,
      totalRequests: requests.count || 0,
      planDistribution: countBy(schoolRows, 'plan_type'),
      statusDistribution
    };
  },

  async getSchoolStats(schoolId: string) {
    const [students, staff, attendance] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).neq('role', 'student'),
      supabase.from('attendance').select('status').eq('school_id', schoolId).eq('date', new Date().toISOString().split('T')[0])
    ]);

    // Calculate school-wide CPD avg
    const { data: schoolCpd } = await supabase
      .from('cpd_logs')
      .select('hours_logged, profiles!inner(school_id)')
      .eq('profiles.school_id', schoolId);

    const totalCpdHours = schoolCpd?.reduce((acc: number, curr: any) => acc + Number(curr.hours_logged), 0) || 0;
    const staffCount = staff.count || 1;

    // Calculate attendance %
    const presentCount = attendance.data?.filter((a: any) => a.status === 'present').length || 0;
    const totalAttendance = attendance.data?.length || 1;

    return {
      totalStudents: students.count || 0,
      totalStaff: staff.count || 0,
      avgAttendance: ((presentCount / totalAttendance) * 100).toFixed(1),
      avgCpd: (totalCpdHours / staffCount).toFixed(1)
    };
  },

  async getTeacherStats(teacherId: string, schoolId: string) {
    const [cpd, students, assignments] = await Promise.all([
      supabase.from('cpd_logs').select('hours_logged').eq('teacher_id', teacherId),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
      supabase.from('assignments').select('id').eq('teacher_id', teacherId)
    ]);

    // To properly count pending grading for this teacher, we need to know the teacher's assignments
    let pendingGradingCount = 0;
    if (assignments.data && assignments.data.length > 0) {
      const assignmentIds = assignments.data.map((a: any) => a.id);
      const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .eq('status', 'submitted');
      pendingGradingCount = count || 0;
    }

    const totalCpd = cpd.data?.reduce((acc: number, curr: any) => acc + Number(curr.hours_logged), 0) || 0;

    return {
      totalCpdHours: totalCpd,
      connectedStudents: students.count || 0,
      pendingGrading: pendingGradingCount
    };
  },

  async getAnnouncements(schoolId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  },

  async getTimetable(classId: string, schoolId: string) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('class_id', classId)
      .eq('school_id', schoolId)
      .eq('day_of_week', today)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getMaterials(schoolId: string, subject?: string) {
    let query = supabase
      .from('materials')
      .select('*')
      .eq('school_id', schoolId);
    
    if (subject && subject !== 'All') {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getStudentStats(studentId: string) {
    const [attendance, grades, competencies] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', studentId),
      supabase.from('hpc_grades').select('*').eq('student_id', studentId),
      supabase.from('hpc_competencies').select('*').eq('student_id', studentId)
    ]);

    const presentCount = attendance.data?.filter((a: any) => a.status === 'present').length || 0;
    const totalDays = attendance.data?.length || 1;

    // Aggregate competencies by category
    const categories = { academic: 0, socio_emotional: 0, physical: 0 };
    competencies.data?.forEach((c: any) => {
      if (c.category in categories) {
        categories[c.category as keyof typeof categories] += Number(c.score);
      }
    });

    const compCount = competencies.data?.length || 1;

    return {
      attendanceRate: ((presentCount / totalDays) * 100).toFixed(1),
      averageGrade: grades.data?.length ? (grades.data.reduce((acc: number, curr: any) => acc + Number(curr.marks_obtained), 0) / grades.data.length).toFixed(1) : '0',
      mastery: {
        academic: Math.round(categories.academic / compCount),
        socio_emotional: Math.round(categories.socio_emotional / compCount),
        physical: Math.round(categories.physical / compCount)
      }
    };
  }
};
