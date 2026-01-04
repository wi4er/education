import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '../settings/entities/attribute/attribute.entity';
import { Attribute2String } from '../settings/entities/attribute/attribute2string.entity';
import { Attribute2Point } from '../settings/entities/attribute/attribute2point.entity';
import { Attribute2AsPoint } from '../settings/entities/attribute/attributeAsPoint.entity';
import { Attribute4Status } from '../settings/entities/attribute/attribute4status.entity';
import { Language } from '../settings/entities/language/language.entity';
import { Language2String } from '../settings/entities/language/language2string.entity';
import { Language2Point } from '../settings/entities/language/language2point.entity';
import { Language4Status } from '../settings/entities/language/language4status.entity';
import { Status } from '../settings/entities/status/status.entity';
import { Status2String } from '../settings/entities/status/status2string.entity';
import { Status2Point } from '../settings/entities/status/status2point.entity';
import { Status4Status } from '../settings/entities/status/status4status.entity';
import { Point } from '../registry/entities/point/point.entity';
import { Point2String } from '../registry/entities/point/point2string.entity';
import { Point2Point } from '../registry/entities/point/point2point.entity';
import { Point4Status } from '../registry/entities/point/point4status.entity';
import { Directory } from '../registry/entities/directory/directory.entity';
import { Directory2String } from '../registry/entities/directory/directory2string.entity';
import { Directory2Point } from '../registry/entities/directory/directory2point.entity';
import { Directory4Permission } from '../registry/entities/directory/directory4permission.entity';
import { Directory4Status } from '../registry/entities/directory/directory4status.entity';
import { Measure } from '../registry/entities/measure/measure.entity';
import { Measure2String } from '../registry/entities/measure/measure2string.entity';
import { Measure2Point } from '../registry/entities/measure/measure2point.entity';
import { Measure4Status } from '../registry/entities/measure/measure4status.entity';
import { Group } from '../personal/entities/group/group.entity';
import { Group2String } from '../personal/entities/group/group2string.entity';
import { Group2Point } from '../personal/entities/group/group2point.entity';
import { Group2Description } from '../personal/entities/group/group2description.entity';
import { Group4Status } from '../personal/entities/group/group4status.entity';
import { User } from '../personal/entities/user/user.entity';
import { User2String } from '../personal/entities/user/user2string.entity';
import { User2Point } from '../personal/entities/user/user2point.entity';
import { User2Description } from '../personal/entities/user/user2description.entity';
import { User4Group } from '../personal/entities/user/user4group.entity';
import { User4Status } from '../personal/entities/user/user4status.entity';
import { Access } from '../personal/entities/access/access.entity';
import { Block } from '../content/entities/block/block.entity';
import { Block2String } from '../content/entities/block/block2string.entity';
import { Block2Point } from '../content/entities/block/block2point.entity';
import { Block4Permission } from '../content/entities/block/block4permission.entity';
import { Block2Description } from '../content/entities/block/block2description.entity';
import { Block4Status } from '../content/entities/block/block4status.entity';
import { Element } from '../content/entities/element/element.entity';
import { Element2String } from '../content/entities/element/element2string.entity';
import { Element2Point } from '../content/entities/element/element2point.entity';
import { Element4Permission } from '../content/entities/element/element4permission.entity';
import { Element2Description } from '../content/entities/element/element2description.entity';
import { Element4Section } from '../content/entities/element/element4section.entity';
import { Element4Status } from '../content/entities/element/element4status.entity';
import { Section } from '../content/entities/section/section.entity';
import { Section2String } from '../content/entities/section/section2string.entity';
import { Section2Point } from '../content/entities/section/section2point.entity';
import { Section4Permission } from '../content/entities/section/section4permission.entity';
import { Section2Description } from '../content/entities/section/section2description.entity';
import { Section4Status } from '../content/entities/section/section4status.entity';
import { Form } from '../feedback/entities/form/form.entity';
import { Form2String } from '../feedback/entities/form/form2string.entity';
import { Form2Point } from '../feedback/entities/form/form2point.entity';
import { Form4Permission } from '../feedback/entities/form/form4permission.entity';
import { Form2Description } from '../feedback/entities/form/form2description.entity';
import { Form4Status } from '../feedback/entities/form/form4status.entity';
import { Result } from '../feedback/entities/result/result.entity';
import { Element2Counter } from '../content/entities/element/element2counter.entity';
import { User2Counter } from '../personal/entities/user/user2counter.entity';
import { User2File } from '../personal/entities/user/user2file.entity';
import { User4Image } from '../personal/entities/user/user4image.entity';
import { Section2Counter } from '../content/entities/section/section2counter.entity';
import { Section2File } from '../content/entities/section/section2file.entity';
import { Section4Image } from '../content/entities/section/section4image.entity';
import { Form2Counter } from '../feedback/entities/form/form2counter.entity';
import { Form2File } from '../feedback/entities/form/form2file.entity';
import { Block2Counter } from '../content/entities/block/block2counter.entity';
import { Block2File } from '../content/entities/block/block2file.entity';
import { Block4Image } from '../content/entities/block/block4image.entity';
import { Element2File } from '../content/entities/element/element2file.entity';
import { Element4Image } from '../content/entities/element/element4image.entity';
import { Collection } from '../storage/entities/collection/collection.entity';
import { Collection2String } from '../storage/entities/collection/collection2string.entity';
import { Collection2Point } from '../storage/entities/collection/collection2point.entity';
import { Collection4Permission } from '../storage/entities/collection/collection4permission.entity';
import { Collection4Status } from '../storage/entities/collection/collection4status.entity';
import { File } from '../storage/entities/file/file.entity';
import { File2String } from '../storage/entities/file/file2string.entity';
import { File2Point } from '../storage/entities/file/file2point.entity';
import { File4Status } from '../storage/entities/file/file4status.entity';

export const TestDbModule = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [
    Attribute,
    Attribute2String,
    Attribute2Point,
    Attribute2AsPoint,
    Attribute4Status,
    Language,
    Language2String,
    Language2Point,
    Language4Status,
    Status,
    Status2String,
    Status2Point,
    Status4Status,
    Point,
    Point2String,
    Point2Point,
    Point4Status,
    Directory,
    Directory2String,
    Directory2Point,
    Directory4Permission,
    Directory4Status,
    Measure,
    Measure2String,
    Measure2Point,
    Measure4Status,
    Group,
    Group2String,
    Group2Point,
    Group2Description,
    Group4Status,
    User,
    User2String,
    User2Point,
    User2Description,
    User2Counter,
    User2File,
    User4Image,
    User4Status,
    User4Group,
    Access,
    Block,
    Block2String,
    Block2Point,
    Block2Description,
    Block2Counter,
    Block2File,
    Block4Image,
    Block4Status,
    Block4Permission,
    Element,
    Element2String,
    Element2Point,
    Element2Description,
    Element2Counter,
    Element2File,
    Element4Image,
    Element4Status,
    Element4Section,
    Element4Permission,
    Section,
    Section2String,
    Section2Point,
    Section2Description,
    Section2Counter,
    Section2File,
    Section4Image,
    Section4Status,
    Section4Permission,
    Form,
    Form2String,
    Form2Point,
    Form2Description,
    Form2Counter,
    Form2File,
    Form4Status,
    Form4Permission,
    Result,
    Collection,
    Collection2String,
    Collection2Point,
    Collection4Permission,
    Collection4Status,
    File,
    File2String,
    File2Point,
    File4Status,
  ],
  synchronize: true,
  logging: false,
});
