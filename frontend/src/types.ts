export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: string;
  amountFormatted: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  timestamp: number;
  read: boolean;
}
