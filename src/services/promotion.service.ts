import { promotionRepository, ClassSummary } from "@/repositories/promotion.repository";
import { UnauthorizedError } from "@/lib/errors";

export const promotionService = {
  async getPromotionStatus(): Promise<boolean> {
    return promotionRepository.getPromotionStatus();
  },

  async getClasses(): Promise<ClassSummary[]> {
    const data = await promotionRepository.getClassesData();

    // Group by class_id and count students
    const classMap: Record<string, ClassSummary> = {};
    for (const p of data) {
      if (!p.class_id) continue;
      
      if (!classMap[p.class_id]) {
        classMap[p.class_id] = { 
          id: p.class_id, 
          name: `Class ${p.class_id}`, 
          grade: p.current_grade || '', 
          students: 0 
        };
      }
      classMap[p.class_id].students++;
    }

    return Object.values(classMap);
  },

  async promoteClass(currentClassId: string, nextGradeLevel: string): Promise<{ success: boolean; count: number }> {
    const user = await promotionRepository.getCurrentUser();
    if (!user) {
        throw new UnauthorizedError("Unauthorized");
    }

    // 1. Fetch class students
    const students = await promotionRepository.getStudentsByClass(currentClassId);
    if (students.length === 0) {
        return { success: true, count: 0 };
    }

    // 2. Execute Batch Promotion
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    
    await promotionRepository.executeBatchPromotion(currentClassId, nextGradeLevel, academicYear);

    // 3. Log to History
    await promotionRepository.logPromotionHistory(
      currentClassId,
      user.id,
      students.length,
      students[0]?.current_grade || 'unknown',
      nextGradeLevel
    );

    return { success: true, count: students.length };
  }
};
