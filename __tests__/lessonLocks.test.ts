import { withTrackLocks } from '../src/services/lessonLocks';
import { Lesson } from '../src/types/lesson';

function lesson(id: string, type: string, order: number): Lesson {
  return { id, title: id, type, steps: [], lesson_order: order };
}

describe('withTrackLocks', () => {
  const lessons = [
    lesson('poem', 'foundations', 1),
    lesson('read', 'foundations', 2),
    lesson('line', 'grammar', 3),
    lesson('haiku', 'forms', 4),
    lesson('draft', 'foundations', 5),
  ];

  it('opens the first lesson of every track', () => {
    const locked = withTrackLocks(lessons, []);
    expect(locked.find((item) => item.id === 'poem')?.locked).toBe(false);
    expect(locked.find((item) => item.id === 'line')?.locked).toBe(false);
    expect(locked.find((item) => item.id === 'haiku')?.locked).toBe(false);
    expect(locked.find((item) => item.id === 'read')?.locked).toBe(true);
    expect(locked.find((item) => item.id === 'draft')?.locked).toBe(true);
  });

  it('unlocks the next lesson only inside the same track', () => {
    const locked = withTrackLocks(lessons, ['poem']);
    expect(locked.find((item) => item.id === 'read')?.locked).toBe(false);
    expect(locked.find((item) => item.id === 'draft')?.locked).toBe(true);
    expect(locked.find((item) => item.id === 'haiku')?.locked).toBe(false);
  });

  it('keeps a completed lesson open and unlocks the one after it', () => {
    const locked = withTrackLocks(lessons, ['read']);
    const read = locked.find((item) => item.id === 'read');
    expect(read?.completed).toBe(true);
    expect(read?.locked).toBe(false);
    expect(read?.progress).toBe(1);
    expect(locked.find((item) => item.id === 'draft')?.locked).toBe(false);
  });
});
