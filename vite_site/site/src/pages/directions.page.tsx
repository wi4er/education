import css from './directions.page.module.css';
import { createRoute } from '@tanstack/react-router';
import { commonLayout } from '../layout/CommonLayout';

export const directionsPage = createRoute({
  getParentRoute: () => commonLayout,
  path: "/directions",
  component: () => <div>Directions PAGE</div>,
});