import { Lesson } from '../types/lesson';

/** Lock each lesson behind the previous lesson of the same type. The list must be in lesson_order. */
export const withTrackLocks = (lessonList: Lesson[], completedIds: string[]): Lesson[] => {
  const previousInTrack = new Map<string, string>();

  return lessonList.map((lesson) => {
    const prevId = previousInTrack.get(lesson.type);
    previousInTrack.set(lesson.type, lesson.id);

    const completed = completedIds.includes(lesson.id);
    const prerequisiteMet = !prevId || completedIds.includes(prevId);

    return {
      ...lesson,
      completed,
      locked: !prerequisiteMet && !completed,
      progress: completed ? 1 : 0,
    };
  });
};
