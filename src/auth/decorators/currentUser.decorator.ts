import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if(!user)
    {
      return null;
    }
    if(!data)
    {
      return user;
    }

    if(typeof data === 'string')
    {
      return user[data];
    }
    if(Array.isArray(data))
    {
      const selected: Record<string, any> = {};

      for(const key of data)
      {
        selected[key] = user[key];
      }
      return selected;
    }
  },
)