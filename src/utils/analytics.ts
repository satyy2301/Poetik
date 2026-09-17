type AnalyticsEvent =
  | 'signup'
  | 'login'
  | 'publish_poem'
  | 'lesson_complete'
  | 'quiz_complete'
  | 'challenge_complete'
  | 'follow_user'
  | 'screen_view';

type EventProps = Record<string, string | number | boolean | undefined>;

const queue: { event: AnalyticsEvent; props: EventProps; ts: number }[] = [];

let enabled = !__DEV__;
let posthogKey = '';

export const initAnalytics = (options?: { enabled?: boolean; posthogKey?: string }) => {
  if (options?.enabled !== undefined) enabled = options.enabled;
  if (options?.posthogKey) posthogKey = options.posthogKey;
};

export const trackEvent = (event: AnalyticsEvent, props: EventProps = {}) => {
  const payload = { event, props, ts: Date.now() };
  queue.push(payload);

  if (__DEV__) {
    console.log('[analytics]', event, props);
    return;
  }

  if (!enabled) return;

  if (posthogKey) {
    fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: posthogKey,
        event,
        properties: { ...props, platform: 'mobile' },
      }),
    }).catch(() => {});
  }
};

export const trackScreen = (screenName: string) => {
  trackEvent('screen_view', { screen: screenName });
};

export const flushAnalytics = () => queue.slice();
