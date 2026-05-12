import { staffRepository } from "@/repositories/staff.repository";
import { 
  UploadMaterialMetadata, 
  PostAnnouncementDto, 
  BiometricLogDto, 
  RubricDto,
  Syllabus,
  TeacherProfile,
  Announcement
} from "@/types";
import { DatabaseError, UnauthorizedError, NotFoundError } from "@/lib/errors";

function getMaterialType(file: File, selectedType: string): string {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  return selectedType.toLowerCase();
}

export const staffService = {
  // Content Management
  async uploadMaterial(file: File, metadata: UploadMaterialMetadata): Promise<any> {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `materials/${Date.now()}_${safeName}`;
      
      const { profile } = await staffRepository.getUserProfile();

      const uploadData = await staffRepository.uploadMaterialFile(fileName, file, file.type || undefined);

      const publicUrl = staffRepository.getMaterialPublicUrl(uploadData.path);

      await staffRepository.insertMaterial({
        file_url: publicUrl || uploadData.path,
        file_name: metadata.title,
        subject: metadata.subject,
        material_type: getMaterialType(file, metadata.type),
        school_id: profile.school_id
      });

      return uploadData;
    } catch (error: any) {
      if (error instanceof UnauthorizedError || error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error uploading material: ${error.message || 'Unknown'}`);
    }
  },

  async getSyllabus(): Promise<Syllabus[]> {
    try {
      return await staffRepository.fetchSyllabus();
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error fetching syllabus: ${error.message || 'Unknown'}`);
    }
  },

  // School Settings (HOD)
  async getAttendanceMode(): Promise<string> {
    try {
      const authData = await staffRepository.getOptionalUserProfile();
      if (!authData?.profile?.school_id) return 'morning';

      const mode = await staffRepository.getSchoolAttendanceMode(authData.profile.school_id);
      return mode || 'morning';
    } catch (error: any) {
      console.error('Error fetching attendance mode:', error);
      return 'morning'; // Fallback
    }
  },

  async updateAttendanceMode(mode: 'morning' | 'subject'): Promise<void> {
    try {
      const { profile } = await staffRepository.getUserProfile();
      await staffRepository.updateSchoolAttendanceMode(profile.school_id, mode);
    } catch (error: any) {
      if (error instanceof UnauthorizedError || error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error updating attendance mode: ${error.message || 'Unknown'}`);
    }
  },

  // Staff Management
  async getTeachers(): Promise<TeacherProfile[]> {
    try {
      return await staffRepository.fetchTeachers();
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error fetching teachers: ${error.message || 'Unknown'}`);
    }
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      return await staffRepository.fetchAnnouncements();
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error fetching announcements: ${error.message || 'Unknown'}`);
    }
  },

  async postAnnouncement(announcement: PostAnnouncementDto): Promise<Announcement> {
    try {
      const profile = await staffRepository.getFirstProfile();
      return await staffRepository.insertAnnouncement({ ...announcement, school_id: profile?.school_id });
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error posting announcement: ${error.message || 'Unknown'}`);
    }
  },

  // Phase 7: Biometric Hardware Sync
  async syncBiometricAttendance(logs: BiometricLogDto[]): Promise<any> {
    try {
      const { profile } = await staffRepository.getUserProfile();

      const attendanceData = logs.map(log => ({
        student_id: log.student_id,
        date: log.timestamp.split('T')[0],
        status: 'present',
        school_id: profile.school_id
      }));

      return await staffRepository.upsertAttendance(attendanceData);
    } catch (error: any) {
      if (error instanceof UnauthorizedError || error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Unexpected error syncing biometric attendance: ${error.message || 'Unknown'}`);
    }
  },

  // Phase 8: AI Grading Bridge
  async getAiGradingSuggestion(worksheetImage: string, rubric: RubricDto): Promise<any> {
    try {
      const res = await fetch('/api/ai/vision-grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-class-station': 'true'
        },
        body: JSON.stringify({ image: worksheetImage, rubric })
      });
      if (!res.ok) {
        throw new DatabaseError(`AI grading suggestion failed with status: ${res.status}`);
      }
      return res.json();
    } catch (error: any) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(`Unexpected error getting AI grading suggestion: ${error.message || 'Unknown'}`);
    }
  }
};
