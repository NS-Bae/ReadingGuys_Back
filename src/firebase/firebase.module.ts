import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseController } from './firebase.controller'
import { TypeOrmModule } from "@nestjs/typeorm";
import { FcmDeviceToken } from "./fcmDeviceToken.entity";
import { User } from "../users/users.entity";

@Module({
  imports:[TypeOrmModule.forFeature([FcmDeviceToken, User])],
  providers : [FirebaseService],
  exports : [FirebaseService],
  controllers : [FirebaseController],
})

export class FirebaseModule {}