import css from './index.module.css';
import { Item } from './Item.tsx';

export function EventBar() {

  return (
    <div className={css.root}>
      <Item
        className={css.item}
        title={'What:'}
        text={['archive', 'sale']}
      />

      <Item
        className={css.center}
        title={'When:'}
        text={['may 11th', '11am-6pm']}
      />

      <Item
        className={css.item}
        title={'Where:'}
        text={['123 Candyland Ln,', 'Portland, OR']}
      />
    </div>
  );
}