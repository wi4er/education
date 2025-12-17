import { Module } from '@nestjs/common';
import { PointAttributeService } from './services/point-attribute.service';
import { StringAttributeService } from './services/string-attribute.service';
import { PermissionAttributeService } from './services/permission-attribute.service';
import { DescriptionAttributeService } from './services/description-attribute.service';
import { CounterAttributeService } from './services/counter-attribute.service';
import { APP_GUARD } from '@nestjs/core';
import { CheckMethodAccessGuard } from './access/check-method-access.guard';
import { CheckIdGuard } from './check-id/check-id.guard';
import { CheckIdPermissionGuard } from './permission/check-id-permission.guard';
import { CheckParentPermissionGuard } from './permission/check-parent-permission.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    PointAttributeService,
    StringAttributeService,
    PermissionAttributeService,
    DescriptionAttributeService,
    CounterAttributeService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: CheckMethodAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckIdGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckIdPermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckParentPermissionGuard,
    },
  ],
  exports: [
    PointAttributeService,
    StringAttributeService,
    PermissionAttributeService,
    DescriptionAttributeService,
    CounterAttributeService,
  ],
})
export class CommonModule {
}
