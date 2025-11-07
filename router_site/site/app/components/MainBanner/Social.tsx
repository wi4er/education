import css from './Social.module.css';
import cn from 'classnames';


const socialList = [{
  id: 1,
  name: 'fb',
  link: 'https://www.facebook.com',
}, {
  id: 2,
  name: 'pi',
  link: '/',
}, {
  id: 3,
  name: 'in',
  link: 'https://www.linkedin.com',
}];

export function Social(
  {
    className,
    list = socialList,
  }: {
    className: string;
    list?: typeof socialList
  },
) {
  return (
    <div className={cn(css.root, className)}>
      {list.map(({id, name, link}) => (
        <a
          className={css.item}
          key={id}
          href={link}
        >
          {name}
        </a>
      ))}
    </div>
  );
}