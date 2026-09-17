type ErrorContext = Record<string, string | number | boolean | undefined>;

let sentryDsn = '';
let initialized = false;

export const initErrorTracking = (options?: { sentryDsn?: string }) => {
  if (initialized) return;
  sentryDsn = options?.sentryDsn || '';
  initialized = true;

  if (__DEV__) {
    console.log('[errorTracking] initialized', sentryDsn ? 'with Sentry DSN' : 'console only');
  }
};

export const captureException = (error: unknown, context?: ErrorContext) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  if (__DEV__) {
    console.error('[errorTracking]', message, context, stack);
    return;
  }

  if (sentryDsn) {
    fetch(sentryDsn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: `${Date.now()}`,
        message,
        extra: context,
        platform: 'javascript',
      }),
    }).catch(() => {});
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (__DEV__) {
    console.log(`[errorTracking:${level}]`, message);
    return;
  }
  captureException(new Error(message), { level });
};

export const withErrorBoundary = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: ErrorContext,
): T => {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((err) => {
          captureException(err, context);
          throw err;
        });
      }
      return result;
    } catch (err) {
      captureException(err, context);
      throw err;
    }
  }) as T;
};
