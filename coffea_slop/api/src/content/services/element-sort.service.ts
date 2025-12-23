import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { Element } from '../entities/element/element.entity';

export type SortDirection = 'ASC' | 'DESC';

@Injectable()
export class ElementSortService {
  apply(
    qb: SelectQueryBuilder<Element>,
    order: string,
    direction: SortDirection = 'ASC',
  ): void {
    if (order === 'createdAt' || order === 'updatedAt') {
      this.applyDateSort(qb, order, direction);
    } else if (order.startsWith('string:')) {
      this.applyStringSort(qb, order, direction);
    }
  }

  private applyDateSort(
    qb: SelectQueryBuilder<Element>,
    field: 'createdAt' | 'updatedAt',
    direction: SortDirection,
  ): void {
    qb.orderBy(`element.${field}`, direction);
  }

  private applyStringSort(
    qb: SelectQueryBuilder<Element>,
    order: string,
    direction: SortDirection,
  ): void {
    const parts = order.split(':');
    const attributeId = parts[1];
    const languageId = parts[2];

    qb.leftJoin(
      'element.strings',
      'orderString',
      languageId
        ? 'orderString.attributeId = :attrId AND orderString.languageId = :langId'
        : 'orderString.attributeId = :attrId',
      languageId
        ? { attrId: attributeId, langId: languageId }
        : { attrId: attributeId },
    ).orderBy('orderString.value', direction);
  }
}
