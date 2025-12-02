import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EventType } from "../others/other.types";


@Entity( 'eventlogs' )
export class EventLogs {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  id: string;

  @Column({ name: 'HashedUserID', type: 'varchar', length: 255, nullable: false })
  hashedUserId: string;

  @Column({ name: 'EventType', type: 'enum', enum: EventType, nullable: false })
  eventType: string;

  @Column({ name: 'EncrypteDeviceInfo', type: 'varbinary', length: 255, nullable: false })
  encryptedDeviceInfo: Buffer;

  @Column({ name: 'IVDeviceInfo', type: 'varbinary', length: 12, nullable: false })
  ivDeviceInfo: Buffer;

  @Column({ name: 'AuthTagDeviceInfo', type: 'varbinary', length: 16, nullable: false })
  authTagDeviceInfo: Buffer;

  @Column({ name: 'EncrypteIPAdress', type: 'varbinary', length: 255, nullable: false })
  encryptedIPAdress: Buffer;

  @Column({ name: 'IVIPAdress', type: 'varbinary', length: 12, nullable: false })
  ivIPAdress: Buffer;

  @Column({ name: 'AuthTagIPAdress', type: 'varbinary', length: 16, nullable: false })
  authTagIPAdress: Buffer;

  @Column({ name: 'EventTime', type: 'timestamp', nullable: false })
  eventTime: Date;
}