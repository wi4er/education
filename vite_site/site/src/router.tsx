import { createRouter } from '@tanstack/react-router';
import { indexPage } from './pages/index.page.tsx';
import { commonLayout } from './layout/CommonLayout';
import { aboutPage } from './pages/about.page.tsx';
import { directionsPage } from './pages/directions.page.tsx';

const routeTree = commonLayout.addChildren(
  [indexPage, aboutPage, directionsPage],
);

export const router = createRouter({routeTree});