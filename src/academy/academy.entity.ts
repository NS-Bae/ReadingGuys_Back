import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Records } from '../record/records.entity';
import { User } from '../users/users.entity';

@Entity( 'Academy' ) // 테이블 이름을 Academy로 설정
export class Academy {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  hashedAcademyId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  academyId: string;

  @Column({ type: 'varbinary', length: 255, nullable: false })
  encryptedAcademyName: Buffer;

  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivAcademyName: Buffer;

  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagAcademyName: Buffer;

  @Column({ type: 'boolean', nullable: false })
  paymentStatus: boolean;

  @Column({ type: 'date', nullable: false })
  startMonth: Date;

  @Column({ type: 'date', nullable: false })
  endMonth: Date;

  @OneToMany(() => Records, (examRecord) => examRecord.academy)
  examRecords: Records[];

  @OneToMany(() => User, (user) => user.academy)
  users: User[];
}