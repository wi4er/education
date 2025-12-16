import { createRouter } from '@tanstack/react-router';
import { indexPage } from './pages/index.page.tsx';
import { commonLayout } from './layout/CommonLayout';
import { aboutPage } from './pages/about.page.tsx';
import { directionsPage } from './pages/directions.page.tsx';
import { catalogPage } from './pages/catalog.page.tsx';

const routeTree = commonLayout.addChildren(
  [indexPage, aboutPage, directionsPage, catalogPage],
);

export const router = createRouter({routeTree});