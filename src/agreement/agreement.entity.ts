import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TermsTypes } from "../others/other.types";
import { User } from "../users/users.entity";


@Entity( 'TermsAgreement' )
@Index('idx_user_terms', ['hashedUserId', 'termsType'])
export class TermsAgreement {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

  @Column({ type: 'enum', enum: TermsTypes, nullable: false })
  termsType: TermsTypes;

  @Column({ type: 'varchar', length: 20, nullable: false })
  version: string;

  @Column({ type: 'boolean', nullable: false })
  agreed: boolean

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  agreedAt: Date;

  @ManyToOne(() => User, (user) => user.termsAgreements)
  @JoinColumn({ name: 'hashedUserId', referencedColumnName: 'hashedUserId' })
  user: User;
}