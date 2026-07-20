import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { DecideBookingDto } from './dto/decide-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { uploadsDir } from '../config/uploads';

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB (Surat Permohonan limit)

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // Umat (logged in): submit a booking request, optionally with a PDF letter.
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('suratPermohonan', {
      storage: diskStorage({
        destination: uploadsDir(),
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: MAX_PDF_BYTES },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Surat Permohonan harus berformat PDF'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateBookingDto,
    @Req() req: { user: JwtPayload },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const url = file ? `/uploads/${file.filename}` : undefined;
    return this.bookingsService.create(dto, req.user.sub, url);
  }

  // Umat: my own bookings ("Booking Saya").
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Req() req: { user: JwtPayload }) {
    return this.bookingsService.findMine(req.user.sub);
  }

  // Admin: list/filter bookings (e.g. ?status=pending for the review queue).
  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query() query: QueryBookingsDto) {
    return this.bookingsService.findAll(query);
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: DecideBookingDto,
    @Req() req: { user: JwtPayload },
  ) {
    return this.bookingsService.approve(id, req.user.sub, dto);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: DecideBookingDto,
    @Req() req: { user: JwtPayload },
  ) {
    return this.bookingsService.reject(id, req.user.sub, dto);
  }
}
