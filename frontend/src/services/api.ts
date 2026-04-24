import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL ?? 'https://balinaapi.testprocess.com.tr';

const api = axios.create({ baseURL: API_URL });

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
}

export async function registerToken(token: string): Promise<boolean> {
  try {
    await api.post('/api/register-token', { token });
    return true;
  } catch (err) {
    console.error('Register token failed:', err);
    return false;
  }
}

export async function getRecentTransfers(limit = 20) {
  try {
    const resp = await api.get(`/api/transfers?limit=${limit}`);
    return resp.data;
  } catch {
    return [];
  }
}

export async function joinTelegram(phoneNumber: string) {
  try {
    const resp = await api.post('/api/join-telegram', { phoneNumber });
    return resp.data;
  } catch (err: any) {
    return { inviteLink: null, message: err.response?.data?.message || 'Hata oluştu' };
  }
}
