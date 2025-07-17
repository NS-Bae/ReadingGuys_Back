import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Academy } from '../academy/academy.entity';
import { User } from '../users/users.entity';
import { Workbook } from '../workbook/workbooks.entity';

@Entity('ExamRecords')
export class Records {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  AcademyID: string;

  @PrimaryColumn({ type: 'varchar', length: 20 })
  UserID: string;

  @PrimaryColumn({ type: 'int' })
  WorkbookID: number;

  @PrimaryColumn({ type: 'datetime' })
  ExamDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ProgressRate: number;

  @Column({ type: 'varchar', length: 255 })
  RecordLink: string;

  // 관계 설정
  @ManyToOne(() => Academy, (academy) => academy.examRecords)
  @JoinColumn({ name: 'AcademyID' })
  academy: Academy;

  @ManyToOne(() => User, (user) => user.examRecords)
  @JoinColumn({ name: 'UserID' })
  user: User;

  @ManyToOne(() => Workbook, (workbook) => workbook.examRecords)
  @JoinColumn({ name: 'WorkbookID' })
  workbook: Workbook;
}
