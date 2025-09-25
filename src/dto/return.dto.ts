import { UserType } from "../others/other.types";

export class decryptionAcademyDto
{
  hashedAcademyId: string;
  academyName: string;
  paymentStatus: boolean;
  startMonth: Date;
  endMonth:Date;
}

export class decryptionUserDto
{
  hashedUserId: string;
  rawUserId: string;
  rawUserName: string;
  hashedAcademyId: string;
  userType: UserType;
  ok: boolean;
}