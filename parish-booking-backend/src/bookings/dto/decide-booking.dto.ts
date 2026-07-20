import { IsOptional, IsString } from 'class-validator';

export class DecideBookingDto {
  @IsString()
  @IsOptional()
  adminNote?: string;
}
