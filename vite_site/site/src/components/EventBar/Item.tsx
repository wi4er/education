import css from './Item.module.css';
import cn from 'classnames';
import font from '../../fonts/text-style.module.css';
import * as React from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

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
  const node = React.useRef(null);

  useGSAP(() => {
    const split = SplitText.create(node.current, {type: 'chars'});

    if (hover) {
      gsap.timeline()
        .to(split.chars, {
          duration: 0.25,
          y: 20,
          autoAlpha: 0,
          scale: 0.5,
        })
        .to(split.chars, {
          duration: 0.2,
          y: 0,
          autoAlpha: 1,
          stagger: 0.02,
          scale: 1,
        });
    }
  }, [text, hover]);


  return (
    <div
      className={cn(css.root, className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={cn(css.label, font.caption)}>
        {title}
      </div>

      <div
        className={cn(font.heading_4, css.text)}
        ref={node}
      >
        {text.map(it => (<p className={css.line}>{it}</p>))}
      </div>
    </div>
  );
}