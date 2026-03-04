import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AgencyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role: UserRole } }>();
    if (request.user?.role !== UserRole.AGENCY) {
      throw new ForbiddenException('Access restricted to agencies');
    }
    return true;
  }
}
