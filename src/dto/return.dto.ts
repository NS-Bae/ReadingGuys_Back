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

export class beforeDecryptionUserDetailDto
{
  hashedUserId: string;
  hashedAcademyId: string;
  encryptedUserId: Buffer;
  ivUserId: Buffer;
  authTagUserId: Buffer;
  encryptedUserName: Buffer;
  ivUserName: Buffer;
  authTagUserName: Buffer;
  userType: UserType;
  ok: boolean;
  encryptedAcademyName: Buffer;
  ivAcademyName: Buffer;
  authTagAcademyName: Buffer;
}

export class decryptionUserDetailDto
{
  hashedUserId: string;
  rawUserId: string;
  rawUserName: string;
  hashedAcademyId: string;
  rawAcademyName: string;
  userType: UserType;
  ok: boolean;
}