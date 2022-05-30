import type { MutationObserverWatcher } from '@dimensiondev/holoflows-kit';

export function startWatch<
  T extends MutationObserverWatcher<any, any, any, any>,
>(watcher: T, signal?: AbortSignal) {
  watcher
    .setDOMProxyOption({
      afterShadowRootInit: { mode: 'open' },
      beforeShadowRootInit: { mode: 'open' },
    })
    .startWatch({ subtree: true, childList: true });
  signal?.addEventListener('abort', () => watcher.stopWatch());

  return watcher;
}

