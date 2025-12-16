import css from './index.module.css';
import font from '../../fonts/text-style.module.css';
import { Link } from '@tanstack/react-router';
import cn from 'classnames';

export function HeaderBar() {
  return (
    <header className={css.root}>
      <Link
        to={'/about'}
        className={cn(css.about, font.heading_5)}
      >
        ABOUT
      </Link>

      <Link
        to={'/catalog'}
        className={cn(css.direc, font.heading_5)}
      >
        CATALOG
      </Link>
    </header>
  );
}