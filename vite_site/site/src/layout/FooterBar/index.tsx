import css from './index.module.css';
import font from '../../fonts/text-style.module.css';
import { SignUp } from './SignUp.tsx';
import cn from 'classnames';
import imagePng from './mock/Image.png';

export function FooterBar() {


  return (
    <div className={css.root}>
      <SignUp
        className={css.sign}
        onClick={() => console.log('CLICK')}
      />

      <picture
        className={css.image}
      >
        <img src={imagePng} />
      </picture>

      <div className={cn(css.popup, font.heading_4)}>
        A Wearable Statements Pop Up
      </div>

      <div className={cn(css.title, font.heading_2)}>
        Nonsense
      </div>

      <div className={cn(css.rights, font.heading_6)}>
        Nonsense© 2025 All Rights Reserved
      </div>

      <div className={cn(css.tag, font.heading_6)}>
        @nonsenseFashion
      </div>
    </div>
  );
}