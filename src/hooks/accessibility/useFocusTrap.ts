/**
 * 🎯 Focus Trap Hook - WCAG 2.1 AA Compliant
 * Manages keyboard focus within modal dialogs
 * 
 * Features:
 * - Traps Tab/Shift+Tab navigation within modal
 * - ESC key to close
 * - Auto-focus first focusable element
 * - Restores focus to trigger element on close
 * - Prevents body scroll when modal is open
 * 
 * @example
 * const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
 * <div ref={modalRef} role="dialog" aria-modal="true">...</div>
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

export function useFocusTrap<T extends HTMLElement>(
  isOpen: boolean,
  onClose?: () => void
) {
  const ref = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the element that triggered the modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      // ESC key
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      // Tab key - trap focus
      if (event.key === 'Tab') {
        if (!ref.current) return;

        const focusableElements = ref.current.querySelectorAll<HTMLElement>(
          FOCUSABLE_ELEMENTS.join(', ')
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) return;

        // Shift + Tab
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } 
        // Tab
        else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  // Setup focus trap
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_ELEMENTS.join(', ')
    );
    if (focusableElements.length > 0) {
      // Delay to ensure modal is rendered
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);
    }

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to trigger element
      if (previousActiveElement.current) {
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [isOpen, handleKeyDown]);

  return ref;
}

/**
 * 🎯 Modal Backdrop Click Handler
 * Closes modal when clicking outside content area
 * 
 * @example
 * const handleBackdropClick = useModalBackdrop(onClose);
 * <div onClick={handleBackdropClick}>
 *   <div onClick={e => e.stopPropagation()}>Modal content</div>
 * </div>
 */
export function useModalBackdrop(onClose: () => void) {
  return useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );
}

/**
 * 🎯 Prevent Body Scroll
 * Disables body scroll when modal is open
 */
export function usePreventBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
}
