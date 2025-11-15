import css from './Section.module.css';
import font from '../../fonts/text-style.module.css';
import type { SectionItem } from './SectionItem.ts';
import cn from 'classnames';
import * as React from 'react';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
  const textNode = React.useRef(null);
  const node = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const split = SplitText.create(textNode.current, {type: 'chars'});

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
  }, [item.text, hover]);


  useGSAP(() => {
    const rect = node.current?.getBoundingClientRect();

    if (window.innerHeight < (rect?.top ?? 0)) {
      gsap.from(node.current, {
        scrollTrigger: {
          trigger: node.current,
          start: `top bottom`,
          end: `+=420`,
          scrub: true,
          toggleActions: 'play none none none',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        scale: .9,
      });
    }
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

      {item.text ? <div ref={textNode}>{item.text}</div> : null}
    </div>
  );
}