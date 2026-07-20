import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Usage: @UseGuards(JwtAuthGuard) on any controller/route that only
// the secretariat/admin should reach (approve, reject, feedback inbox, etc).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
