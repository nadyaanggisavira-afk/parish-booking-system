import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class QueryBookingsDto {
  @IsIn(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'approved' | 'rejected';

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
