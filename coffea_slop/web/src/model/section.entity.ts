import { ComponentType, SVGProps } from 'react';

export interface SectionEntity {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}
