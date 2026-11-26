import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Length, Max, MaxLength, Min } from 'class-validator';

export class CreateMedicineBatchDto {
  @IsUUID() centerId!: string;
  @IsUUID() medicineId!: string;
  @IsString() @Length(1, 80) lotNumber!: string;
  @IsDateString() expirationDate!: string;
  @IsOptional() @IsInt() @Min(0) @Max(10000000) initialQuantity?: number;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
