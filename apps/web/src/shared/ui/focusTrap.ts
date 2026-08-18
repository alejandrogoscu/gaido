import type { KeyboardEvent } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function trapFocus(
  event: KeyboardEvent<HTMLElement>,
  container: HTMLElement,
): void {
  if (event.key !== 'Tab') return

  event.stopPropagation()
  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      element.tabIndex >= 0 && element.getAttribute('aria-hidden') !== 'true',
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)
  if (!firstElement || !lastElement) return

  const activeElement = document.activeElement
  const shouldWrapBackward =
    event.shiftKey &&
    (activeElement === firstElement || !container.contains(activeElement))
  const shouldWrapForward =
    !event.shiftKey &&
    (activeElement === lastElement || !container.contains(activeElement))

  if (!shouldWrapBackward && !shouldWrapForward) return

  event.preventDefault()
  const targetElement = shouldWrapBackward ? lastElement : firstElement
  targetElement.focus()
}
