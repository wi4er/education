import { Controller, Get, Post, Delete, Body, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user/user.entity';
import { SignInInput } from '../inputs/sign-in.input';
import { SignInView } from '../views/sign-in.view';
import { AuthCookieService } from '../services/auth-cookie.service';
import { PermissionException } from '../../exception/permission/permission.exception';
import { PermissionMethod } from '../../common/permission/permission.method';

@Controller('sign-in')
export class SignInController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authCookieService: AuthCookieService,
  ) {}

  toView(user: User): SignInView {
    return {
      id: user.id,
      login: user.login ?? user.id,
    };
  }

  @Get()
  async check(
    @Req()
    req: Request,
  ): Promise<SignInView> {
    const userId = this.authCookieService.getCurrentUserId(req);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new PermissionException('User', PermissionMethod.AUTH, userId);

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

    if (!user || !(await bcrypt.compare(data.password, user.password)))
      throw new PermissionException('User', PermissionMethod.AUTH);

    this.authCookieService.setAuthCookie(res, user);

    return this.toView(user);
  }

  @Delete()
  async signOut(
    @Res({ passthrough: true })
    res: Response,
  ): Promise<void> {
    this.authCookieService.clearAuthCookie(res);
  }
}
