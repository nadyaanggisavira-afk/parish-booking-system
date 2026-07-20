import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PushService } from './push.service';
import { SubscribePushDto } from './dto/subscribe-push.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  // Public: the client needs this to build a PushSubscription.
  @Get('public-key')
  publicKey() {
    return { publicKey: this.pushService.publicKey };
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  subscribe(@Body() dto: SubscribePushDto, @Req() req: { user: JwtPayload }) {
    return this.pushService.subscribe(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('subscribe')
  unsubscribe(@Body() body: { endpoint: string }) {
    return this.pushService.unsubscribe(body.endpoint);
  }
}
