import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TermsTypes } from "../others/other.types";
import { User } from "../users/users.entity";


@Entity( 'TermsAgreement' )
@Index('idx_user_terms', ['hashedUserId', 'termsType'])
export class TermsAgreement {
<<<<<<< HEAD
  @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint' })
  id: string;
=======
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;
>>>>>>> 7ca3b6ce1ed9d640b63e3deb0f695ac97bcab744

  @Column({ name: 'HashedUserID', type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

<<<<<<< HEAD
  @Column({ name: 'TermsType', type: 'enum', enum: TermsTypes, nullable: false })
  termTypes: TermsTypes;

  @Column({ name: 'Version', type: 'varchar', length: 10, nullable: false })
=======
  @Column({ type: 'enum', enum: TermsTypes, nullable: false })
  termsType: TermsTypes;

  @Column({ type: 'varchar', length: 20, nullable: false })
>>>>>>> 7ca3b6ce1ed9d640b63e3deb0f695ac97bcab744
  version: string;

  @Column({ name: 'Agreed', type: 'boolean', nullable: false })
  agreed: boolean

  @Column({ name: 'AgreedAt', type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  agreedAt: Date;

  @ManyToOne(() => User, (user) => user.termsAgreements)
  @JoinColumn({ name: 'HashedUserID', referencedColumnName: 'hashedUserId' })
  user: User;
}