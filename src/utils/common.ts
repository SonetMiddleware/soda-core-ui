import { CustomEvents } from './eventDispatch'

export const CustomEventId = 'abcf4ff0ce64-6fea93e2-1ce4-442f-b2f9'

export function dispatchCustomEvents<T extends keyof CustomEvents>(
  element: Element | Document | null = document,
  event: T,
  ...x: CustomEvents[T]
) {
  document.dispatchEvent(
    new CustomEvent(CustomEventId, { detail: JSON.stringify([event, x]) })
  )
}
