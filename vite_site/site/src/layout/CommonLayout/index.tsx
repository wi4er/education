import css from './index.module.css';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { HeaderBar } from '../HeaderBar';
import { FooterBar } from '../FooterBar';

export const commonLayout = createRootRoute({
  component: () => (
    <>
      <HeaderBar/>

      <main className={css.main}>
        <Outlet/>
      </main>

      <footer>
        <FooterBar/>
      </footer>
    </>
  ),
});