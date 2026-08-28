import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseController } from './firebase.controller'
import { TypeOrmModule } from "@nestjs/typeorm";
import { FcmDeviceToken } from "./fcmDeviceToken.entity";

@Module({
  imports:[TypeOrmModule.forFeature([FcmDeviceToken])],
  providers : [FirebaseService],
  exports : [FirebaseService],
  controllers : [FirebaseController],
})

export class FirebaseModule {}