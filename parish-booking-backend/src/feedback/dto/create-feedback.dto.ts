import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsIn(['suggestion', 'violation_report'])
  type: 'suggestion' | 'violation_report';

  // Suggestions carry a category; violation reports carry a room reference.
  @IsIn(['fasilitas_ruangan', 'prosedur_booking', 'kegiatan_paroki', 'lainnya'])
  @IsOptional()
  category?: 'fasilitas_ruangan' | 'prosedur_booking' | 'kegiatan_paroki' | 'lainnya';

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  relatedBookingId?: string;

  @IsString()
  @IsOptional()
  reporterName?: string;

  @IsEmail()
  @IsOptional()
  email?: string; // reply target

  @IsString()
  @MinLength(5)
  message: string;
}
