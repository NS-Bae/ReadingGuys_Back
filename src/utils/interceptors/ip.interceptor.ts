import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class IpInterceptor implements NestInterceptor
{
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any>
  {
    const req = context.switchToHttp().getRequest();

    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip;

    req.clientIp = ip;

    return next.handle();
  }
}