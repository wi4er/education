import { AttributesView } from '../component/common/view';
import { Column } from './string.service';

interface WithAttributes {
  attributes?: AttributesView;
}

export function getDescriptionColumns<T extends WithAttributes>(list: T[]): Column[] {
  const attrSet = new Set<string>();
  for (const row of list) {
    for (const d of row.attributes?.descriptions || []) {
      attrSet.add(d.attr);
    }
  }
  return Array.from(attrSet).sort().map(attr => ({
    id: `desc:${attr}`,
    label: `${attr} (desc)`,
    minWidth: 200,
  }));
}

export function getDescriptionValue<T extends WithAttributes>(row: T, attrId: string): string {
  const descriptions = row.attributes?.descriptions || [];
  const values = descriptions
    .filter(d => d.attr === attrId)
    .map(d => {
      const text = d.value.length > 50 ? d.value.slice(0, 50) + '...' : d.value;
      return d.lang ? `${d.lang}: ${text}` : text;
    });
  return values.join('; ');
}
