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
import { UserType } from '../others/other.types';
import { TermsAgreement } from '../agreement/agreement.entity';

@Entity('users') // 테이블 이름을 Users로 설정
export class User {
  @PrimaryColumn({ name: 'HashedUserID', type: 'varchar', length: 20 })
  hashedUserId: string;

  @Column({ name: 'EncryptedUserID', type: 'varbinary', length: 255, nullable: false })
  encryptedUserId: Buffer;

  @Column({ name: 'IVUserID', type: 'varbinary', length: 12, nullable: false })
  ivUserId: Buffer;

  @Column({ name: 'AuthTagUserId', type: 'varbinary', length: 16, nullable: false })
  authTagUserId: Buffer;

  @Column({ name: 'Password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword()
  {
    if(!this.password.startsWith('$2b$'))
    {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @Column({ name: 'EncryptedUserName', type: 'varbinary', length: 255, nullable: false })
  encryptedUserName: Buffer;

  @Column({ name: 'IVUserName', type: 'varbinary', length: 12, nullable: false })
  ivUserName: Buffer;

  @Column({ name: 'AuthTagUserName', type: 'varbinary', length: 16, nullable: false })
  authTagUserName: Buffer;

  @Column({ name: 'HashedAcademyID', type: 'varchar', length: 255, nullable: false })
  hashedAcademyId: string;

  @Column({
    name: 'UserType',
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  userType: UserType;

  @Column({ name: 'Ok', type: 'boolean', nullable: false })
  ok: boolean;
  
  //관계설정
  @OneToMany(() => Records, (examRecord) => examRecord.user)
  examRecords: Records[];

  @OneToMany(() => TermsAgreement, (termsAgreement) => termsAgreement.user)
  termsAgreements: TermsAgreement[];

  @ManyToOne(() => Academy, (academy) => academy.users , { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'HashedAcademyID', referencedColumnName: 'hashedAcademyId' })
  academy: Academy;
}
