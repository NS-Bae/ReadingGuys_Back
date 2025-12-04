import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TermsTypes } from "../others/other.types";
import { User } from "../users/users.entity";


@Entity( 'TermsAgreement' )
@Index('idx_user_terms', ['hashedUserId', 'termsType'])
export class TermsAgreement {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint' })
  id: string;

  @Column({ name: 'HashedUserID', type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

  @Column({ name: 'TermsType', type: 'enum', enum: TermsTypes, nullable: false })
  termsType: TermsTypes;

  @Column({ name: 'Version', type: 'varchar', length: 10, nullable: false })
  version: string;

  @Column({ name: 'Agreed', type: 'boolean', nullable: false })
  agreed: boolean

  @Column({ name: 'AgreedAt', type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  agreedAt: Date;

  @ManyToOne(() => User, (user) => user.termsAgreements)
  @JoinColumn({ name: 'HashedUserID', referencedColumnName: 'hashedUserId' })
  user: User;
}