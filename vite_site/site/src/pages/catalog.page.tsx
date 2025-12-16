import { createRoute } from '@tanstack/react-router';
import { commonLayout } from '../layout/CommonLayout';
import { ProductGrid } from '../components/ProductGrid';
import css from './catalog.page.module.css';
import font from '../fonts/text-style.module.css';
import cn from 'classnames';

export const catalogPage = createRoute({
  getParentRoute: () => commonLayout,
  path: '/catalog',
  component: () => (
    <div className={css.root}>
      <h1 className={cn(css.title, font.heading_2)}>Catalog</h1>
      <ProductGrid />
    </div>
  ),
});
