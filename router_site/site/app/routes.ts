import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('layout/CommonLayout/index.tsx', [
    index('routes/home.tsx'),
    route('page', 'routes/page.tsx'),
  ]),
] satisfies RouteConfig;
