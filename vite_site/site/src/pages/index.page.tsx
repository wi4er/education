import { createRoute } from '@tanstack/react-router';
import { commonLayout } from '../layout/CommonLayout';
import { EventBar } from '../components/EventBar';
import { MainTitle } from '../components/MainTitle';
import { SectionGrid } from '../components/SectionGrid';

export const indexPage = createRoute({
  getParentRoute: () => commonLayout,
  path: "/",
  component: () => (
    <div>
      <MainTitle />

      <EventBar />
      
      <SectionGrid  />
    </div>
  ),
});