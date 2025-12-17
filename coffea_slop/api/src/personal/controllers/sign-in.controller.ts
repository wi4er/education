import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user/user.entity';
import { SignInInput } from '../inputs/sign-in.input';
import { SignInView } from '../views/sign-in.view';
import { PermissionException } from '../../exception/permission/permission.exception';
import { PermissionMethod } from '../../common/permission/permission.method';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('sign-in')
export class SignInController {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
  }

  toView(user: User): SignInView {
    return {
      id: user.id,
      login: user.login ?? user.id,
    };
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  @Get()
  async check(
    @Req()
    req: Request,
  ): Promise<SignInView> {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) throw new PermissionException('User', PermissionMethod.AUTH);

    const payload = this.jwtService.verify(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) throw new PermissionException('User', PermissionMethod.AUTH, payload.sub);

    return this.toView(user);
  }

  @Post()
  async signIn(
    @Body()
    data: SignInInput,
    @Res({ passthrough: true })
    res: Response,
  ): Promise<SignInView> {
    const user = await this.userRepository.findOne({
      where: { login: data.login },
      relations: ['groups'],
    });

    if (
      !user
      || !await bcrypt.compare(data.password, user.password)
    ) throw new PermissionException('User', PermissionMethod.AUTH);

    const token = this.jwtService.sign({
      sub: user.id,
      login: user.login,
      groups: user.groups?.map(g => g.groupId) ?? [],
    });

    this.setAuthCookie(res, token);

    return this.toView(user);
  }

  @Delete()
  async signOut(
    @Res({ passthrough: true })
    res: Response,
  ): Promise<void> {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

}
