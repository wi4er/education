import { createRoute } from '@tanstack/react-router';
import { commonLayout } from '../layout/CommonLayout';

export const aboutPage = createRoute({
  getParentRoute: () => commonLayout,
  path: "/about",
  component: () => <div>About Page</div>,
});