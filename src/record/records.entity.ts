import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Academy } from '../academy/academy.entity';
import { User } from '../users/users.entity';
import { Workbook } from '../workbook/workbooks.entity';

@Entity('examrecords')
export class Records {
  @PrimaryColumn({ name: 'HashedAcademyId', type: 'varchar', length: 255 })
  hashedAcademyId: string;

  @PrimaryColumn({ name: 'HashedUserId', type: 'varchar', length: 20 })
  hashedUserId: string;

  @Column({ name: 'WorkbookId', type: 'int', nullable: true })
  workbookId: number;

  @PrimaryColumn({ name: 'ExamDate', type: 'datetime' })
  examDate: Date;

  @Column({ name: 'ProgressRate', type: 'decimal', precision: 5, scale: 2 })
  progressRate: number;

  @Column({ name: 'EncryptedRecordLink', type: 'varbinary', length: 1024 })
  encryptedRecordLink: Buffer;

  @Column({ name: 'IVRecordLink', type: 'varbinary', length: 12 })
  ivRecordLink: Buffer;

  @Column({ name: 'AuthTagRecordLink', type: 'varbinary', length: 16 })
  authTagRecordLink: Buffer;

  // 관계 설정
  @ManyToOne(() => Academy, (academy) => academy.examRecords)
  @JoinColumn({ name: 'HashedAcademyId', referencedColumnName: 'hashedAcademyId' })
  academy: Academy;

  @ManyToOne(() => User, (user) => user.examRecords)
  @JoinColumn({ name: 'HashedUserId', referencedColumnName: 'hashedUserId' })
  user: User;

  @ManyToOne(() => Workbook, (workbook) => workbook.examRecords, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'WorkbookId', referencedColumnName: 'workbookId' })
  workbook?: Workbook | null;
}
