import css from './TestimonialCard.module.css';
import cn from 'classnames';
import txt from '@/fonts/text-styles.module.css';
import { Rating } from './Rating';
import {TestimonialView} from '@/model/testimonial.view';

export function TestimonialCard(
  {
    item,
    active = false,
  }: {
    item: TestimonialView;
    active?: boolean;
  },
) {
  return (
    <div className={cn({
      [css.active]: active,
    }, css.card)}>
      <img
        className={css.avatar}
        src={item.image}
        alt={item.name}
      />

      <p className={cn(css.name, txt.heading5)}>{item.name}</p>
      <p className={cn(css.role, txt.heading6)}>{item.role}</p>

      <Rating
        count={item.rating}
        className={css.raring}
      />

      <p className={cn(css.text, txt.body1)}>
        {item.text}
      </p>
    </div>
  );
}
