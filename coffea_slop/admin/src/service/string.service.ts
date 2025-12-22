import { BaseAttributesView } from '../view';

interface WithAttributes {
  attributes?: BaseAttributesView;
}

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right';
}

export function getStringColumns<T extends WithAttributes>(list: T[]): Column[] {
  const attrSet = new Set<string>();
  for (const row of list) {
    for (const s of row.attributes?.strings || []) {
      attrSet.add(s.attr);
    }
  }
  return Array.from(attrSet).sort().map(attr => ({
    id: `str:${attr}`,
    label: `${attr} (str)`,
    minWidth: 120,
  }));
}

export function getStringValue<T extends WithAttributes>(row: T, attrId: string): string {
  const strings = row.attributes?.strings || [];
  const values = strings
    .filter(s => s.attr === attrId)
    .map(s => s.lang ? `${s.lang}: ${s.value}` : s.value);
  return values.join(', ');
}
