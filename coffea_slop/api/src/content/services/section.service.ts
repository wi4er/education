import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Element4Section } from '../entities/element/element4section.entity';

@Injectable()
export class SectionService {

  async create(
    transaction: EntityManager,
    elementId: string,
    sections: string[] = [],
  ): Promise<Element4Section[]> {
    if (!sections?.length) {
      return [];
    }

    const element4sections = sections.map(sectionId =>
      transaction.create(Element4Section, { elementId, sectionId }),
    );

    return transaction.save(element4sections);
  }

  async update(
    transaction: EntityManager,
    elementId: string,
    sections: string[] = [],
  ): Promise<Element4Section[]> {
    await transaction.delete(Element4Section, { elementId });

    if (!sections?.length) {
      return [];
    }

    const element4sections = sections.map(sectionId =>
      transaction.create(Element4Section, { elementId, sectionId }),
    );

    return transaction.save(element4sections);
  }

}
