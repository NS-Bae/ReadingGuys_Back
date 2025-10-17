import { UserType } from '../others/other.types';

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