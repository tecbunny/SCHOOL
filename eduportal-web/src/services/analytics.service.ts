import { createClient } from "@/lib/supabase";

const supabase = createClient();

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
  }
};
