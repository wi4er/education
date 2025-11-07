import css from './Contacts.module.css';
import { contactList } from './data/contact-list';
import { Fragment } from 'react';
import cn from 'classnames';

export function Contacts(
  {
    list = contactList,
    className,
  }: {
    list?: typeof contactList
    className: string;
  },
) {
  return (
    <div className={cn(css.root, className)}>
      {list.map(({id, title, icon: Icon}) => (
        <Fragment key={id}>
          <Icon className={css.icon}/>

          <div className={css.text}>
            {title}
          </div>
        </ Fragment>
      ))}
    </div>
  );
}