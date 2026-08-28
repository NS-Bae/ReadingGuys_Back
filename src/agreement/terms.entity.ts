import { PrimaryGeneratedColumn, Column, Entity, Index } from "typeorm";
import { TermsStatus, TermsTypes } from "../others/other.types";


@Entity( 'terms' )
@Index('UQ_TERMS_TYPE_VERSION',
  [ 'termsType', 'Version' ],
  { unique: true },
 )
export class Terms {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint' })
  id: number;

  @Column({ name: 'TermsType', type: 'enum', enum: TermsTypes })
  termsType: TermsTypes;

  @Column({ name: 'Title', type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ name: 'Version', type: 'varchar', length: 45, nullable: false })
  Version: string;

  @Column({ name: 'EncryptedStorageLink', type: 'varbinary', length: 1024, nullable: false })
  encryptedStorageLink: Buffer;
  
  @Column({ name: 'IVStorageLink', type: 'varbinary', length: 12, nullable: false })
  ivStorageLink: Buffer;
  
  @Column({ name: 'AuthTagStorageLink', type: 'varbinary', length: 16, nullable: false })
  authTagStorageLink: Buffer;

  @Column({ name: 'Effective_date', type: 'datetime', nullable: false })
  effectiveDate: Date;

  @Column({ name: 'Status', type: 'enum', enum: TermsStatus, nullable: false, default: TermsStatus.비활성화 })
  status: TermsStatus;

  @Column({ name: 'CreatedBy', type: 'varchar', length: 100, nullable: false })
  createdBy: string;

  @Column({ name: 'CreatedAt', type: 'datetime', nullable: false })
  createdAt: Date;
}