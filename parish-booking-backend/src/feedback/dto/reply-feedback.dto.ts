import { IsString, MinLength } from 'class-validator';

export class ReplyFeedbackDto {
  @IsString()
  @MinLength(2)
  message: string; // the admin's reply body, sent as an email
}
