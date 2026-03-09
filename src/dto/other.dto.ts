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