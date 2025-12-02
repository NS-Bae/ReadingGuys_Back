import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Records } from '../record/records.entity';
import { User } from '../users/users.entity';

@Entity( 'academy' ) // 테이블 이름을 Academy로 설정
export class Academy {
  @PrimaryColumn({ name: 'HashedAcademyID', type: 'varchar', length: 255 })
  hashedAcademyId: string;

  @Column({ name: 'EncryptedAcademyName', type: 'varbinary', length: 255, nullable: false })
  encryptedAcademyName: Buffer;

  @Column({ name: 'IVAcademyName', type: 'varbinary', length: 12, nullable: false })
  ivAcademyName: Buffer;

  @Column({ name: 'AuthTagAcademyName', type: 'varbinary', length: 16, nullable: false })
  authTagAcademyName: Buffer;

  @Column({ name: 'PaymentStatus', type: 'boolean', nullable: false })
  paymentStatus: boolean;

  @Column({ name: 'StartMonth', type: 'date', nullable: false })
  startMonth: Date;

  @Column({ name: 'EndMonth', type: 'date', nullable: false })
  endMonth: Date;

  @OneToMany(() => Records, (examRecord) => examRecord.academy)
  examRecords: Records[];

  @OneToMany(() => User, (user) => user.academy)
  users: User[];
}