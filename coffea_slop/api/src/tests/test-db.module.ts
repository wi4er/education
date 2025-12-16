import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '../settings/entities/attribute/attribute.entity';
import { Attribute2String } from '../settings/entities/attribute/attribute2string.entity';
import { Attribute2Point } from '../settings/entities/attribute/attribute2point.entity';
import { Language } from '../settings/entities/language/language.entity';
import { Language2String } from '../settings/entities/language/language2string.entity';
import { Language2Point } from '../settings/entities/language/language2point.entity';
import { Point } from '../registry/entities/point/point.entity';
import { Point2String } from '../registry/entities/point/point2string.entity';
import { Point2Point } from '../registry/entities/point/point2point.entity';
import { Directory } from '../registry/entities/directory/directory.entity';
import { Directory2String } from '../registry/entities/directory/directory2string.entity';
import { Directory2Point } from '../registry/entities/directory/directory2point.entity';
import { Directory2Permission } from '../registry/entities/directory/directory2permission.entity';
import { Measure } from '../registry/entities/measure/measure.entity';
import { Measure2String } from '../registry/entities/measure/measure2string.entity';
import { Measure2Point } from '../registry/entities/measure/measure2point.entity';
import { Group } from '../personal/entities/group/group.entity';
import { Group2String } from '../personal/entities/group/group2string.entity';
import { Group2Point } from '../personal/entities/group/group2point.entity';
import { Group2Description } from '../personal/entities/group/group2description.entity';
import { User } from '../personal/entities/user/user.entity';
import { User2String } from '../personal/entities/user/user2string.entity';
import { User2Point } from '../personal/entities/user/user2point.entity';
import { User2Description } from '../personal/entities/user/user2description.entity';
import { User4Group } from '../personal/entities/user/user4group.entity';
import { Access } from '../personal/entities/access/access.entity';
import { Block } from '../content/entities/block/block.entity';
import { Block2String } from '../content/entities/block/block2string.entity';
import { Block2Point } from '../content/entities/block/block2point.entity';
import { Block2Permission } from '../content/entities/block/block2permission.entity';
import { Block2Description } from '../content/entities/block/block2description.entity';
import { Element } from '../content/entities/element/element.entity';
import { Element2String } from '../content/entities/element/element2string.entity';
import { Element2Point } from '../content/entities/element/element2point.entity';
import { Element2Permission } from '../content/entities/element/element2permission.entity';
import { Element2Description } from '../content/entities/element/element2description.entity';
import { Element4Section } from '../content/entities/element/element4section.entity';
import { Section } from '../content/entities/section/section.entity';
import { Section2String } from '../content/entities/section/section2string.entity';
import { Section2Point } from '../content/entities/section/section2point.entity';
import { Section2Permission } from '../content/entities/section/section2permission.entity';
import { Section2Description } from '../content/entities/section/section2description.entity';
import { Form } from '../feedback/entities/form/form.entity';
import { Form2String } from '../feedback/entities/form/form2string.entity';
import { Form2Point } from '../feedback/entities/form/form2point.entity';
import { Form2Permission } from '../feedback/entities/form/form2permission.entity';
import { Form2Description } from '../feedback/entities/form/form2description.entity';
import { Result } from '../feedback/entities/result/result.entity';

export const TestDbModule = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [
    Attribute, Attribute2String, Attribute2Point,
    Language, Language2String, Language2Point,
    Point, Point2String, Point2Point,
    Directory, Directory2String, Directory2Point, Directory2Permission,
    Measure, Measure2String, Measure2Point,
    Group, Group2String, Group2Point, Group2Description,
    User, User2String, User2Point, User2Description, User4Group,
    Access,
    Block, Block2String, Block2Point, Block2Permission, Block2Description,
    Element, Element2String, Element2Point, Element2Permission, Element2Description, Element4Section,
    Section, Section2String, Section2Point, Section2Permission, Section2Description,
    Form, Form2String, Form2Point, Form2Permission, Form2Description,
    Result,
  ],
  synchronize: true,
  logging: false,
});
