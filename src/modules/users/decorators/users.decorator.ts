import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    let role = 'Staff';
    let id = req['user'].roles[0].userId;
    for (const element of req['user'].roles) {
      if (element.role.name === 'Admin') {
        role = 'Admin';
        break;
      }
    }
    return { role, id };
  },
);
