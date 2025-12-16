import { Module } from '@nestjs/common';
import { PointAttributeService } from './services/point-attribute.service';
import { StringAttributeService } from './services/string-attribute.service';
import { PermissionAttributeService } from './services/permission-attribute.service';
import { DescriptionAttributeService } from './services/description-attribute.service';

@Module({
  providers: [
    PointAttributeService,
    StringAttributeService,
    PermissionAttributeService,
    DescriptionAttributeService,
  ],
  exports: [
    PointAttributeService,
    StringAttributeService,
    PermissionAttributeService,
    DescriptionAttributeService,
  ],
})
export class CommonModule {
}
