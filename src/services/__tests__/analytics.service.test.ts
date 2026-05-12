import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { analyticsService } from '../analytics.service';
import { analyticsRepository } from '../../repositories/analytics.repository';

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('getClassHealthSnapshot calculates correct averages', async () => {
    jest.spyOn(analyticsRepository, 'getStudentsByClass').mockResolvedValue([
      { id: 's1', full_name: 'Student 1' },
      { id: 's2', full_name: 'Student 2' }
    ]);

    jest.spyOn(analyticsRepository, 'getMasteryByStudents').mockResolvedValue([
      { category: 'academic', score: 80 },
      { category: 'academic', score: 90 },
      { category: 'socio_emotional', score: 75 },
      { category: 'physical', score: 85 }
    ]);

    const snapshot = await analyticsService.getClassHealthSnapshot('class-1');

    expect(analyticsRepository.getStudentsByClass).toHaveBeenCalledWith('class-1');
    expect(analyticsRepository.getMasteryByStudents).toHaveBeenCalledWith(['s1', 's2']);
    
    expect(snapshot.studentCount).toBe(2);
    expect(snapshot.averageMastery.academic).toBe('42.50');
    expect(snapshot.averageMastery.socio_emotional).toBe('18.75');
    expect(snapshot.averageMastery.physical).toBe('21.25');
  });

  it('getGlobalStats returns expected aggregations', async () => {
    jest.spyOn(analyticsRepository, 'getGlobalStatsData').mockResolvedValue({
      schools: [
        { id: '1', plan_type: 'premium', status: 'active' },
        { id: '2', plan_type: 'basic', status: 'active' },
        { id: '3', plan_type: 'premium', status: 'inactive' }
      ],
      studentCount: 150,
      paperCount: 20,
      requestCount: 5
    });

    const stats = await analyticsService.getGlobalStats();

    expect(stats.totalSchools).toBe(3);
    expect(stats.activeSchools).toBe(2);
    expect(stats.totalStudents).toBe(150);
    expect(stats.planDistribution).toEqual({ premium: 2, basic: 1 });
    expect(stats.statusDistribution).toEqual({ active: 2, inactive: 1 });
  });

  it('getSchoolStats processes attendance and cpd correctly', async () => {
    jest.spyOn(analyticsRepository, 'getSchoolStatsData').mockResolvedValue({
      studentCount: 100,
      staffCount: 10,
      attendance: [
        { status: 'present' }, { status: 'absent' }, { status: 'present' }, { status: 'present' }
      ],
      schoolCpd: [
        { hours_logged: 2 }, { hours_logged: 3 }
      ]
    });

    const stats = await analyticsService.getSchoolStats('school-1');

    expect(stats.totalStudents).toBe(100);
    expect(stats.totalStaff).toBe(10);
    expect(stats.avgAttendance).toBe('75.0'); 
    expect(stats.avgCpd).toBe('0.5'); 
  });
});
