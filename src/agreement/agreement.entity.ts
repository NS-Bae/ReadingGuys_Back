import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TermsTypes } from "../others/other.types";
import { User } from "src/users/users.entity";


@Entity( 'TermsAgreement' )
export class TermsAgreement {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

  @Column({ type: 'enum', enum: TermsTypes, nullable: false })
  termTypes: TermsTypes;

  @Column({ type: 'varchar', length: 10, nullable: false })
  version: string;

  @Column({ type: 'boolean', nullable: false })
  agreed: boolean

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  agreedAt: Date;

  @ManyToOne(() => User, (user) => user.termsAgreements)
  @JoinColumn({ name: 'hashedUserId', referencedColumnName: 'hashedUserId' })
  user: User;
}