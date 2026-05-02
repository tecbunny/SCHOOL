import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const timetableService = {
  async checkConflicts(params: {
    teacherId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room?: string;
    schoolId?: string;
    classId?: string;
  }) {
    let teacherQuery = supabase
      .from('timetable')
      .select('*')
      .eq('teacher_id', params.teacherId)
      .eq('day_of_week', params.dayOfWeek)
      .or(`start_time.lte.${params.endTime},end_time.gte.${params.startTime}`);

    if (params.schoolId) teacherQuery = teacherQuery.eq('school_id', params.schoolId);

    const { data: teacherConflicts } = await teacherQuery;

    if (teacherConflicts && teacherConflicts.length > 0) {
      return { conflict: true, type: 'teacher', message: 'Teacher is already assigned during this slot.' };
    }

    if (params.room) {
      let roomQuery = supabase
        .from('timetable')
        .select('*')
        .eq('room', params.room)
        .eq('day_of_week', params.dayOfWeek)
        .or(`start_time.lte.${params.endTime},end_time.gte.${params.startTime}`);

      if (params.schoolId) roomQuery = roomQuery.eq('school_id', params.schoolId);

      const { data: roomConflicts } = await roomQuery;

      if (roomConflicts && roomConflicts.length > 0) {
        return { conflict: true, type: 'room', message: 'Room is already occupied during this slot.' };
      }
    }

    return { conflict: false };
  },

  async addSchedule(schedule: any) {
    const conflictCheck = await this.checkConflicts({
      teacherId: schedule.teacher_id,
      dayOfWeek: schedule.day_of_week,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      room: schedule.room,
      schoolId: schedule.school_id,
      classId: schedule.class_id
    });

    if (conflictCheck.conflict) {
      throw new Error(conflictCheck.message);
    }

    const { data, error } = await supabase
      .from('timetable')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
