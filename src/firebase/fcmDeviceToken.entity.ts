import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('fcmdevicetokens')
@Index('UQ_FCM_TOKEN', ['token'], {unique: true})
@Index('IDX_FCM_USER', ['hashedUserId'])
@Index('IDX_FCM_ACTIVE', ['isActive'])
export class FcmDeviceToken
{
  @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint' })
  id: string;

  @Column({ name: 'HashedUserID', type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

  @Column({ name: 'Token', type: 'varchar', length: 512, nullable: false })
  token: string;

  @Column({ name: 'IsActive', type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ name: 'LastSeenAt', type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  lastSeenAt: Date;

  @CreateDateColumn({ name: 'CreatedAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt', type: 'timestamp' })
  updatedAt: Date;
}