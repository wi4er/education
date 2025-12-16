import css from './index.module.css';
import * as React from 'react';
import { ProductCard } from './ProductCard.tsx';
import { Toolbar } from './Toolbar.tsx';
import type { ProductItem } from './ProductItem.ts';
import { productList } from './mock/product-list.ts';
import type { SortOption } from './SortPopup.tsx';
import { FilterModal, defaultFilters, type FilterValues } from '../FilterModal';

function sortProducts(products: Array<ProductItem>, sortBy: SortOption): Array<ProductItem> {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'newest':
    default:
      return sorted;
  }
}

function filterProducts(products: Array<ProductItem>, filters: FilterValues): Array<ProductItem> {
  return products.filter(product => {
    const [minPrice, maxPrice] = filters.priceRange;
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }
    return true;
  });
}

export function ProductGrid({
  list = productList,
}: {
  list?: Array<ProductItem>;
}) {
  const [sortValue, setSortValue] = React.useState<SortOption>('newest');
  const [filters, setFilters] = React.useState<FilterValues>(defaultFilters);
  const [filterModalOpen, setFilterModalOpen] = React.useState(false);

  const filteredList = filterProducts(list, filters);
  const sortedList = sortProducts(filteredList, sortValue);

  return (
    <div>
      <Toolbar
        onFilterClick={() => setFilterModalOpen(true)}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      <div className={css.root}>
        {sortedList.map(item => (
          <ProductCard
            className={css.item}
            item={item}
            key={item.id}
          />
        ))}
      </div>

      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  );
}
