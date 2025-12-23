import { Controller, Get, Post, Put, Body, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user/user.entity';
import { User2String } from '../entities/user/user2string.entity';
import { User2Point } from '../entities/user/user2point.entity';
import { User2Description } from '../entities/user/user2description.entity';
import { User2Counter } from '../entities/user/user2counter.entity';
import { MyselfView } from '../views/myself.view';
import { MyselfInput } from '../inputs/myself.input';
import { AuthCookieService } from '../services/auth-cookie.service';
import { PointAttributeService } from '../../common/services/point-attribute.service';
import { StringAttributeService } from '../../common/services/string-attribute.service';
import { DescriptionAttributeService } from '../../common/services/description-attribute.service';
import { CounterAttributeService } from '../../common/services/counter-attribute.service';
import { PermissionException } from '../../exception/permission/permission.exception';
import { PermissionMethod } from '../../common/permission/permission.method';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

@Controller('myself')
export class MyselfController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly authCookieService: AuthCookieService,
    private readonly pointAttributeService: PointAttributeService,
    private readonly stringAttributeService: StringAttributeService,
    private readonly descriptionAttributeService: DescriptionAttributeService,
    private readonly counterAttributeService: CounterAttributeService,
  ) {}

  toView(user: User): MyselfView {
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
    };
  }

  @Get()
  async findCurrent(
    @Req()
    req: Request,
  ): Promise<MyselfView> {
    const userId = this.authCookieService.getCurrentUserId(req);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['strings', 'points', 'descriptions', 'counters'],
    });

    if (!user)
      throw new PermissionException('User', PermissionMethod.AUTH, userId);

    return this.toView(user);
  }

  @Post()
  async register(
    @Body()
    data: MyselfInput,
    @Res({ passthrough: true })
    res: Response,
  ): Promise<MyselfView> {
    const { strings, points, descriptions, counters, password, ...userData } =
      data;

    if (!password) {
      throw new WrongDataException(
        'Password is required',
        'password',
        undefined,
        'required',
      );
    }

    const user = await this.dataSource.transaction(async (transaction) => {
      const hashedPassword = await bcrypt.hash(password, 10);
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

      return transaction.findOne(User, {
        where: { id: savedUser.id },
        relations: ['strings', 'points', 'descriptions', 'counters', 'groups'],
      });
    });

    this.authCookieService.setAuthCookie(res, user);

    return this.toView(user);
  }

  @Put()
  async update(
    @Req()
    req: Request,
    @Body()
    data: MyselfInput,
  ): Promise<MyselfView> {
    const userId = this.authCookieService.getCurrentUserId(req);

    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser)
      throw new PermissionException('User', PermissionMethod.AUTH, userId);

    const { strings, points, descriptions, counters, password, ...userData } =
      data;

    const user = await this.dataSource.transaction(async (transaction) => {
      const hashedPassword = password
        ? await bcrypt.hash(password, 10)
        : undefined;
      const updateData = hashedPassword
        ? { ...userData, password: hashedPassword }
        : userData;
      await transaction.update(User, userId, updateData);

      await this.stringAttributeService.update<User>(
        transaction,
        User2String,
        userId,
        strings,
      );
      await this.pointAttributeService.update<User>(
        transaction,
        User2Point,
        userId,
        points,
      );
      await this.descriptionAttributeService.update<User>(
        transaction,
        User2Description,
        userId,
        descriptions,
      );
      await this.counterAttributeService.update<User>(
        transaction,
        User2Counter,
        userId,
        counters,
      );

      return transaction.findOne(User, {
        where: { id: userId },
        relations: ['strings', 'points', 'descriptions', 'counters'],
      });
    });

    return this.toView(user);
  }
}
