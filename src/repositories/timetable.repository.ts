import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseError } from '@/lib/errors';
import { TimetableSlot } from '@/types';

export class TimetableRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findTeacherConflicts(
    teacherId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    schoolId?: string
  ): Promise<TimetableSlot[]> {
    try {
      let query = this.supabase
        .from('timetable')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dayOfWeek)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError(`Failed to fetch teacher conflicts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findRoomConflicts(
    room: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    schoolId?: string
  ): Promise<TimetableSlot[]> {
    try {
      let query = this.supabase
        .from('timetable')
        .select('*')
        .eq('room', room)
        .eq('day_of_week', dayOfWeek)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new DatabaseError(`Failed to fetch room conflicts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createSchedule(schedule: TimetableSlot): Promise<TimetableSlot> {
    try {
      const { data, error } = await this.supabase
        .from('timetable')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new DatabaseError(`Failed to create schedule: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
