import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const timetableService = {
  async checkConflicts(params: {
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    roomId?: string;
  }) {
    // 1. Check Teacher Conflict
    const { data: teacherConflicts } = await supabase
      .from('timetables')
      .select('*')
      .eq('teacher_id', params.teacherId)
      .eq('day_of_week', params.dayOfWeek)
      .or(`start_time.lte.${params.endTime},end_time.gte.${params.startTime}`);

    if (teacherConflicts && teacherConflicts.length > 0) {
      return { conflict: true, type: 'teacher', message: 'Teacher is already assigned during this slot.' };
    }

    // 2. Check Room Conflict
    if (params.roomId) {
      const { data: roomConflicts } = await supabase
        .from('timetables')
        .select('*')
        .eq('room_id', params.roomId)
        .eq('day_of_week', params.dayOfWeek)
        .or(`start_time.lte.${params.endTime},end_time.gte.${params.startTime}`);

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
      roomId: schedule.room_id
    });

    if (conflictCheck.conflict) {
      throw new Error(conflictCheck.message);
    }

    const { data, error } = await supabase
      .from('timetables')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
