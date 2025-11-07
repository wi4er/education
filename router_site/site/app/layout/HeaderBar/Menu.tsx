import css from './Menu.module.css';
import type { MenuItem } from '~/layout/HeaderBar/menu-item';
import { Link } from 'react-router';
import cn from 'classnames';
import { RollOut } from '~/animation/RollOut';

export function Menu(
  {
    list,
    className,
  }: {
    list: Array<MenuItem>;
    className: string;
  },
) {
  return (
    <div className={cn(css.root, className)}>
      {list.map(({id, name, url}, index) => (
        <RollOut
          className={css.item}
          key={id}
          index={index + 1}
        >
          <Link
            to={url}
            title={name}
            aria-label={name}
          >
            {name}
          </Link>
        </RollOut>
      ))}
    </div>
  );
}