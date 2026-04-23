import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JoinTelegramDto } from './dto/join-telegram.dto';
import { TransfersService } from '../transfers/transfers.service';

@ApiTags('notifications')
@Controller('api')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly transfersService: TransfersService,
  ) {}

  @Post('register-token')
  @ApiOperation({ summary: 'Register FCM device token for whale alerts' })
  async registerToken(@Body() dto: RegisterTokenDto) {
    return this.notificationsService.registerToken(dto.token);
  }

  @Delete('unregister-token')
  @ApiOperation({ summary: 'Unregister FCM device token' })
  async unregisterToken(@Body() dto: RegisterTokenDto) {
    return this.notificationsService.unregisterToken(dto.token);
  }

  @Post('join-telegram')
  @ApiOperation({ summary: 'Get Telegram group invite link' })
  async joinTelegram(@Body() dto: JoinTelegramDto) {
    return this.notificationsService.getTelegramInviteLink(dto.phoneNumber);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get recent whale transfers' })
  getTransfers(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 20;
    return this.transfersService.findRecent(n);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
