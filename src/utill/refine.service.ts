import { Academy } from "../academy/academy.entity";
import { User } from "../users/users.entity";
import { decryptionAcademyDto, decryptionUserDto, decryptionUserDetailDto, beforeDecryptionUserDetailDto } from "../dto/return.dto";
import { decryptionAES256GCM } from "./encryption.service";

export function refineAcademyData(raw: Academy): decryptionAcademyDto;
export function refineAcademyData(raw: Academy[]): decryptionAcademyDto[];
export function refineAcademyData(raw: Academy | Academy[]): decryptionAcademyDto | decryptionAcademyDto[]
{
  const decryptedData = (item: Academy) => ({
    hashedAcademyId: item.hashedAcademyId,
    academyName: decryptionAES256GCM(item.encryptedAcademyName, item.ivAcademyName, item.authTagAcademyName),
    paymentStatus: item.paymentStatus,
    startMonth: item.startMonth,
    endMonth:item.endMonth,
  });

  if(Array.isArray(raw))
  {
    return raw.map(decryptedData);
  }
  else
  {
    return decryptedData(raw);
  }
}

export function refineUserData(raw: User): decryptionUserDto;
export function refineUserData(raw: User[]): decryptionUserDto[];
export function refineUserData(raw: User | User[]): decryptionUserDto | decryptionUserDto[]
{
  const decryptedData = (item: User) => ({
    hashedUserId: item.hashedUserId,
    rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
    rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
    hashedAcademyId: item.hashedAcademyId,
    userType: item.userType,
    ok: item.ok,
  });

  if(Array.isArray(raw))
  {
    return raw.map(decryptedData);
  }
  else
  {
    return decryptedData(raw);
  }
}

export function refineUserDetailData(raw: beforeDecryptionUserDetailDto): decryptionUserDetailDto;
export function refineUserDetailData(raw: beforeDecryptionUserDetailDto[]): decryptionUserDetailDto[];
export function refineUserDetailData(raw: beforeDecryptionUserDetailDto | beforeDecryptionUserDetailDto[]): decryptionUserDetailDto | decryptionUserDetailDto[]
{
  const decryptedData = (item) => ({
    hashedUserId: item.hashedUserId,
    rawUserId: decryptionAES256GCM(item.encryptedUserId, item.ivUserId, item.authTagUserId),
    rawUserName: decryptionAES256GCM(item.encryptedUserName, item.ivUserName, item.authTagUserName),
    hashedAcademyId: item.hashedAcademyId,
    rawAcademyName: decryptionAES256GCM(item.encryptedAcademyName, item.ivAcademyName, item.authTagAcademyName),
    userType: item.userType,
    ok: item.ok,
  });

  if(Array.isArray(raw))
  {
    return raw.map(decryptedData);
  }
  else
  {
    return decryptedData(raw);
  }
}