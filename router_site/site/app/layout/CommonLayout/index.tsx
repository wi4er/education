import css from './index.module.css';
import { HeaderBar } from '~/layout/HeaderBar';
import { FooterBar } from '~/layout/FooterBar';
import { Outlet } from 'react-router';

export function CommonLayout() {
  return (
    <>
      <HeaderBar />


      <FooterBar />
    </>
  );
}