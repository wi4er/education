import css from './Buttons.module.css';
import cn from 'classnames';
import { RollIn } from '~/animation/RollIn';

export function Buttons(
  {
    className,
  }: {
    className: string;
  },
) {
  return (
    <div className={cn(css.root, className)}>
      <RollIn index={0}>
        <button
          className={cn(css.button, css.buy)}
          onClick={() => console.log('BUY')}
          aria-label={'Buy now'}
        >
          Buy Now
        </button>

      </RollIn>

      <RollIn index={1}>
        <button
          className={cn(css.button, css.details)}
          onClick={() => console.log('DETAILS')}
          aria-label={'View Details'}
        >
          View Details
        </button>
      </RollIn>
    </div>
  );
}