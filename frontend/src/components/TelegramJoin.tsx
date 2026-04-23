import React, { useState } from 'react';
import { joinTelegram } from '../services/api';

const TelegramJoin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inviteLink: string | null; message: string } | null>(null);

  const handleJoin = async () => {
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await joinTelegram(phoneNumber);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="telegram-join">
      <div className="telegram-header">
        <span className="telegram-icon">📱</span>
        <h3>Telegram Bildirimleri</h3>
      </div>
      <p className="telegram-desc">
        Büyük USDT transferlerinden anlık haberdar olmak için Telegram grubuna katılın.
      </p>
      <div className="telegram-input-row">
        <input
          type="tel"
          placeholder="+905xxxxxxxxx"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          className="phone-input"
          disabled={loading}
        />
        <button
          onClick={handleJoin}
          disabled={loading || !phoneNumber.trim()}
          className="join-btn"
        >
          {loading ? 'Yükleniyor...' : 'Bildirimler için Telegram grubuna katıl'}
        </button>
      </div>
      {result && (
        <div className={`telegram-result ${result.inviteLink ? 'success' : 'error'}`}>
          <p>{result.message}</p>
          {result.inviteLink && (
            <a
              href={result.inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="invite-link"
            >
              Gruba Katıl →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default TelegramJoin;
