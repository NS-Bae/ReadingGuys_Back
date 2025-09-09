import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Academy } from '../academy/academy.entity';
import { User } from '../users/users.entity';
import { Workbook } from '../workbook/workbooks.entity';

@Entity('ExamRecords')
export class Records {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  hashedAcademyID: string;

  @PrimaryColumn({ type: 'varchar', length: 20 })
  hashedUserID: string;

  @PrimaryColumn({ type: 'int' })
  workbookID: number;

  @PrimaryColumn({ type: 'datetime' })
  examDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  progressRate: number;

  @Column({ type: 'varbinary', length: 255 })
  encryptedRecordLink: Buffer;

  @Column({ type: 'varbinary', length: 12 })
  ivRecordLink: Buffer;

  @Column({ type: 'varbinary', length: 16 })
  authTagRecordLink: Buffer;

  // 관계 설정
  @ManyToOne(() => Academy, (academy) => academy.examRecords)
  @JoinColumn({ name: 'hashedAcademyID', referencedColumnName: 'hashedAcademyId' })
  academy: Academy;

  @ManyToOne(() => User, (user) => user.examRecords)
  @JoinColumn({ name: 'hashedUserId', referencedColumnName: 'hashedUserId' })
  user: User;

  @ManyToOne(() => Workbook, (workbook) => workbook.examRecords)
  @JoinColumn({ name: 'workbookId', referencedColumnName: 'workbookId' })
  workbook: Workbook;
}
