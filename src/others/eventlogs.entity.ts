import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EventType } from "./other.types";


@Entity( 'EventLogs' )
export class EventLogs {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  hashedAcademyId: string;

  @Column({ type: 'enum', enum: EventType, nullable: false })
  eventType: string;

  @Column({ type: 'varbinary', length: 255, nullable: false })
  encryptedDeviceInfo: Buffer;

  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivDeviceInfo: Buffer;

  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagDeviceInfo: Buffer;

  @Column({ type: 'varbinary', length: 255, nullable: false })
  encryptedIPAdress: Buffer;

  @Column({ type: 'varbinary', length: 12, nullable: false })
  ivIPAdress: Buffer;

  @Column({ type: 'varbinary', length: 16, nullable: false })
  authTagIPAdress: Buffer;

  @Column({ type: 'timestamp', nullable: false })
  eventTime: Date;
}