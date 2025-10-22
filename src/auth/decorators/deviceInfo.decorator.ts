import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const DeviceInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const deviceInfoHeader = request.headers['x-device-info'];

    return { deviceInfo: deviceInfoHeader || null };
  },
);
