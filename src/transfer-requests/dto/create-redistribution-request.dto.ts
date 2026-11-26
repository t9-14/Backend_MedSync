import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class RedistributionItemDto {
  @IsUUID() batchId!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(10000000) quantity!: number;
}

export class CreateRedistributionRequestDto {
  @IsUUID() sourceCenterId!: string;
  @IsUUID() destinationCenterId!: string;
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => RedistributionItemDto)
  items!: RedistributionItemDto[];
}
