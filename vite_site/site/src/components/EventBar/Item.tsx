import css from './Item.module.css';
import cn from 'classnames';
import font from '../../fonts/text-style.module.css';
import * as React from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { SwapText } from '../../animation/SwapText.tsx';

gsap.registerPlugin(SplitText);

export function Item(
  {
    className,
    title,
    text,
  }: {
    className: string;
    title: string;
    text: Array<string>;
  },
) {
  const [hover, setHover] = React.useState(false);

  return (
    <div
      className={cn(css.root, className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={cn(css.label, font.caption)}>
        {title}
      </div>

      <SwapText
        className={cn(font.heading_4, css.text)}
        swap={hover}
      >
        {text.map(it => <p className={css.line} key={it}>{it}</p>)}
      </SwapText>
    </div>
  );
}