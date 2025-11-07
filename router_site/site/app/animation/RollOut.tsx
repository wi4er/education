import React, { type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

export function RollOut(
  {
    children,
    index,
    className,
  }: {
    children: React.ReactNode;
    index: number;
    className?: string;
  },
) {
  const ref: RefObject<HTMLDivElement | null> = React.createRef();

  useGSAP(() => {
    gsap.to(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start: `bottom ${index * 5 + 30}`,
        end: `bottom 0`,
        scrub: true,
        // markers: true,
        toggleActions: 'play none none none',
      },
      y: -50,
      opacity: 0,
      duration: 1,
      scale: 1.2,
    });
  });

  return (
    <div
      className={className}
      ref={ref}
    >
      {children}
    </div>
  );
}