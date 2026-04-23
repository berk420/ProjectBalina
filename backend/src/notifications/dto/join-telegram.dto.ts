import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinTelegramDto {
  @ApiProperty({ description: 'Phone number (e.g. +905xxxxxxxxx)' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
