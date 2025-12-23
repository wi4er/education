import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CheckMethodAccess } from '../../common/access/check-method-access.guard';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../entities/access/access-method.enum';
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user/user.entity';
import { User2String } from '../entities/user/user2string.entity';
import { User2Point } from '../entities/user/user2point.entity';
import { User2Description } from '../entities/user/user2description.entity';
import { User2Counter } from '../entities/user/user2counter.entity';
import { User4Status } from '../entities/user/user4status.entity';
import { UserView } from '../views/user.view';
import { UserInput } from '../inputs/user.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CounterAttributeService } from '../../common/services/counter-attribute.service';
import { StatusService } from '../../common/services/status.service';

@Controller('user')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
    private readonly statusService: StatusService,
  ) {}

  toView(user: User): UserView {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      attributes: {
        strings:
          user.strings?.map((str) => ({
            lang: str.languageId,
            attr: str.attributeId,
            value: str.value,
          })) ?? [],
        points:
          user.points?.map((pnt) => ({
            attr: pnt.attributeId,
            pnt: pnt.pointId,
          })) ?? [],
        descriptions:
          user.descriptions?.map((desc) => ({
            lang: desc.languageId,
            attr: desc.attributeId,
            value: desc.value,
          })) ?? [],
        counters:
          user.counters?.map((cnt) => ({
            attr: cnt.attributeId,
            pnt: cnt.pointId,
            msr: cnt.measureId,
            count: cnt.count,
          })) ?? [],
      },
      status: user.statuses?.map((s) => s.statusId) ?? [],
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.GET)
  async findAll(
    @Query('limit')
    limit?: number,
    @Query('offset')
    offset?: number,
  ): Promise<UserView[]> {
    const users = await this.userRepository.find({
      relations: ['strings', 'points', 'descriptions', 'counters', 'statuses'],
      take: limit,
      skip: offset,
    });

    return users.map((u) => this.toView(u));
  }

  @Get(':id')
  @CheckId(User)
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.GET)
  async findOne(
    @Param('id')
    id: string,
  ): Promise<UserView> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'descriptions', 'counters', 'statuses'],
    });

    return this.toView(user);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.POST)
  async create(
    @Body()
    data: UserInput,
  ): Promise<UserView> {
    const {
      strings,
      points,
      descriptions,
      counters,
      status,
      password,
      ...userData
    } = data;

    const user = await this.dataSource.transaction(async (transaction) => {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;
      const u = transaction.create(User, {
        ...userData,
        password: hashedPassword,
      });
      const savedUser = await transaction.save(u);

      await this.stringAttributeService.create<User>(
        transaction,
        User2String,
        savedUser.id,
        strings,
      );
      await this.pointAttributeService.create<User>(
        transaction,
        User2Point,
        savedUser.id,
        points,
      );
      await this.descriptionAttributeService.create<User>(
        transaction,
        User2Description,
        savedUser.id,
        descriptions,
      );
      await this.counterAttributeService.create<User>(
        transaction,
        User2Counter,
        savedUser.id,
        counters,
      );
      await this.statusService.create<User>(
        transaction,
        User4Status,
        savedUser.id,
        status,
      );

      return transaction.findOne(User, {
        where: { id: savedUser.id },
        relations: [
          'strings',
          'points',
          'descriptions',
          'counters',
          'statuses',
        ],
      });
    });

    return this.toView(user);
  }

  @Put(':id')
  @CheckId(User)
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.PUT)
  async update(
    @Param('id')
    id: string,
    @Body()
    data: UserInput,
  ): Promise<UserView> {
    const {
      strings,
      points,
      descriptions,
      counters,
      status,
      password,
      ...userData
    } = data;

    const user = await this.dataSource.transaction(async (transaction) => {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;
      const updateData = hashedPassword
        ? { ...userData, password: hashedPassword }
        : userData;
      await transaction.update(User, id, updateData);

      await this.stringAttributeService.update<User>(
        transaction,
        User2String,
        id,
        strings,
      );
      await this.pointAttributeService.update<User>(
        transaction,
        User2Point,
        id,
        points,
      );
      await this.descriptionAttributeService.update<User>(
        transaction,
        User2Description,
        id,
        descriptions,
      );
      await this.counterAttributeService.update<User>(
        transaction,
        User2Counter,
        id,
        counters,
      );
      await this.statusService.update<User>(
        transaction,
        User4Status,
        id,
        status,
      );

      return transaction.findOne(User, {
        where: { id },
        relations: [
          'strings',
          'points',
          'descriptions',
          'counters',
          'statuses',
        ],
      });
    });

    return this.toView(user);
  }

  @Delete(':id')
  @CheckId(User)
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.DELETE)
  async remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    await this.userRepository.delete(id);
  }
}
