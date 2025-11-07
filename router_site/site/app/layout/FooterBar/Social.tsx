import css from './Social.module.css';
import { socialList } from './data/social-list';

export function Social(
  {
    list = socialList,
  } : {
    list?: typeof socialList;
  }
) {
  return (
    <div className={css.root}>
      {list.map(({id, title, icon: Icon}) => (
        <div
          key={id}
          title={title}
        >
          <Icon />
        </div>
      ))}
    </div>
  );
}