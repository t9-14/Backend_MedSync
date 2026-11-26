import { IsIn } from 'class-validator';

export class HealthCenterStatusDto {
  @IsIn(['active', 'inactive']) status!: 'active' | 'inactive';
}
