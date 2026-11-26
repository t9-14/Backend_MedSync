import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateMedicineDto {
  @IsString() @Length(2, 150) genericName!: string;
  @IsString() @Length(1, 80) strength!: string;
  @IsString() @Length(1, 80) dosageForm!: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsString() @MaxLength(30) unit?: string;
}
