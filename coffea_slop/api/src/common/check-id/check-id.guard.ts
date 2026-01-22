import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {InjectEntityManager} from '@nestjs/typeorm';
import {EntityManager, ObjectType} from 'typeorm';
import {NoDataException} from '../../exception/no-data/no-data.exception';

export const CHECK_ID = 'CHECK_ID';

export interface CheckIdOptions<T> {
  entity: ObjectType<T>;
  idParam?: string;
}

export function CheckId<T>(entity: ObjectType<T>, idParam: string = 'id') {
  return SetMetadata(CHECK_ID, { entity, idParam });
}

@Injectable()
export class CheckIdGuard
  implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    @InjectEntityManager()
    private manager: EntityManager,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const check = this.reflector.get<CheckIdOptions<any>>(
      CHECK_ID,
      context.getHandler(),
    );

    if (!check) return true;

    const { entity, idParam } = check;
    const id = request.params[idParam];

    if (!id) return true;

    const found = await this.manager.findOne(entity, { where: { id } });

    if (!found) throw new NoDataException(entity.name, id);

    return true;
  }

}
