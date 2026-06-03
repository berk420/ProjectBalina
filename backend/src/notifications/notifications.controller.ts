import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JoinTelegramDto } from './dto/join-telegram.dto';
import { TransfersService } from '../transfers/transfers.service';

@ApiTags('notifications')
@Controller('api')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly transfersService: TransfersService,
  ) {}

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
