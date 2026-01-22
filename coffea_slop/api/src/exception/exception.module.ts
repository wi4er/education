import {Module} from '@nestjs/common';
import {APP_FILTER} from '@nestjs/core';
import {PermissionFilter} from './permission/permission.filter';
import {AccessFilter} from './access/access.filter';
import {WrongDataFilter} from './wrong-data/wrong-data.filter';
import {NoDataFilter} from './no-data/no-data.filter';

@Module({
  providers: [
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
