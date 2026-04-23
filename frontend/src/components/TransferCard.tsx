import React from 'react';
import { Transfer } from '../types';

interface Props {
  transfer: Transfer;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h önce`;
  return new Date(timestamp).toLocaleDateString('tr-TR');
}

const TransferCard: React.FC<Props> = ({ transfer }) => {
  return (
    <div className="transfer-card">
      <div className="transfer-header">
        <span className="whale-icon">🐳</span>
        <span className="transfer-amount">{transfer.amountFormatted} USDT</span>
        <span className="transfer-time">{timeAgo(transfer.timestamp)}</span>
      </div>
      <div className="transfer-details">
        <div className="address-row">
          <span className="label">Gönderen</span>
          <a
            href={`https://etherscan.io/address/${transfer.from}`}
            target="_blank"
            rel="noopener noreferrer"
            className="address"
          >
            {shortAddr(transfer.from)}
          </a>
        </div>
        <div className="address-row">
          <span className="label">Alıcı</span>
          <a
            href={`https://etherscan.io/address/${transfer.to}`}
            target="_blank"
            rel="noopener noreferrer"
            className="address"
          >
            {shortAddr(transfer.to)}
          </a>
        </div>
        <div className="address-row">
          <span className="label">TX Hash</span>
          <a
            href={`https://etherscan.io/tx/${transfer.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-hash"
          >
            {shortAddr(transfer.txHash)}
          </a>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
