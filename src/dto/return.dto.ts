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

export class decryptionDto1
{
  hashedUserId: string;
  rawUserId: string;
  rawUserName: string;
  WorkbookName: string;
  ExamDate: Date;
  ProgressRate: number;
}

export class decryptionDto2
{
  WorkbookName: string;
  ExamDate: Date;
  ProgressRate: number;
  RecordLink: string;
}