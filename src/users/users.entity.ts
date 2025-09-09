import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Academy } from '../academy/academy.entity';
import { Records } from '../record/records.entity';
import { UserType } from 'src/others/other.types';
import { TermsAgreement } from '../agreement/agreement.entity';

@Entity('Users') // 테이블 이름을 Users로 설정
export class User {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  hashedUserId: string;

  @Column({ type: 'varbinary', length: 255, nullable: false })
  encryptedUserId: Buffer;

  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivUserId: Buffer;

  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagUserId: Buffer;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ type: 'varbinary', length: 255, nullable: false })
  encryptedUserName: Buffer;

  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivUserName: Buffer;

  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagUserName: Buffer;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashedAcademyId: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  userType: UserType;

  @Column({ type: 'boolean', nullable: false })
  ok: boolean;
  
  //관계설정
  @OneToMany(() => Records, (examRecord) => examRecord.user)
  examRecords: Records[];

  @OneToMany(() => TermsAgreement, (termsAgreement) => termsAgreement.user)
  termsAgreements: TermsAgreement[];

  @ManyToOne(() => Academy, (academy) => academy.users , { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hashedAcademyId', referencedColumnName: 'hashedAcademyId' })
  academy: Academy;
}
