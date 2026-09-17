import { detectSpam } from '../../src/utils/spamDetection';

describe('spamDetection', () => {
  it('flags very short content', () => {
    const result = detectSpam('hi');
    expect(result.isSpam).toBe(true);
  });

  it('flags spam phrases', () => {
    const result = detectSpam('Click here for free money and crypto giveaway now!');
    expect(result.isSpam).toBe(true);
  });

  it('allows normal poem content', () => {
    const poem = `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood`;
    const result = detectSpam(poem);
    expect(result.isSpam).toBe(false);
  });
});
