import css from './SortPopup.module.css';
import font from '../../fonts/text-style.module.css';
import cn from 'classnames';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export function SortPopup({
  isOpen,
  selected,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  selected: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className={css.overlay} onClick={onClose} />
      <div className={css.popup}>
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={cn(
              css.option,
              font.caption,
              selected === option.value && css.selected,
            )}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            type="button"
          >
            {option.label}
            {selected === option.value && (
              <svg
                className={css.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
