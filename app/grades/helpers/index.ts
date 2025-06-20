// Define the Grade type
export type Grade = {
  id: number;
  class: string;
  grade: number;
  created_at?: string;
};

/**
 * Calculate the average grade from an array of grades
 * @param grades Array of Grade objects
 * @returns The average grade rounded to 1 decimal place, or 0 if no grades
 */
export function calculateAverage(grades: Grade[]): number {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
  return Math.round((sum / grades.length) * 10) / 10;
}

/**
 * Calculate statistics for each class
 * @param grades Array of Grade objects
 * @returns Object containing statistics for each class
 */
export function calculateClassStatistics(grades: Grade[]) {
  return {
    Math: {
      count: grades.filter((grade) => grade.class === 'Math').length,
      average: calculateAverage(
        grades.filter((grade) => grade.class === 'Math')
      ),
    },
    Science: {
      count: grades.filter((grade) => grade.class === 'Science').length,
      average: calculateAverage(
        grades.filter((grade) => grade.class === 'Science')
      ),
    },
    History: {
      count: grades.filter((grade) => grade.class === 'History').length,
      average: calculateAverage(
        grades.filter((grade) => grade.class === 'History')
      ),
    },
  };
}
