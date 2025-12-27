import css from './Toolbar.module.css';
import font from '../../fonts/text-style.module.css';
import cn from 'classnames';
import * as React from 'react';
import { SortPopup, type SortOption } from './SortPopup.tsx';

export function Toolbar({
  onFilterClick,
  sortValue,
  onSortChange,
}: {
  onFilterClick?: () => void;
  sortValue: SortOption;
  onSortChange: (option: SortOption) => void;
}) {
  const [sortOpen, setSortOpen] = React.useState(false);

  return (
    <div className={css.root}>
      <button
        className={cn(css.button, font.caption)}
        onClick={onFilterClick}
        type="button"
      >
        <svg
          className={css.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        Filter
      </button>

      <div className={css.sortWrapper}>
        <button
          className={cn(css.button, font.caption)}
          onClick={() => setSortOpen(!sortOpen)}
          type="button"
        >
          <svg
            className={css.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          Sort
        </button>

        <SortPopup
          isOpen={sortOpen}
          selected={sortValue}
          onSelect={onSortChange}
          onClose={() => setSortOpen(false)}
        />
      </div>
    </div>
  );
}
