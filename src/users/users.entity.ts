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

export enum UserType {
  관리자 = '관리자',
  교사 = '교사',
  학생 = '학생',
}

@Entity('Users') // 테이블 이름을 Users로 설정
export class User {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Column({ type: 'varchar', length: 100, nullable: false })
  userName: string;

  @Column({ type: 'varchar', length: 255 })
  AcademyID: string;

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

  @ManyToOne(() => Academy, (academy) => academy.users , { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'AcademyID' })
  academy: Academy;
}
