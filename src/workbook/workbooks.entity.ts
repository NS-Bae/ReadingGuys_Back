import { Entity, Column, PrimaryColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Records } from '../record/records.entity';
import { Difficulty } from '../others/other.types';

@Entity( 'Workbooks' )
export class Workbook {
  @PrimaryGeneratedColumn()
  workbookId: number;

  @Column({ type: 'boolean', nullable: false })
  isPaid: boolean;

  @Column({
    type: 'enum',
    enum: Difficulty,
    nullable: false,
  })
  Difficulty: Difficulty;

  @Column({ type: 'varchar', length: 255, nullable: false })
  workbookName: string;

  @Column({ type: 'date', nullable: false })
  releaseMonth: Date;

  @Column({ type: 'varbinary', length: 255, nullable: false })
  encryptedStorageLink: Buffer;

  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivStorageLink: Buffer;

  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagStorageLink: Buffer;

  @OneToMany(() => Records, (examRecord) => examRecord.workbook)
  examRecords: Records[];
}