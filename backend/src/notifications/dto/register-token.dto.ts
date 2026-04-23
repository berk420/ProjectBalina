import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTokenDto {
  @ApiProperty({ description: 'FCM device token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
