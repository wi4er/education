import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CheckMethodAccess } from '../../common/access/check-method-access.guard';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../entities/access/access-method.enum';
import { CheckId } from '../../common/check-id/check-id.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user/user.entity';
import { User2String } from '../entities/user/user2string.entity';
import { User2Point } from '../entities/user/user2point.entity';
import { User2Description } from '../entities/user/user2description.entity';
import { UserView } from '../views/user.view';
import { UserInput } from '../inputs/user.input';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';

@Controller('user')
export class UserController {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
  ) {}

  toView(user: User): UserView {
    return {
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      attributes: {
        strings: user.strings?.map(str => ({
          lang: str.languageId,
          attr: str.attributeId,
          value: str.value,
        })) ?? [],
        points: user.points?.map(pnt => ({
          attr: pnt.attributeId,
          point: pnt.pointId,
        })) ?? [],
        descriptions: user.descriptions?.map(desc => ({
          lang: desc.languageId,
          attr: desc.attributeId,
          value: desc.value,
        })) ?? [],
      },
    };
  }

  @Get()
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.GET)
  async findAll(): Promise<UserView[]> {
    const users = await this.userRepository.find({
      relations: ['strings', 'points', 'descriptions'],
    });
    return users.map(u => this.toView(u));
  }

  @Get(':id')
  @CheckId(User)
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.GET)
  async findOne(@Param('id') id: string): Promise<UserView> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['strings', 'points', 'descriptions'],
    });
    return this.toView(user);
  }

  @Post()
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.POST)
  async create(
    @Body() data: UserInput
  ): Promise<UserView> {
    const { strings, points, descriptions, ...userData } = data;

    const user = await this.dataSource.transaction(async transaction => {
      const u = transaction.create(User, userData);
      const savedUser = await transaction.save(u);

      await this.stringAttributeService.create<User>(transaction, User2String, strings);
      await this.pointAttributeService.create<User>(transaction, User2Point, points);
      await this.descriptionAttributeService.create<User>(transaction, User2Description, descriptions);

      return transaction.findOne(User, {
        where: { id: savedUser.id },
        relations: ['strings', 'points', 'descriptions'],
      });
    });

    return this.toView(user);
  }

  @Put(':id')
  @CheckId(User)
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.PUT)
  async update(
    @Param('id') id: string,
    @Body() data: UserInput,
  ): Promise<UserView> {
    const { strings, points, descriptions, ...userData } = data;

    const user = await this.dataSource.transaction(async transaction => {
      await transaction.update(User, id, userData);

      await this.stringAttributeService.update<User>(transaction, User2String, id, strings);
      await this.pointAttributeService.update<User>(transaction, User2Point, id, points);
      await this.descriptionAttributeService.update<User>(transaction, User2Description, id, descriptions);

      return transaction.findOne(User, {
        where: { id },
        relations: ['strings', 'points', 'descriptions'],
      });
    });

    return this.toView(user);
  }

  @Delete(':id')
  @CheckId(User)
  @CheckMethodAccess(AccessEntity.USER, AccessMethod.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

}
