import { analyticsRepository } from "../repositories/analytics.repository";

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
    const students = await analyticsRepository.getStudentsByClass(classId);
    const studentIds = students.map((s: { id: string }) => s.id);
    
    const mastery = await analyticsRepository.getMasteryByStudents(studentIds);

    const categories = {
      academic: 0,
      socio_emotional: 0,
      physical: 0
    };

    mastery.forEach((m: { category: string; score: number }) => {
      const score = Number(m.score) || 0;
      if (m.category === 'academic') categories.academic += score;
      if (m.category === 'socio_emotional') categories.socio_emotional += score;
      if (m.category === 'physical') categories.physical += score;
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
    return await analyticsRepository.getHardwareFleetStatus();
  },

  async triggerOtaUpdate(nodeId: string, releaseId: string) {
    return await analyticsRepository.triggerOtaUpdate(nodeId, releaseId);
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
    const { schools, studentCount, paperCount, requestCount } = await analyticsRepository.getGlobalStatsData();

    const statusDistribution = countBy(schools, 'status');

    return {
      totalSchools: schools.length,
      activeSchools: statusDistribution.active || 0,
      totalStudents: studentCount,
      totalPapers: paperCount,
      totalRequests: requestCount,
      planDistribution: countBy(schools, 'plan_type'),
      statusDistribution
    };
  },

  async getSchoolStats(schoolId: string) {
    const { studentCount, staffCount, attendance, schoolCpd } = await analyticsRepository.getSchoolStatsData(schoolId);

    const totalCpdHours = schoolCpd.reduce((acc: number, curr: { hours_logged: number | string }) => acc + Number(curr.hours_logged || 0), 0);
    const validStaffCount = staffCount || 1;

    const presentCount = attendance.filter((a: { status: string }) => a.status === 'present').length;
    const totalAttendance = attendance.length || 1;

    return {
      totalStudents: studentCount,
      totalStaff: staffCount,
      avgAttendance: ((presentCount / totalAttendance) * 100).toFixed(1),
      avgCpd: (totalCpdHours / validStaffCount).toFixed(1)
    };
  },

  async getTeacherStats(teacherId: string, schoolId: string) {
    const { cpd, studentCount, pendingGradingCount } = await analyticsRepository.getTeacherStatsData(teacherId, schoolId);

    const totalCpd = cpd.reduce((acc: number, curr: { hours_logged: number | string }) => acc + Number(curr.hours_logged || 0), 0);

    return {
      totalCpdHours: totalCpd,
      connectedStudents: studentCount,
      pendingGrading: pendingGradingCount
    };
  },

  async getAnnouncements(schoolId: string) {
    return await analyticsRepository.getAnnouncements(schoolId);
  },

  async getTimetable(classId: string, schoolId: string) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    return await analyticsRepository.getTimetable(classId, schoolId, today);
  },

  async getMaterials(schoolId: string, subject?: string) {
    return await analyticsRepository.getMaterials(schoolId, subject);
  },

  async getStudentStats(studentId: string) {
    const { attendance, grades, competencies } = await analyticsRepository.getStudentStatsData(studentId);

    const presentCount = attendance.filter((a: { status: string }) => a.status === 'present').length;
    const totalDays = attendance.length || 1;

    const categories = { academic: 0, socio_emotional: 0, physical: 0 };
    competencies.forEach((c: { category: string; score: number | string }) => {
      const cat = c.category as keyof typeof categories;
      if (cat in categories) {
        categories[cat] += Number(c.score || 0);
      }
    });

    const compCount = competencies.length || 1;
    const averageGrade = grades.length 
      ? (grades.reduce((acc: number, curr: { marks_obtained: number | string }) => acc + Number(curr.marks_obtained || 0), 0) / grades.length).toFixed(1) 
      : '0';

    return {
      attendanceRate: ((presentCount / totalDays) * 100).toFixed(1),
      averageGrade,
      mastery: {
        academic: Math.round(categories.academic / compCount),
        socio_emotional: Math.round(categories.socio_emotional / compCount),
        physical: Math.round(categories.physical / compCount)
      }
    };
  }
};
