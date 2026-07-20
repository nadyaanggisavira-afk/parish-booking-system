import { IsIn } from 'class-validator';

export class UpdateFeedbackStatusDto {
  @IsIn(['new', 'read', 'in_progress', 'done'])
  status: 'new' | 'read' | 'in_progress' | 'done';
}
