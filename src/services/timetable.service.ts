import { createClient } from "@/lib/supabase";
import { TimetableRepository } from "@/repositories/timetable.repository";
import { ValidationError } from "@/lib/errors";
import { TimetableSlot } from "@/types";

const supabase = createClient();
const repository = new TimetableRepository(supabase);

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
    const teacherConflicts = await repository.findTeacherConflicts(
      params.teacherId,
      params.dayOfWeek,
      params.startTime,
      params.endTime,
      params.schoolId
    );

    if (teacherConflicts.length > 0) {
      return { conflict: true, type: 'teacher', message: 'Teacher is already assigned during this slot.' };
    }

    if (params.room) {
      const roomConflicts = await repository.findRoomConflicts(
        params.room,
        params.dayOfWeek,
        params.startTime,
        params.endTime,
        params.schoolId
      );

      if (roomConflicts.length > 0) {
        return { conflict: true, type: 'room', message: 'Room is already occupied during this slot.' };
      }
    }

    return { conflict: false };
  },

  async addSchedule(schedule: TimetableSlot) {
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
      throw new ValidationError(conflictCheck.message);
    }

    return repository.createSchedule(schedule);
  }
};
