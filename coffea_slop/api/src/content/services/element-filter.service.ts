import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { Element } from '../entities/element/element.entity';

export interface StringFilter {
  attr: string;
  lang?: string;
  value?: string;
  like?: string;
}

export interface PointFilter {
  attr: string;
  point: string;
}

export interface CounterFilter {
  attr: string;
  min?: number;
  max?: number;
  eq?: number;
}

export interface ElementFilter {
  strings?: StringFilter[];
  points?: PointFilter[];
  counters?: CounterFilter[];
}

@Injectable()
export class ElementFilterService {
  applyStringFilters(
    qb: SelectQueryBuilder<Element>,
    filters?: StringFilter[],
  ): void {
    if (!filters?.length) {
      return;
    }

    filters.forEach((sf, idx) => {
      const alias = `filterString${idx}`;
      const conditions: string[] = [`${alias}.attributeId = :${alias}_attr`];
      const params: Record<string, unknown> = { [`${alias}_attr`]: sf.attr };

      if (sf.lang) {
        conditions.push(`${alias}.languageId = :${alias}_lang`);
        params[`${alias}_lang`] = sf.lang;
      }
      if (sf.value !== undefined) {
        conditions.push(`${alias}.value = :${alias}_value`);
        params[`${alias}_value`] = sf.value;
      }
      if (sf.like) {
        conditions.push(`${alias}.value LIKE :${alias}_like`);
        params[`${alias}_like`] = `%${sf.like}%`;
      }

      qb.innerJoin('element.strings', alias, conditions.join(' AND '), params);
    });
  }

  applyPointFilters(
    qb: SelectQueryBuilder<Element>,
    filters?: PointFilter[],
  ): void {
    if (!filters?.length) {
      return;
    }

    filters.forEach((pf, idx) => {
      const alias = `filterPoint${idx}`;
      qb.innerJoin(
        'element.points',
        alias,
        `${alias}.attributeId = :${alias}_attr AND ${alias}.pointId = :${alias}_point`,
        { [`${alias}_attr`]: pf.attr, [`${alias}_point`]: pf.point },
      );
    });
  }

  applyCounterFilters(
    qb: SelectQueryBuilder<Element>,
    filters?: CounterFilter[],
  ): void {
    if (!filters?.length) {
      return;
    }

    filters.forEach((cf, idx) => {
      const alias = `filterCounter${idx}`;
      const conditions: string[] = [`${alias}.attributeId = :${alias}_attr`];
      const params: Record<string, unknown> = { [`${alias}_attr`]: cf.attr };

      if (cf.eq !== undefined) {
        conditions.push(`${alias}.count = :${alias}_eq`);
        params[`${alias}_eq`] = cf.eq;
      }
      if (cf.min !== undefined) {
        conditions.push(`${alias}.count >= :${alias}_min`);
        params[`${alias}_min`] = cf.min;
      }
      if (cf.max !== undefined) {
        conditions.push(`${alias}.count <= :${alias}_max`);
        params[`${alias}_max`] = cf.max;
      }

      qb.innerJoin('element.counters', alias, conditions.join(' AND '), params);
    });
  }
}
