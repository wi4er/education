import css from './index.module.css';
import font from '../../fonts/text-style.module.css';
import cn from 'classnames';
import * as React from 'react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={css.overlay} onClick={onClose}>
      <div className={css.modal} onClick={e => e.stopPropagation()}>
        <div className={css.header}>
          <h2 className={cn(css.title, font.heading_4)}>{title}</h2>
          <button
            className={css.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={css.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
