import { Entity, Column, PrimaryColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Records } from '../record/records.entity';
import { Difficulty } from '../others/other.types';

@Entity( 'workbooks' )
export class Workbook {
  @PrimaryGeneratedColumn({ name: 'WorkbookID' })
  workbookId: number;

  @Column({ name: 'IsPaid', type: 'boolean', nullable: false })
  isPaid: boolean;

  @Column({
    name: 'Difficulty',
    type: 'enum',
    enum: Difficulty,
    nullable: false,
  })
  Difficulty: Difficulty;

  @Column({ name: 'WorkbookName', type: 'varchar', length: 255, nullable: false })
  workbookName: string;

  @Column({ name: 'ReleaseMonth', type: 'date', nullable: false })
  releaseMonth: Date;

  @Column({ name: 'EncryptedStorageLink', type: 'varbinary', length: 1024, nullable: false })
  encryptedStorageLink: Buffer;

  @Column({ name: 'IVStorageLink', type: 'varbinary', length: 12, nullable: false })
  ivStorageLink: Buffer;

  @Column({ name: 'AuthTagStorageLink', type: 'varbinary', length: 16, nullable: false })
  authTagStorageLink: Buffer;

  @OneToMany(() => Records, (examRecord) => examRecord.workbook)
  examRecords: Records[];
}