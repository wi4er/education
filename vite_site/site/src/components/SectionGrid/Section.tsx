import css from './Section.module.css';
import font from '../../fonts/text-style.module.css';
import type { SectionItem } from './SectionItem.ts';
import cn from 'classnames';
import * as React from 'react';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SwapText } from '../../animation/SwapText.tsx';

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

export function Section(
  {
    item,
    className,
  }: {
    item: SectionItem;
    className: string;
  },
) {
  const [hover, setHover] = React.useState(false);
  const node = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.innerHeight > (node.current?.getBoundingClientRect()?.top ?? 0) + window.scrollY) return;

    gsap.from(node.current, {
      scrollTrigger: {
        trigger: node.current,
        start: `top bottom`,
        end: `top 80%`,
        scrub: true,
        toggleActions: 'play none none none',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      scale: .9,
    });
  }, [node.current]);

  return (
    <div
      className={cn(css.root, className, font.paragraph_1)}
      style={{
        backgroundColor: item.color,
      }}
      ref={node}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {item.img ? <img src={item.img}/> : null}

      {item.text ? <SwapText swap={hover}>{item.text}</SwapText> : null}
    </div>
  );
}