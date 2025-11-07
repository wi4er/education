import css from './index.module.css';
import image from './img/Image.png';
import { Buttons } from '~/components/AboutUs/Buttons';

export function AboutUs() {
  return (
    <div className={css.root}>
      <div className={css.title}>
        About US
      </div>

      <div className={css.text}>
        And produce say the ten moments parties. Simple innate summer fat appear basket his desire joy. Outward clothes
        promise at gravity do excited. Sufficient particular impossible by reasonable oh expression is. Yet preference
        connection unpleasant yet melancholy but end appearance. And excellence partiality estimating terminated day
        everything.
      </div>

      <Buttons className={css.buttons}/>

      <picture className={css.image}>
        <img
          src={image}
          alt={'About US'}
          width={631}
          height={579}
        />
      </picture>
    </div>
  );
}