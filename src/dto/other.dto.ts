import { IsBoolean, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UserType, TermsTypes } from '../others/other.types';

export class JWTPayloadDto
{
  hashedUserId: string;
  hashedAcademyId: string;
  userType: UserType;
  ok: boolean;
}

export class OneStudentDto
{
  data: string;
}

class UpdateTermsInnerDto
{
  type: TermsTypes;
  id: string;
}

export class UpdateTermsDto
{
  data: UpdateTermsInnerDto;
}

export class TermsAgreementDto
{
  @IsEnum(TermsTypes)
  termsType: TermsTypes;

  @IsBoolean()
  agreed: boolean;
}

export class RegisterFcmTokenDto
{
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token: string;
}