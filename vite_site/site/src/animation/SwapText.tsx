import React from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText);

export function SwapText(
  {
    className,
    children,
    swap,
  }: {
    className?: string;
    children: React.ReactNode;
    swap: boolean;
  },
) {
  const node = React.useRef(null);

  useGSAP(() => {
    if (swap) {
      const split = SplitText.create(node.current, {type: 'chars'});

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
  }, [children, swap]);

  return (
    <span
      className={className}
      ref={node}
    >
      {children}
    </span>
  );
}