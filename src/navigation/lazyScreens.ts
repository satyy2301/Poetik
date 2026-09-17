import React, { ComponentType } from 'react';
import { ActivityIndicator, View } from 'react-native';

export function deferScreen<T extends object>(
  loader: () => Promise<{ default: ComponentType<T> }>,
) {
  let Cached: ComponentType<T> | null = null;
  const loadPromise = loader().then((mod) => {
    Cached = mod.default;
    return mod.default;
  });

  return function DeferredScreen(props: T) {
    const [ready, setReady] = React.useState(Boolean(Cached));

    React.useEffect(() => {
      if (!Cached) {
        loadPromise.then(() => setReady(true));
      }
    }, []);

    if (!ready || !Cached) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return <Cached {...props} />;
  };
}
