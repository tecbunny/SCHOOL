import { createClient } from "@/lib/supabase";

const supabase = createClient();

export const promotionService = {
  async getPromotionStatus() {
    const { data, error } = await supabase
      .from('platform_config')
      .select('global_features')
      .single();
    
    if (error) return false;
    return data.global_features?.is_promotion_open || false;
  },

  async promoteClass(currentClassId: string, nextGradeLevel: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch class students
    const { data: students, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name, current_grade')
      .eq('class_id', currentClassId)
      .eq('role', 'student');

    if (studentError) throw studentError;

    // 2. Execute Batch Promotion
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        current_grade: nextGradeLevel,
        academic_year: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString().slice(-2)
      })
      .eq('class_id', currentClassId)
      .eq('role', 'student');

    if (updateError) throw updateError;

    // 3. Log to History
    await supabase.from('promotion_history').insert({
      class_id: currentClassId,
      principal_id: user.id,
      student_count: students.length,
      from_grade: students[0]?.current_grade || 'unknown',
      to_grade: nextGradeLevel
    });

    return { success: true, count: students.length };
  }
};
