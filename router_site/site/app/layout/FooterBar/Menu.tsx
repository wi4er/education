import css from './Menu.module.css';
import { menuList } from './data/menu-list';
import { Link } from 'react-router';
import cn from 'classnames';

export function Menu(
  {
    className,
    list = menuList,
  }: {
    className: string;
    list?: typeof menuList;
  },
) {
  return (
    <div className={cn(css.root, className)}>
      {list.map(({id, title, link}) => (
        <Link
          to={link}
          key={id}
          className={css.item}
          aria-label={title}
        >
          {title}
        </Link>
      ))}
    </div>
  );
}