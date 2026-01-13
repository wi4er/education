import css from './Rating.module.css';
import StarSvg from './svg/Star.svg';
import cn from 'classnames';

export function Rating(
  {
    count,
    className,
  }: {
    count: number;
    className?: string;
  },
) {
  return (
    <div className={cn(css.rating, className)}>
      {[1, 2, 3, 4, 5].map(star => (
        <StarSvg
          key={star}
          className={cn({
            [css.filled]: star <= count
          }, css.star)}
        />
      ))}
    </div>
  );
}
