import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";
import { TermsStatus, TermsTypes } from "../others/other.types";


@Entity( 'Terms' )
export class Terms {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'enum', enum: TermsTypes })
  termsType: TermsTypes;

  @Column({ type: 'varchar', length: 20, nullable: false })
  version: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  storageLink: string;

  @Column({ type: 'datetime', nullable: false, name: 'Effective_date' })
  effectiveDate: Date;

  @Column({ type: 'enum', enum: TermsStatus, nullable: false, default: TermsStatus.활성화 })
  status: TermsStatus;

  @Column({ type: 'varchar', length: 100, nullable: false })
  createdBy: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;
}