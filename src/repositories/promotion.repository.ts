import { createClient } from "@/lib/supabase";
import { DatabaseError } from "@/lib/errors";

const supabase = createClient();

export interface ClassSummary {
  id: string;
  name: string;
  grade: string;
  students: number;
}

export interface PromotionStudent {
  id: string;
  full_name: string;
  current_grade: string;
}

export const promotionRepository = {
  async getPromotionStatus(): Promise<boolean> {
    const { data, error } = await supabase
      .from('platform_config')
      .select('global_features')
      .single();
    
    if (error) {
        throw new DatabaseError("Failed to fetch promotion status", error);
    }
    return data.global_features?.is_promotion_open || false;
  },

  async getClassesData(): Promise<{ class_id: string; current_grade: string }[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('class_id, current_grade')
      .eq('role', 'student')
      .not('class_id', 'is', null);

    if (error) {
        throw new DatabaseError("Failed to fetch classes data", error);
    }

    return data as { class_id: string; current_grade: string }[];
  },

  async getStudentsByClass(classId: string): Promise<PromotionStudent[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, current_grade')
      .eq('class_id', classId)
      .eq('role', 'student');

    if (error) {
        throw new DatabaseError(`Failed to fetch students for class ${classId}`, error);
    }

    return data as PromotionStudent[];
  },

  async executeBatchPromotion(classId: string, nextGradeLevel: string, academicYear: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        current_grade: nextGradeLevel,
        academic_year: academicYear
      })
      .eq('class_id', classId)
      .eq('role', 'student');

    if (error) {
        throw new DatabaseError(`Failed to update grades for class ${classId}`, error);
    }
  },

  async logPromotionHistory(
      classId: string, 
      principalId: string, 
      studentCount: number, 
      fromGrade: string, 
      toGrade: string
    ): Promise<void> {
    const { error } = await supabase.from('promotion_history').insert({
      class_id: classId,
      principal_id: principalId,
      student_count: studentCount,
      from_grade: fromGrade,
      to_grade: toGrade
    });

    if (error) {
        throw new DatabaseError(`Failed to log promotion history for class ${classId}`, error);
    }
  },

  async getCurrentUser(): Promise<{ id: string } | null> {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
          return null;
      }
      return { id: user.id };
  }
};
