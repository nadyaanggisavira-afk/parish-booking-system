import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

// Submitted as multipart/form-data (optional PDF attached), so scalar fields
// arrive as strings — hence the boolean transform below.
export class CreateBookingDto {
  @IsString()
  roomId: string;

  @IsString()
  @MinLength(2)
  requesterName: string;

  @IsString()
  @MinLength(6)
  requesterContact: string; // phone or email

  @IsString()
  @IsOptional()
  timPelayanan?: string;

  @IsString()
  @MinLength(5)
  purpose: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  peminjamanBerkala?: boolean;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
