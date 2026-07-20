import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from './jwt.strategy';

// Extends the JWT auth guard: first validates the token (so an unauthenticated
// caller still gets 401), then requires role === 'admin' (else 403).
@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authed = (await super.canActivate(context)) as boolean;
    if (!authed) return false;

    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
