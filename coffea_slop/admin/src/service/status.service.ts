import { Column } from './string.service';
import { StatusView } from '../view';
import { getStringValue } from './string.service';

interface WithStatus {
  status?: string[];
}

export interface StatusColumn extends Column {
  icon?: string | null;
  color?: string | null;
}

export function getStatusColumns<T extends WithStatus>(list: T[], statuses: StatusView[]): StatusColumn[] {
  const statusSet = new Set<string>();
  for (const row of list) {
    for (const s of row.status || []) {
      statusSet.add(s);
    }
  }
  return Array.from(statusSet).sort().map(statusId => {
    const status = statuses.find(s => s.id === statusId);
    const label = status ? (getStringValue(status, 'label') || statusId) : statusId;
    return {
      id: `sts:${statusId}`,
      label,
      minWidth: 80,
      align: 'right' as const,
      icon: status?.icon,
      color: status?.color,
    };
  });
}

export function getStatusValue<T extends WithStatus>(row: T, statusId: string): boolean {
  const statuses = row.status || [];
  return statuses.includes(statusId);
}

export function getStatusIcon(statuses: StatusView[], statusId: string): string | null {
  const status = statuses.find(s => s.id === statusId);
  return status?.icon || null;
}
