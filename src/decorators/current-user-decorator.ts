import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserInterface } from 'src/interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): IUserInterface => {
    const request: Request & { user: IUserInterface } = context
      .switchToHttp()
      .getRequest();

    return {
      _id: request?.user?._id,
      username: request?.user?.username,
      displayName: request?.user?.displayName,
    };
  },
);
