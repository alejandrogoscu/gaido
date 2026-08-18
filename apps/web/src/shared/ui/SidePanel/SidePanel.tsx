import {
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'

import { trapFocus } from '../focusTrap'
import styles from './SidePanel.module.css'

type SidePanelProps = {
  isOpen: boolean
  label: string
  onClose: () => void
  children: ReactNode
  returnFocusRef?: RefObject<HTMLElement | null>
}

export function SidePanel({
  isOpen,
  label,
  onClose,
  children,
  returnFocusRef,
}: SidePanelProps) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const ownsScrollLock = previousOverflow !== 'hidden'
    if (ownsScrollLock) document.body.style.overflow = 'hidden'

    return () => {
      if (ownsScrollLock) document.body.style.overflow = previousOverflow
      window.requestAnimationFrame(() => returnFocusRef?.current?.focus())
    }
  }, [isOpen, returnFocusRef])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }

    trapFocus(event, event.currentTarget)
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true" onClick={onClose} />
      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={handleKeyDown}
      >
        {children}
      </section>
    </>
  )
}
