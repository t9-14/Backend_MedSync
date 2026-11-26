import { IsString, Length, MaxLength } from 'class-validator';

export class UpdateProfileNameDto {
  @IsString() @Length(1, 150) @MaxLength(150) fullName!: string;
}
