import css from './index.module.css';
import imagePng from './image/Image.png';
import { Email } from '~/components/SubscribeForm/Email';

export function SubscribeForm() {
  return (
    <div className={css.root}>
      <picture className={css.image}>
        <img
          src={imagePng}
          alt={'Subscribe Newsletter'}
        />
      </picture>

      <div className={css.title}>
        Subscribe Newsletter
      </div>

      <div className={css.hint}>
        Enter your email below for daily updates
      </div>

      <Email className={css.form} />
    </div>
  );
}