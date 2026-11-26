import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateHealthCenterDto {
  @IsString() @Length(2, 150) name!: string;
  @IsString() @Length(1, 150) barangay!: string;
  @IsOptional() @IsString() @MaxLength(40) contactNumber?: string;
}
