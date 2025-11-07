import css from './index.module.css';
import LogoSvg from './svg/Logo.svg?react';
import { Menu } from '~/layout/HeaderBar/Menu';
import { menuList } from './menu-list';
import { Icons } from '~/layout/HeaderBar/Icons';
import { RollOut } from '~/animation/RollOut';

export function HeaderBar() {
  return (
    <div className={css.root}>
      <RollOut index={0}>
        <LogoSvg/>
      </RollOut>

      <Menu
        list={menuList}
        className={css.menu}
      />

      <RollOut index={6}>
        <Icons className={css.icons}/>
      </RollOut>
    </div>
  );
}