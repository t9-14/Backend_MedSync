import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class SetCenterMembershipDto {
  @IsUUID() centerId!: string;
  @IsUUID() userId!: string;
  @IsIn(['manager', 'staff']) role!: 'manager' | 'staff';
  @IsOptional() @IsIn(['active', 'suspended']) status?: 'active' | 'suspended';
}
