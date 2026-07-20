import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackType, FeedbackStatus } from '@prisma/client';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
import { ReplyFeedbackDto } from './dto/reply-feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  // Umat (logged in): submit a suggestion or report a violation.
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateFeedbackDto, @Req() req: { user: JwtPayload }) {
    return this.feedbackService.create(dto, req.user.sub);
  }

  // Admin-only: the secretariat's inbox.
  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query('type') type?: FeedbackType, @Query('status') status?: FeedbackStatus) {
    return this.feedbackService.findAll(type, status);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateFeedbackStatusDto) {
    return this.feedbackService.updateStatus(id, dto);
  }

  @UseGuards(AdminGuard)
  @Post(':id/reply')
  reply(@Param('id') id: string, @Body() dto: ReplyFeedbackDto) {
    return this.feedbackService.reply(id, dto);
  }
}
