import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt')
{
  handleRequest(error, user, info)
  {
    if(error || !user)
    {
      throw error || new UnauthorizedException('인증실패');
    }
    return user;
  }
}