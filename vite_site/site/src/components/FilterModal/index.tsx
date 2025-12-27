import css from './index.module.css';
import font from '../../fonts/text-style.module.css';
import cn from 'classnames';
import * as React from 'react';
import { Modal } from '../Modal';

export interface FilterValues {
  priceRange: [number, number];
  categories: string[];
}

const categories = [
  'T-Shirts',
  'Hoodies',
  'Jackets',
  'Pants',
  'Sweaters',
];

const defaultFilters: FilterValues = {
  priceRange: [0, 500],
  categories: [],
};

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onApply: (filters: FilterValues) => void;
}) {
  const [localFilters, setLocalFilters] = React.useState<FilterValues>(filters);

  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleCategoryToggle = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handlePriceChange = (index: 0 | 1, value: number) => {
    setLocalFilters(prev => {
      const newRange: [number, number] = [...prev.priceRange];
      newRange[index] = value;
      return { ...prev, priceRange: newRange };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters">
      <div className={css.section}>
        <h3 className={cn(css.sectionTitle, font.heading_6)}>Price Range</h3>
        <div className={css.priceInputs}>
          <div className={css.priceField}>
            <label className={cn(css.label, font.caption)}>Min</label>
            <input
              type="number"
              className={cn(css.input, font.caption)}
              value={localFilters.priceRange[0]}
              onChange={e => handlePriceChange(0, Number(e.target.value))}
              min={0}
            />
          </div>
          <span className={css.priceSeparator}>—</span>
          <div className={css.priceField}>
            <label className={cn(css.label, font.caption)}>Max</label>
            <input
              type="number"
              className={cn(css.input, font.caption)}
              value={localFilters.priceRange[1]}
              onChange={e => handlePriceChange(1, Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
      </div>

      <div className={css.section}>
        <h3 className={cn(css.sectionTitle, font.heading_6)}>Categories</h3>
        <div className={css.categories}>
          {categories.map(category => (
            <label key={category} className={css.checkbox}>
              <input
                type="checkbox"
                checked={localFilters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <span className={cn(css.checkboxLabel, font.caption)}>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={css.actions}>
        <button
          className={cn(css.resetButton, font.caption)}
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
        <button
          className={cn(css.applyButton, font.caption)}
          onClick={handleApply}
          type="button"
        >
          Apply Filters
        </button>
      </div>
    </Modal>
  );
}

export { defaultFilters };
