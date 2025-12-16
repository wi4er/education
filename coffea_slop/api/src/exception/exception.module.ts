import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PermissionFilter } from './permission/permission.filter';
import { AccessFilter } from './access/access.filter';
import { WrongDataFilter } from './wrong-data/wrong-data.filter';
import { NoDataFilter } from './no-data/no-data.filter';
import { CheckMethodAccessGuard } from '../common/access/check-method-access.guard';
import { CheckIdGuard } from '../common/check-id/check-id.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: CheckMethodAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckIdGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PermissionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AccessFilter,
    },
    {
      provide: APP_FILTER,
      useClass: WrongDataFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NoDataFilter,
    },
  ],
})
export class ExceptionModule {}
