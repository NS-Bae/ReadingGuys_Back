import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";
import { TermsStatus, TermsTypes } from "../others/other.types";


@Entity( 'terms' )
export class Terms {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'enum', enum: TermsTypes })
  termsType: TermsTypes;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'varbinary', length: 1024, nullable: false })
  encryptedStorageLink: Buffer;
  
  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivStorageLink: Buffer;
  
  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagStorageLink: Buffer;

  @Column({ type: 'datetime', nullable: false, name: 'Effective_date' })
  effectiveDate: Date;

  @Column({ type: 'enum', enum: TermsStatus, nullable: false, default: TermsStatus.비활성화 })
  status: TermsStatus;

  @Column({ type: 'varchar', length: 100, nullable: false })
  createdBy: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;
}