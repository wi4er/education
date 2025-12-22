import { BaseAttributesView } from '../view';
import { Column } from './string.service';

interface WithAttributes {
  attributes?: BaseAttributesView;
}

export function getPointColumns<T extends WithAttributes>(list: T[]): Column[] {
  const attrSet = new Set<string>();
  for (const row of list) {
    for (const p of row.attributes?.points || []) {
      attrSet.add(p.attr);
    }
  }
  return Array.from(attrSet).sort().map(attr => ({
    id: `pnt:${attr}`,
    label: `${attr} (pnt)`,
    minWidth: 120,
  }));
}

export function getPointValue<T extends WithAttributes>(row: T, attrId: string): string {
  const points = row.attributes?.points || [];
  const values = points
    .filter(p => p.attr === attrId)
    .map(p => p.pnt);
  return values.join(', ');
}
