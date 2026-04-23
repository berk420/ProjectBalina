import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly groupChatId: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.groupChatId = process.env.TELEGRAM_CHAT_ID_GROUP || '';
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  async sendGroupMessage(text: string): Promise<boolean> {
    if (!this.token || !this.groupChatId) {
      this.logger.warn('Telegram credentials not configured');
      return false;
    }

    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: this.groupChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      this.logger.log('Telegram group message sent');
      return true;
    } catch (err) {
      this.logger.error('Telegram send failed', err.response?.data || err.message);
      return false;
    }
  }

  async sendDirectMessage(chatId: string, text: string): Promise<boolean> {
    if (!this.token) return false;

    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      });
      return true;
    } catch (err) {
      this.logger.error('Telegram DM failed', err.response?.data || err.message);
      return false;
    }
  }

  async createInviteLink(): Promise<string | null> {
    if (!this.token || !this.groupChatId) return null;

    try {
      const resp = await axios.post(`${this.baseUrl}/createChatInviteLink`, {
        chat_id: this.groupChatId,
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 3600 * 24,
      });
      return resp.data?.result?.invite_link || null;
    } catch (err) {
      this.logger.error('Telegram invite link failed', err.response?.data || err.message);
      return null;
    }
  }

  formatWhaleAlert(from: string, to: string, amount: string, txHash: string): string {
    const shortFrom = `${from.slice(0, 6)}...${from.slice(-4)}`;
    const shortTo = `${to.slice(0, 6)}...${to.slice(-4)}`;
    const shortTx = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

    return (
      `🐳 <b>USDT Büyük Transfer Tespit Edildi!</b>\n\n` +
      `💰 <b>Miktar:</b> ${amount} USDT\n` +
      `📤 <b>Gönderen:</b> <code>${shortFrom}</code>\n` +
      `📥 <b>Alıcı:</b> <code>${shortTo}</code>\n` +
      `🔗 <b>TX Hash:</b> <code>${shortTx}</code>\n` +
      `🔍 <a href="https://etherscan.io/tx/${txHash}">Etherscan'da Görüntüle</a>`
    );
  }
}
