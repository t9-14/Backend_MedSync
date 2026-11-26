import { IsIn } from 'class-validator';

export class RedistributionActionDto {
  @IsIn(['approve', 'reject', 'cancel', 'fulfill']) action!: 'approve' | 'reject' | 'cancel' | 'fulfill';
}
