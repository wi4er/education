import css from './index.module.css';
import font from '../../fonts/text-style.module.css';
import cn from 'classnames';

export function MainTitle() {
  return (
    <div className={css.root}>
      <h1 className={cn(css.title, font.heading_1)}>Nonsense</h1>

      <div className={cn(css.left, font.caption)}>
        A new fashion company
      </div>

      <div className={cn(css.right, font.caption)}>
        @nonsensefashion
      </div>
    </div>
  );
}