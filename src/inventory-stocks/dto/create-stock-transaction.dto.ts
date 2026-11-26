import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateStockTransactionDto {
  @IsUUID() centerId!: string;
  @IsUUID() batchId!: string;
  @IsIn(['stock_in', 'stock_out', 'adjustment_in', 'adjustment_out']) transactionType!: string;
  @IsInt() @Min(1) @Max(10000000) quantity!: number;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
