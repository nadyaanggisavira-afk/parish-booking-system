import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsString()
  @IsOptional()
  facilities?: string; // freetext, e.g. "Proyektor, AC, sound system"

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
